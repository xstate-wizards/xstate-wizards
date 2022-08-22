import { cloneDeep, get, throttle } from "lodash";
import React, { Fragment, useEffect, useState } from "react";
import { $TSFixMe } from "@xstate-wizards/spells";
import {
  applyResourceInputToContext,
  CONTENT_NODE_BACK,
  CONTENT_NODE_PAUSE_AND_EXIT_TO,
  countContentNodes,
  createLocalId,
  flattenContentNodes,
  generateValidationMap,
  resolveAssignId,
} from "@xstate-wizards/spells";

import { TWizardStateViewerProps } from "../types";
import { ContentNode } from "./ContentNode";
import { WizardNavigationPanel } from "./wizardLayout/WizardNavigationPanel";
import { logger } from "../wizardDebugger";

// HACK: We can't reliably call the back transition from the most child machine using transitionManager({ type: 'BACK', history: state.history });
// so we're going to just scan the page for the button and click that, which is guarenteed to be rendered by the childmost machine/node.
// Tried useRef() instead of dom selection seems proper but I keep getting current = null... so using refs might be more reliable tbh, idk
const clickBackButton = throttle(
  () => {
    if (typeof document !== "undefined" && document.querySelector("button.x-wizard__header-back-button")) {
      // @ts-ignore
      document.querySelector("button.x-wizard__header-back-button")?.click?.();
    }
  },
  200,
  { trailing: false }
);

/**
 * <WizardStateViewer />
 * Is run by the interview components and primarily lays out ContentNodes.
 * It also handles validation updates, and listens for browser back button clicks to transition BACK
 */
