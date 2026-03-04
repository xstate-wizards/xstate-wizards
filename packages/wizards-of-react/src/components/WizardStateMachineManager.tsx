import React, { Component, useEffect, useState } from "react";
import { useMachine, useSelector } from "@xstate/react";
import { ID_GENERAL, resolveText } from "@xstate-wizards/spells";

import { WizardStateViewer } from "./WizardStateViewer";
import { WizardWrap } from "./layout/WizardWrap";
import { WizardLocaleProvider, useWizardLocale } from "./WizardLocaleContext";
import { logger } from "../wizardDebugger";
import { TWizardStateMachineManagerProps } from "../types";

/**
 * WizardStateMachineManager
 * The component that actually runs the interview, and when done tells <WizardRunner /> most likely.
 * One critical usage pattern for xstate in these interviews is that there are never parallel states. We only show 1 at a time.
 * If we do parallel, our drilling machine look-up for nested machines breaks.
 *
 * Pt.1 - WizardStateMachineManager
 * <WizardStateMachineManager /> re-renders on every machine state change. Often this renders the <WizardStateViewer/> interface with its content.
 * But sometimes, it may be presented with an invoked nested machine to resolve.
 * It also triggers API calls to save progress and interview session state.
 * It also handles the option for wrapping the setting the UI up in the full-screen mode w/ header+progress bar
 * Because React doesn't have hooks for catching, we actually export it wrapped as a class <WizardStateMachineManagerWithCatch />, so we can pass onError back up
 *
 * Pt.2 - NestedMachineNode
 * <NestedMachineNode /> handles drilling down for the farther down child when nested machines are encountered.
 * Since we never should write parallel states, we can easily recursively drill into actor children w/ getChildActor.
 * Even though we're drilling down these actors, and using them for new state/meta, the reference to the top most machine is preserved
 * and updates, and final states being reached will still be recognized by the overall machine
 *
 */

// getChildActor - Function for recursively going through an actor and finding the deepest child actor
// v5: uses snapshot.children (plain object) instead of interpreter.children (Map)
function getChildActor(actorRef) {
  const snapshot = actorRef.getSnapshot();
  const children = snapshot?.children ?? {};
  const childKeys = Object.keys(children);

  if (childKeys.length > 1) {
    throw new Error(
      "getChildActor: More than 1 child was found. DO NOT USE PARALLEL NESTED MACHINES FOR INTERVIEWS"
    );
  }

  if (childKeys.length === 1) {
    const child = children[childKeys[0]];
    // v5: duck-type check replaces instanceof Interpreter
    if (child && typeof child.getSnapshot === "function") {
      return getChildActor(child);
    }
  }

  // If no child exists, return the current actor
  return actorRef;
}

// <NestedMachineNode /> - After grabbing the deepest child actor, our interview state/content is driven by that machine
const NestedMachineNode = (props) => {
  // SETUP
  const [, , topMostMachineActorRef] = props.machine;
  // Drill down for the childmost state node
  const childActorRef = getChildActor(topMostMachineActorRef);
  // ON MOUNT: subscribe to machine/actor and pass back up state events
  useEffect(() => {
    if (!childActorRef) return;
    const subscription = childActorRef.subscribe((snapshot) => {
      if (typeof props.onMachineChange === "function") props?.onMachineChange?.(snapshot);
    });
    return subscription.unsubscribe;
  }, [childActorRef]);
  // v5: useSelector reads snapshot from an existing actorRef (useActor expects logic, not a ref)
  const state = useSelector(childActorRef, (snapshot) => snapshot) as any;
  if (!childActorRef || !state) return null;
  const send = childActorRef.send;
  // v5: state.getMeta() replaces state.meta
  const meta = typeof state.getMeta === "function" ? state.getMeta() : (state.meta || {});
  const stateMeta = meta[Object.keys(meta).find((k) => k.includes(state.value as string))];
  // If we're in a done transition, we don't have any content to render. Just return null and let it resolve
  // v5: snapshot.status === "done" replaces state.done
  if (state.status === "done") return null;
  // RENDER
  return (
    <WizardStateViewer
      key={state.value as string}
      meta={stateMeta}
      state={state}
      transition={send}
      machineMeta={props.machineMeta}
      serializations={props.serializations}
      navigate={props.navigate}
    />
  );
};

