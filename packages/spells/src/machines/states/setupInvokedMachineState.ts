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
  // TODO: get these working lol
  if (!key) logger.error("Invalid invoke config: Missing 'key'");
  if (!spellMap[key]) logger.error(`Invalid invoke config: Machine/spell doesn't exist for key '${key}'`);

  // SETUP
  const constructedState = {
    entry,
    exit,
    invoke: {
      id: key,
      src: (ctx, event) => {
        // --- if xstate.init, we did not get invoked by a parent, so kick us back
        // TODO: WE SHOULD BE HYDRATING THE FULL MACHINE TREE SO A USER CAN CONTINUE
        if (event.type === "xstate.init") {
          return Promise.resolve({ finalEvent: { type: "BACK" } });
        }

        const getContextFromJsonLogic = (context) => {
          return (
            Object.keys(context ?? {})?.reduce((obj, key) => {
              if (isJsonLogic(context[key])) {
                obj[key] = evalJsonLogic(context[key], { context: ctx, event });
              } else if (typeof context[key] === "object") {
                obj[key] = getContextFromJsonLogic(context[key]);
              }
              return obj;
            }, {}) ?? {}
          );
        };

        const invokedContext = typeof context === "function" ? context?.(ctx, event) : getContextFromJsonLogic(context);

        return spellMap[key].createMachine(
          {
            resources: cloneDeep(ctx.resources),
            resourcesUpdates: cloneDeep(ctx.resourcesUpdates),
            ...(invokedContext ?? {}),
          },
          { initial, spellMap, serializations, meta }
        );
      },
      onDone: [
        meta?.allowStartOver
          ? { target: "cancel", cond: (ctx, ev) => ev?.data?.finalEvent?.type === "START_OVER" }
          : null,
        ...onDone,
      ].filter((od) => od),
      onError: onError.filter((oe) => oe),
    },
    on,
    meta: { nodeType: key, test: test || (() => null) },
  };
  // --- Deserialize (traverse entry/on actions and handle assign templates/json-logic)
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
