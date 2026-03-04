import { omit } from "lodash";
import { assign, fromCallback } from "xstate";
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
    exit,
    invoke,
    nodeType = ID_GENERAL,
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
    progress,
    test: test || (() => null),
    showValidateErrorsAtEntry,
  };

  // Setup event listeners and ASSIGN_CONTEXT for input changes
  // v5: assign(({ context, event }) => ...) replaces assign((ctx, ev) => ...)
  const assignContextActions = [assign(({ event }) => omit(event, ["type"]))];
  if (on && on.ASSIGN_CONTEXT && Object.keys(on.ASSIGN_CONTEXT).length >= 1) {
    logger.warning(
      '"ASSIGN_CONTEXT" is a special transition for updating machine context. Only actions will be considered and appended. Please be careful.'
    );
    const ac = on.ASSIGN_CONTEXT;
    if (typeof ac === "object" && !Array.isArray(ac) && Array.isArray(ac.actions)) assignContextActions.push(...(ac.actions as any[]));
  }
  constructedState.on = { ...on, ASSIGN_CONTEXT: { actions: assignContextActions } };

  // Allow states to trigger transitions upon entry. This is helpful for machines that initiate using event data.
  // Ex) A user reloads, meaning we're in a state w/o event data that determines an invoked machine's state. The factory function then creates a send('BACK) for the entry when its otherwise null
  // Ex) Look to FilerAddressEditingMachine
  constructedState.entry = entry;
  constructedState.exit = exit;

  constructedState.always = always;

  // Setup invoke methods in case we need to run timed transitions on state entries
  // --- if function, supply to src
  // --- if a serialized type, init the factory function
  // --- if its an obj, wholely attach
  if (invoke) {
    if (typeof invoke === "function") {
      // v5: wrap v4-style callback invoke `(ctx, ev) => (callback) => cleanup` with fromCallback
      constructedState.invoke = {
        src: fromCallback(({ sendBack, input }: { sendBack: any; input: any }) => {
          const result = invoke({ context: input.context, event: input.event });
          if (typeof result === "function") {
            // v4 callback service returns a cleanup function (or non-function like a timeout ID)
            const cleanup = result(sendBack);
            // Only return cleanup if it's actually a function (v5 expects function or void)
            if (typeof cleanup === "function") {
              return cleanup;
            }
          }
        }),
        input: ({ context, event }: { context: any; event: any }) => ({ context, event }),
      };
      // --- check if a serialized function is being referenced. if so, run it and send data to event handler (if type was given)
    } else if (invoke?.srcSerialized?.jsonLogic != null) {
      // v5: callback-style invokes use fromCallback
      constructedState.invoke = {
        src: fromCallback(({ sendBack, input }: { sendBack: any; input: any }) => {
          (async () => {
            const data = await evalJsonLogic(invoke?.srcSerialized?.jsonLogic, { context: input.context, event: input.event });
            if (invoke?.srcSerialized?.transitionEventType) {
              sendBack({ type: invoke?.srcSerialized?.transitionEventType, data });
            }
          })();
        }),
        input: ({ context, event }: { context: any; event: any }) => ({ context, event }),
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
  if (constructedState.exit) constructedState.exit = deserializeTransitions(constructedState.exit);

  if (constructedState.on) constructedState.on = deserializeTransitions(constructedState.on);

  return constructedState;
}