export const WizardStateViewer: React.FC<TWizardStateViewerProps> = ({
  serializations,
  machineMeta,
  meta,
  navigate,
  state,
  transition,
}) => {
  const [contextOnEntry] = useState(state.context);
  const contentNodes = typeof meta.content === "function" ? meta.content(state.context) : meta.content || [];
  const [numContentNodes, setNumContentNodes] = useState(
    countContentNodes({ contentNodes, context: state.context, functions: serializations?.functions })
  );
  // VALIDATION
  // On a screen/node load, run validations
  const [lastEventAt, setLastEventAt] = useState<number | undefined>();
  const [validationMap, setValidationMap] = useState(undefined);

  // RESOURCES SETUP HELPER
  // --- Need to setup resources them w/ defaults on context (When done within ContentNode mounts, defaults were lost because assignments would happen without context of other node updates, essentailly deleting them)
  const setupResourcesForEditors = () => {
    const nodes = flattenContentNodes({
      contentNodes,
      context: state.context,
      functions: serializations?.functions,
    })
      .filter((node) => node.type === "resourceEditor" && node?.config?.resourceDefaults)
      .filter(
        (node) =>
          get(
            state.context,
            `resources.${node.config.modelName}[${resolveAssignId({
              context: state.context,
              assignIdOrTemplateOrJsonLogic: node.config.resourceId,
              functions: serializations.functions,
              contentTree: node.contentTree,
            })}].id`
          ) === undefined
      );
    // --- are there resource editors initalized w/o resources[...] existing?
    if (nodes.length) {
      logger.info(`setupResourcesForEditors: updating context: `, nodes);
      // Each content node has to transform in addition to prior transforms, requiring ctx to be passed forwards
      // TODO: I think we might need to handle cases where we stamp defaults onto existing resources too
      let mutatingContext = cloneDeep(state.context);
      nodes.forEach((node) => {
        const resolvedAssignId =
          resolveAssignId({
            context: state.context,
            assignIdOrTemplateOrJsonLogic: node.config.resourceId,
            functions: serializations.functions,
            contentTree: node.contentTree,
          }) ?? createLocalId();
        logger.info(
          `setupResourcesForEditors: updating context: resources.${node.config.modelName}[${resolvedAssignId}].id`,
          { node, state, serializations }
        );
        // Setup slice w/ resource + place the id within the obj
        mutatingContext = applyResourceInputToContext(
          mutatingContext,
          {
            modelName: node.config.modelName,
            id: resolvedAssignId,
            path: "id",
          },
          resolvedAssignId
        );
        // Setup defaults
        for (const key of Object.keys(node.config.resourceDefaults || {})) {
          if (get(mutatingContext, `resources.${node.config.modelName}[${resolvedAssignId}].${key}`) === undefined) {
            mutatingContext = applyResourceInputToContext(
              mutatingContext,
              {
                modelName: node.config.modelName,
                id: resolvedAssignId,
                path: key,
              },
              node.config.resourceDefaults[key]
            );
          }
        }
      });
      logger.info("setupResourcesForEditors: mutated context:", mutatingContext);
      transition({
        type: "ASSIGN_CONTEXT",
        resources: mutatingContext.resources,
        resourcesUpdates: mutatingContext.resourcesUpdates,
      });
    }
    setLastEventAt(new Date().getTime());
  };

  // ON MOUNT (aka every state.value change)
  useEffect(() => {
    logger.info(`STATE: ${state.value}`, cloneDeep({ context: state.context, contextOnEntry }));
    // - Scroll to top
    if (typeof window !== "undefined") window.scroll(0, 0);
    // - Go through content nodes and setup any resources
    setupResourcesForEditors();
  }, []);

  // ON CONTENT CHANGES
  // HACK: There may be a time where the nodes length doesn't change even though the interface did
  useEffect(() => {
    logger.debug(`WizardStateViewer.useEffect: countContentNodes`);
    const currentCountContentNodes = countContentNodes({
      contentNodes,
      context: state.context,
      functions: serializations?.functions,
    });
    logger.info(`contentNodes Count: ${currentCountContentNodes}`);
    // If the number of nodes has changed on the page...
    if (numContentNodes !== currentCountContentNodes) {
      logger.info(`contentNodes Count Changed. Re-running validation and resource editor setup`);
      // 1) Have resourceEditors run their default setups (resource editors behind conditionals don't run when the state loads/component mounts, they run when conditionals change)
      setupResourcesForEditors();
      // 2) Save count to state so we can do these evaluations again
      setNumContentNodes(currentCountContentNodes);
    }
  }, [countContentNodes({ contentNodes, context: state.context, functions: serializations?.functions })]);
  useEffect(() => {
    logger.debug(`WizardStateViewer.useEffect: setValidationMap`, cloneDeep({ lastEventAt, state }));
    // Re-run validation on content changes (Input nodes that may have failed validation before, may no longer be on the screen, so their validation messages should be cleared (ex: 'primary' toggle for filer addresses))
    setValidationMap(generateValidationMap({ contentNodes, meta, state, serializations }));
  }, [lastEventAt]);

  // TRANSITION MANAGEMENT
  // -- Transition Manager intercepts BACK events to reset context
  const transitionManager = (event) => {
    logger.info(`EVENT: ${event.type}`, event);
    if (event.type === "BACK") {
      logger.info('"BACK" Triggered: Resetting context to what it was before this node');
      transition({ type: "ASSIGN_CONTEXT", ...contextOnEntry });
    }
    if (event.type !== "ASSIGN_CONTEXT") {
      setLastEventAt(new Date().getTime());
    }
    transition(event);
  };
  // --- used primarily for CONTENT_NODE_PAUSE_AND_EXIT_TO
  const triggerExitTo = (exitTo?: string, state?: $TSFixMe) => {
    logger.info("EXIT Triggered (via ContentNode)");
    navigate(exitTo || machineMeta?.exitTo, { state: { ...(state ?? {}), skipConfirm: true } });
  };

  // RENDER
  return (
    <Fragment key={state.value}>
      {/* Top navigation options panel */}
      <WizardNavigationPanel
        allowStartOver={machineMeta?.allowStartOver}
        allowBack={contentNodes.some((cn) => cn?.attrs?.className === CONTENT_NODE_BACK.attrs.className)}
        exitTo={machineMeta?.exitTo}
        machineMeta={machineMeta}
        serializations={serializations}
        navigate={navigate}
        // note: this is important for mobile
        onBack={() => clickBackButton()}
        onStartOver={() => transitionManager({ type: "START_OVER" })}
      />
      {/* Content Nodes -- only show once we've evaluated for a validationMap */}
      {!lastEventAt
        ? null
        : contentNodes.map((node, ni) => (
            <ContentNode
              key={`${state.value}-${node.type}-${ni}`}
              node={
                node?.attrs?.className === CONTENT_NODE_PAUSE_AND_EXIT_TO.attrs.className
                  ? { ...node, onClick: () => triggerExitTo(node.exitTo, node.exitState || {}) }
                  : node
              }
              state={state}
              transition={transitionManager}
              validationMap={validationMap}
              setValidationMap={setValidationMap}
              serializations={serializations}
            />
          ))}
    </Fragment>
  );
};
