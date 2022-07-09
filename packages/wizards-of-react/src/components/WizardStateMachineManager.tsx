import React, { Component, useEffect, useState } from "react";
import { Interpreter } from "xstate";
import { useMachine, useService } from "@xstate/react";
import { TWizardStateMachineManagerProps } from "@xstate-wizards/spells";
import { ID_GENERAL } from "@xstate-wizards/spells";

import { WizardStateViewer } from "./WizardStateViewer";
import { WizardWrapDefault } from "./wizardLayout/WizardWrapper";
import { logger } from "../wizardDebugger";

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
 * Since we never should write parallel states, we can easily recursively drill into interpreter Map()s w/ getChildInterpreter.
 * Even though we're drilling down these interpreters, and using them for new state/meta, the reference to the top most machine is preserved
 * and updates, and final states being reached will still be recognized by the overall machine
 *
 */

// getChildInterpreter - Function for recurrsively going through an interpreted machine and finding the deepest child interpreter
function getChildInterpreter(interpreter) {
  if (interpreter.children.size > 1) {
    throw new Error(
      "getChildInterpreter: More than 1 child was found. DO NOT USE PARALLEL NESTED MACHINES FOR INTERVIEWS"
    );
  }

  const child = interpreter.children.values().next().value;
  if (child && child instanceof Interpreter) {
    return getChildInterpreter(child);
  }

  // If no child exists, return the current interpreter
  return interpreter;
}

// <NestedMachineNode /> - After grabbing the deepest child interpreter, our interview state/content is driven by that machine
const NestedMachineNode = (props) => {
  // SETUP
  const [s, t, topMostMachineInterpreter] = props.machine;
  // Drill down for the childmost state node
  if (!getChildInterpreter(topMostMachineInterpreter)) return null;
  // @ts-ignore
  const childInterpreter = getChildInterpreter(topMostMachineInterpreter);
  // ON MOUNT: subscribe to machine/interpreter and pass back up state events
  useEffect(() => {
    const subscription = childInterpreter.subscribe((state) => {
      if (typeof props.onMachineChange === "function") props?.onMachineChange?.(state);
    });
    return subscription.unsubscribe;
  }, [childInterpreter]);
  const [state, transition] = useService(childInterpreter);
  // @ts-ignore
  const meta = state.meta[Object.keys(state.meta).find((k) => k.includes(state.value))];
  // If we're in a done transition, we don't have any content to render. Just return null and let it resolve
  if (state.done) return null;
  // RENDER
  return (
    <WizardStateViewer
      // @ts-expect-error
      key={state.value}
      meta={meta}
      state={state}
      transition={transition}
      machineMeta={props.machineMeta}
      serializations={props.serializations}
      navigate={props.navigate}
    />
  );
};

// <WizardStateMachineManager /> - The Key Component. Manages state changes, session API calls, communicating to <WizardRunner />
const WizardStateMachineManagerWithoutCatch = (props: TWizardStateMachineManagerProps) => {
  const { useNavigationBlocker } = props;
  const machine = useMachine(props.machine);
  const [state, transition, interpreter] = machine;
  // @ts-ignore
  const stateMeta = state.meta[Object.keys(state.meta).find((k) => k.includes(state.value))] || {};
  const machineMeta = interpreter?.machine?.meta;
  const [progressPercentage, setProgressPercentage] = useState(stateMeta.progress);
  const [sections, setSections] = useState(machineMeta?.sectionsBar);

  // Prevent user navigations while the machine state is not considered "done"
  // (if the machine is configured to skip the blocker, or the state is done, let anything happen)
  const enableNavigationBlocker = !machineMeta?.skipNavigationBlocker && !state.done;
  // Expect a navigation blocker like react-router v5 useBlocker passed in
  useNavigationBlocker?.(
    (params) => {
      logger.info("Navigation Blocker (WizardStateMachineManager):", params);
      const { retry, action, location: newLocation } = params;
      // if this was a "Back" browser event, and the interview has a back button
      // present, stay blocked and click "back" button instead.
      const interviewBackButton =
        typeof document !== "undefined" && document.querySelector("button.x-wizard__header-back-button");
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

  // ON MOUNT: subscribe to machine/interpreter and pass back up state events
  useEffect(() => {
    const subscription = interpreter.subscribe((state) => {
      if (typeof props.onMachineChange === "function") props?.onMachineChange?.(state);
    });
    return subscription.unsubscribe;
  }, [interpreter]);

  // ON STATE CHANGE: DONE
  useEffect(() => {
    // If not done...
    if (!state.done) return;
    // If done...
    async function handleInterviewDone() {
      // --- Save Progress (ensure that any onDone handlers occur after saving to database)
      if (props.onMachineProgress) {
        // state.done should always === true if we made it past the above conditional
        props.onMachineProgress({ machine: state, progressPercentage: stateMeta.progress });
      }
      // --- onDone
      // Setup done values to pass back
      const finalPayload = { finalEvent: state.event, machine: state };
      props.onMachineFinal?.({ ...finalPayload });
    }
    handleInterviewDone();
  }, [state.done]);

  // ON STATE CHANGE: VALUE (aka interview node change)
  useEffect(() => {
    // --- on progress bubbled up (skip final states, because that's in other useEffect)
    if (!state.done) props.onMachineProgress?.({ machine: state, progressPercentage: stateMeta.progress });
    // --- progress percentage bar (only update if increasing. ignore back buttons/review jumping)
    if (stateMeta.progress && stateMeta.progress > progressPercentage) {
      setProgressPercentage(stateMeta.progress);
    }
    // --- set sections highlights (set active to true once we pass states/sections). highlight if this state is current/passed
    if (machineMeta?.sectionsBar != null && sections) {
      const listOfMachineStates = Object.keys(interpreter.machine.states);
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
  const WizardWrap = props.serializations?.components?.WizardWrap ?? WizardWrapDefault;
  // --- If interview node
  if (stateMeta.nodeType === ID_GENERAL) {
    return (
      <WizardWrap
        // @ts-expect-error
        key={state.value}
        data-test-id={state.value}
        title={machineMeta?.title}
        progress={Math.max(0.01, progressPercentage)}
        sections={machineMeta?.sectionsBar ? sections : null}
        showResourcesUpdatesWarning={showResourcesUpdatesWarning}
      >
        <WizardStateViewer
          meta={stateMeta}
          state={state}
          transition={transition}
          machineMeta={machineMeta}
          serializations={props.serializations}
          navigate={props.navigate}
        />
      </WizardWrap>
    );
  }
  // --- if nested machine
  for (const spellKey of Object.keys(props.spellMap)) {
    if (stateMeta.nodeType === spellKey) {
      return (
        <WizardWrap
          data-test-id={state.value}
          title={machineMeta?.title}
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
        </WizardWrap>
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
