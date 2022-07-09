import { omit } from "lodash";
import { assign } from "xstate";
import { TGeneralStateNodeProps, TWizardSerializations } from "../../types";
import { logger } from "../../wizardDebugger";
import { evalJsonLogic } from "../functions/evalJsonLogic";
import { deserializeTransitions } from "./deserializeTransitions";
import { ID_GENERAL } from "../../constants/nodeTypes";

// Use this everywhere. Simplifies writing states
export function setupGeneralState(
  {
    content,
    entry,
    invoke,
    nodeType = ID_GENERAL,
    notes = [],
    on,
    always,
    progress,
    showValidateErrorsAtEntry,
    test,
  }: TGeneralStateNodeProps,
  extras: {
    serializations: TWizardSerializations;
  }
) {
  const constructedState: Record<string, any> = {};
  // Setup node type, content array, test fn for @xstate/test coverage checks
  constructedState.meta = {
    content,
    nodeType,
    notes,
    progress,
    test: test || (() => null),
    showValidateErrorsAtEntry,
  };

  // Setup event listeners and ASSIGN_CONTEXT for input changes
  const assignContextActions = [assign((ctx, ev) => omit(ev, ["type"]))];
  if (on && on.ASSIGN_CONTEXT && Object.keys(on.ASSIGN_CONTEXT).length >= 1) {
    logger.warning(
      '"ASSIGN_CONTEXT" is a special transition for updating machine context. Only actions will be considered and appended. Please be careful.'
    );
    if (Array.isArray(on.ASSIGN_CONTEXT.actions)) assignContextActions.push(...on.ASSIGN_CONTEXT.actions);
  }
  constructedState.on = { ...on, ASSIGN_CONTEXT: { actions: assignContextActions } };

  // Allow states to trigger transitions upon entry. This is helpful for machines that initiate using event data.
  // Ex) A user reloads, meaning we're in a state w/o event data that determines an invoked machine's state. The factory function then creates a send('BACK) for the entry when its otherwise null
  // Ex) Look to FilerAddressEditingMachine
  constructedState.entry = entry;

  constructedState.always = always;

  // Setup invoke methods in case we need to run timed transitions on state entries
  // --- if function, supply to src
  // --- if a serialized type, init the factory function
  // --- if its an obj, wholely attach
  if (invoke) {
    if (typeof invoke === "function") {
      constructedState.invoke = { src: invoke };
      // --- check if a serialized function is being referenced. if so, run it and send data to event handler (if type was given)
    } else if (invoke?.srcSerialized?.jsonLogic != null) {
      constructedState.invoke = {
        src: (ctx, ev) => async (transition) => {
          const data = await evalJsonLogic(invoke?.srcSerialized?.jsonLogic, { context: ctx, event: ev });
          if (invoke?.srcSerialized?.transitionEventType) {
            transition({ type: invoke?.srcSerialized?.transitionEventType, data });
          }
        },
      };
    } else if (typeof invoke === "object" && invoke != null) {
      constructedState.invoke = invoke;
    } else {
      logger.error('"invoke" was not a function or object.');
    }
  }

  // Deserialize
  // traverse entry/on actions and handle assign templates/json-logic
  if (constructedState.entry) constructedState.entry = deserializeTransitions(constructedState.entry);
  if (constructedState.on) constructedState.on = deserializeTransitions(constructedState.on);

  return constructedState;
}
