import { cloneDeep } from "lodash";
import { $TSFixMe, TTestNodeHandlerProps, TSpellMap, TWizardSerializations } from "../../types";
import { logger } from "../../wizardDebugger";
import { evalJsonLogic, isJsonLogic } from "../functions/evalJsonLogic";
import { deserializeTransitions } from "./deserializeTransitions";

// TODO: Match meta, on, onDone to xstate type interfaces
type TSetupInvokedMachineStateProps = {
  context: Function;
  entry?: $TSFixMe;
  exit?: $TSFixMe; //should be a string or action object or list of action obj
  initial?: string;
  key: string;
  meta?: $TSFixMe;
  on?: Record<string, any>;
  onDone: (Record<string, any> | string)[];
  onError: (Record<string, any> | string)[];
  serializations: TWizardSerializations;
  spellMap: TSpellMap;
  test?: (utils: TTestNodeHandlerProps) => Promise<void>;
};

export function setupInvokedMachineState({
  context, //TODO: we need to call this something else
  entry,
  exit,
  initial,
  key,
  meta,
  on,
  onDone = [],
  onError = [],
  serializations,
  spellMap,
  test,
}: TSetupInvokedMachineStateProps) {
  logger.debug("Invoking Machine: ", { id: key, spellMap });
  // VALIDATE
  if (!key) logger.error("Invalid invoke config: Missing 'key'");
  if (!spellMap[key]) logger.error(`Invalid invoke config: Machine/spell doesn't exist for key '${key}'`);

  // SETUP
  // v5: We create the child machine at config time and pass dynamic context via input.
  // The child machine is created with empty context - actual context comes via input.
  const childMachine = spellMap[key].createMachine(
    { resources: {}, resourcesUpdates: {} },
    { initial, spellMap, serializations, meta }
  );

  const constructedState = {
    entry,
    exit,
    invoke: {
      id: key,
      // v5: src is the machine directly, input provides dynamic context
      src: childMachine,
      input: ({ context: ctx, event }) => {
        // --- if xstate.init, we did not get invoked by a parent, so kick us back
        if (event.type === "xstate.init") {
          return { __skipInvoke: true };
        }

        const getContextFromJsonLogic = (contextConfig) => {
          return (
            Object.keys(contextConfig ?? {})?.reduce((obj, key) => {
              if (isJsonLogic(contextConfig[key])) {
                obj[key] = evalJsonLogic(contextConfig[key], { context: ctx, event });
              } else if (typeof contextConfig[key] === "object") {
                obj[key] = getContextFromJsonLogic(contextConfig[key]);
              }
              return obj;
            }, {}) ?? {}
          );
        };

        const invokedContext = typeof context === "function" ? context?.({ context: ctx, event }) : getContextFromJsonLogic(context);

        return {
          resources: cloneDeep(ctx.resources),
          resourcesUpdates: cloneDeep(ctx.resourcesUpdates),
          ...(invokedContext ?? {}),
        };
      },
      onDone: [
        meta?.allowStartOver
          ? {
              target: "cancel",
              cond: ({ event }) => event?.output?.finalEvent?.type === "START_OVER",
            }
          : null,
        ...onDone,
      ].filter((od) => od),
      onError: onError.filter((oe) => oe),
    },
    on,
    meta: { nodeType: key, test: test || (() => null) },
  };
  // --- Deserialize (traverse entry/on actions and handle assign templates/json-logic)
  // deserializeTransitions also remaps cond → guard
  if (constructedState.entry) constructedState.entry = deserializeTransitions(constructedState.entry);
  if (constructedState.exit) constructedState.exit = deserializeTransitions(constructedState.exit);

  if (constructedState.on) constructedState.on = deserializeTransitions(constructedState.on);
  if (constructedState.invoke.onDone)
    constructedState.invoke.onDone = deserializeTransitions(constructedState.invoke.onDone);
  if (constructedState.invoke.onError)
    constructedState.invoke.onError = deserializeTransitions(constructedState.invoke.onError);
  // --- Return
  return constructedState;
}