// <WizardStateMachineManager /> - The Key Component. Manages state changes, session API calls, communicating to <WizardRunner />
const WizardStateMachineManagerWithoutCatch = (props: TWizardStateMachineManagerProps) => {
  const { useNavigationBlocker } = props;
  const locale = useWizardLocale();

  const machine = useMachine(props.machine);
  const [state, send, actorRef] = machine;

  // v5: state.getMeta() replaces state.meta
  // Fallback for environments where duplicate xstate instances produce snapshots without getMeta
  const allMeta = typeof state.getMeta === "function" ? state.getMeta() : (state.meta || {});
  // @ts-ignore
  const stateMeta = allMeta[Object.keys(allMeta).find((k) => k.includes(state.value))] || {};
  // v5: machine-level meta is now in context.__machineMeta
  const machineMeta = state.context?.__machineMeta;
  const [progressPercentage, setProgressPercentage] = useState(stateMeta.progress);
  const [sections, setSections] = useState(machineMeta?.sectionsBar);

  // Prevent user navigations while the machine state is not considered "done"
  // (if the machine is configured to skip the blocker, or the state is done, let anything happen)
  // v5: state.status === "done" replaces state.done
  const enableNavigationBlocker = !machineMeta?.skipNavigationBlocker && state.status !== "done";
  // Expect a navigation blocker like react-router v5 useBlocker passed in
  useNavigationBlocker?.(
    (params) => {
      logger.info("Navigation Blocker (WizardStateMachineManager):", params);
      const { retry, action, location: newLocation } = params;
      // if this was a "Back" browser event, and the interview has a back button
      // present, stay blocked and click "back" button instead.
      const interviewBackButton =
        typeof document !== "undefined" && document.querySelector('button[data-xw="menu-back-btn"]');
      if (action === "POP" && interviewBackButton) {
        // @ts-ignore
        interviewBackButton?.click?.();
        return; // stay blocked
      }
      // allow if we're navigating away with an explicit "skipConfirm"
      if (action === "PUSH" && newLocation?.state?.skipConfirm) {
        retry();
        return;
      }
      // otherwise, all other transitions (page reload, closing the page,
      // back-button-nav-to-outside-interview, etc) should require a user confirmation
      if (window.confirm("Changes you made will be lost. Are you sure?")) {
        retry(); // allow navigation
      }
    },
    enableNavigationBlocker,
    props.navigationUnblockCheck
  );

  // ON MOUNT: subscribe to machine/actor and pass back up state events
  useEffect(() => {
    const subscription = actorRef.subscribe((snapshot) => {
      if (typeof props.onMachineChange === "function") props?.onMachineChange?.(snapshot);
    });
    return subscription.unsubscribe;
  }, [actorRef]);

  // ON STATE CHANGE: DONE
  useEffect(() => {
    // v5: state.status === "done" replaces state.done
    if (state.status !== "done") return;
    // If done...
    async function handleInterviewDone() {
      // --- Save Progress (ensure that any onDone handlers occur after saving to database)
      if (props.onMachineProgress) {
        props.onMachineProgress({ machine: state, progressPercentage: stateMeta.progress });
      }
      // --- onDone
      // Setup done values to pass back
      const finalPayload = { finalEvent: state.context?.__lastEvent, machine: state };
      props.onMachineFinal?.({ ...finalPayload });
    }
    handleInterviewDone();
  }, [state.status]);

  // ON STATE CHANGE: VALUE (aka interview node change)
  useEffect(() => {
    // --- on progress bubbled up (skip final states, because that's in other useEffect)
    if (state.status !== "done") props.onMachineProgress?.({ machine: state, progressPercentage: stateMeta.progress });
    // --- progress percentage bar (only update if increasing. ignore back buttons/review jumping)
    if (stateMeta.progress && stateMeta.progress > progressPercentage) {
      setProgressPercentage(stateMeta.progress);
    }
    // --- set sections highlights (set active to true once we pass states/sections). highlight if this state is current/passed
    if (machineMeta?.sectionsBar != null && sections) {
      // v5: access machine states via actorRef.logic.config.states
      const listOfMachineStates = Object.keys(actorRef.logic?.config?.states ?? {});
      setSections(
        sections.reduce(
          (arr, section) => [
            ...arr,
            {
              ...section,
              highlight:
                section.highlight ||
                // @ts-ignore
                listOfMachineStates.slice(0, listOfMachineStates.indexOf(state.value) + 1).includes(section.trigger),
            },
          ],
          []
        )
      );
    }
  }, [state.value]);

  // show "unsaved changes" sticky warning banner, if:
  const showResourcesUpdatesWarning =
    // machine uses sessions + has previously completed (saved) a session for this machine
    machineMeta?.session?.hasPreviouslyFinished &&
    // machine is currently NOT on a Disqualifier screen
    // @ts-ignore
    !(state.value || "").includes("Disqualifier") &&
    // machine's context contains unsaved `resourcesUpdates` operations
    // @ts-ignore
    Object.entries(state.context?.resourcesUpdates || {}).some(([resource, operations]) =>
      Object.entries(operations).some(([type, ops]) => ops.length > 0)
    );

  // RENDER
  const WizardWrapComponent: any = props.serializations?.components?.WizardWrap ?? WizardWrap;

  const processedSections = sections?.map((section) => ({
    ...section,
    name: resolveText(section.name, locale),
  }));

  const processedTitle = resolveText(machineMeta?.title, locale);

  // --- If interview node
  if (stateMeta.nodeType === ID_GENERAL) {
    return (
      <WizardWrapComponent
        key={state.value as string}
        data-wiz-entry-machine-id={props.machine.id}
        data-wiz-entry-machine-state={props.machine.config?.initial}
        data-wiz-machine-id={props.machine.id}
        data-wiz-machine-state={state.value}
        data-test-id={state.value}
        //pre-process translations
        title={processedTitle}
        sections={machineMeta?.sectionsBar ? processedSections : null}
        progress={Math.max(0.01, progressPercentage)}
        showResourcesUpdatesWarning={showResourcesUpdatesWarning}
      >
        <WizardStateViewer
          meta={stateMeta}
          state={state}
          transition={send}
          machineMeta={machineMeta}
          serializations={props.serializations}
          navigate={props.navigate}
        />
      </WizardWrapComponent>
    );
  }
  // --- if nested machine
  for (const spellKey of Object.keys(props.spellMap)) {
    if (stateMeta.nodeType === spellKey) {
      return (
        <WizardWrapComponent
          key={state.value as string}
          data-wiz-entry-machine-id={props.machine.id}
          data-wiz-entry-machine-state={props.machine.config?.initial}
          data-wiz-machine-id={spellKey}
          data-wiz-machine-state={state.value}
          data-test-id={state.value}
          //TODO: should this actually be the title of the child spell?
          title={processedTitle}
          progress={Math.max(0.01, progressPercentage)}
          sections={machineMeta?.sectionsBar ? sections : null}
          showResourcesUpdatesWarning={showResourcesUpdatesWarning}
        >
          <NestedMachineNode
            machine={machine}
            machineMeta={machineMeta}
            serializations={props.serializations}
            navigate={props.navigate}
            onMachineChange={props?.onMachineChange}
          />
        </WizardWrapComponent>
      );
    }
  }
  return null;
};

// Wrapped export to give parent React rendering contexts an onError() if needed/occuring
export class WizardStateMachineManager extends Component {
  componentDidCatch(err) {
    // @ts-ignore
    this.props?.onMachineError?.(err);
  }
  render() {
    // @ts-ignore
    return <WizardStateMachineManagerWithoutCatch {...this.props} />;
  }
}
