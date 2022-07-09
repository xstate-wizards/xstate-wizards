import { cloneDeep } from "lodash";
import { TSpellMap, TWizardSerializations, TSpellConfig, $TSFixMe } from "../../types";
import { CANCEL_STATE, SAVE_STATE, CANCEL_STATE_WITH_CONFIRMATION } from "../../constants/stateTargets";
import { flattenContentNodes } from "./flattenContentNodes";
import { setupInvokedMachineState } from "./setupInvokedMachineState";
import { setupGeneralState } from "./setupGeneralState";
import { emptyMachineContext } from "../context/contextHelpers";
import { logger } from "../../wizardDebugger";

type TWizardStatesPrepper = {
  config: TSpellConfig;
  states: Record<string, any>;
  spellMap: TSpellMap;
  serializations: TWizardSerializations;
  meta: {
    content: $TSFixMe;
    on: $TSFixMe;
  };
};

/**
 * wizardStatesPrepper
 */
export function wizardStatesPrepper({
  config,
  states: initStates,
  spellMap,
  serializations,
  meta,
}: TWizardStatesPrepper) {
  logger.debug("wizardStatesPrepper", { config, initStates, meta, spellMap });
  // PREP
  // --- transform arr to obj, or just break references on obj
  const preppedStates = Array.isArray(initStates)
    ? initStates.reduce((obj, { state, stateName }) => {
        return { ...obj, [stateName]: state };
      }, {})
    : cloneDeep(initStates);
  // --- Add a SAVE/CANCEL state if none exists
  if (!preppedStates[CANCEL_STATE]) preppedStates[CANCEL_STATE] = { type: "final" };
  if (!preppedStates[SAVE_STATE]) preppedStates[SAVE_STATE] = { type: "final" };

  // EXTEND
  return Object.keys(preppedStates).reduce((states, key, index, array) => {
    states[key] = preppedStates[key];
    if (states[key].meta == null) states[key].meta = {};
    // ===================
    // STATES: ALL
    if (states[key]?.key && !spellMap[states[key]?.key]) {
      // --- THROW ERROR IF NO INVOKABLE MACHINE PASSED IN
      throw new Error(`Cannot setup invoked state. Missing "${states[key]?.key}" on spellMap`);
    } else if (states[key]?.key && spellMap[states[key]?.key]) {
      // --- RUN SETUP MACHINE HELPER IF INVOKE & ID
      // TODO: I think this is done??? >>> automatically resolve the resources/resourcesUpdates on context
      states[key] = setupInvokedMachineState({
        ...states[key],
        spellMap,
        serializations,
        meta,
      });
    } else if (!states[key]?.key && states[key]?.content) {
      // --- RUN GENERAL STATE HELPER IF NO INVOKE W/ MACHINE ID
      states[key] = setupGeneralState(states[key], { serializations });
    }
    // --- progress % (even give a progress calc helper even if UI doesn't utilize)
    states[key].meta.progress = (index + 1) / (array.length - 2); // Don't count save/cancel states
    // --- Set START_OVER (if options allowStartOver)
    if (config?.allowStartOver && states[key].on && states[key].on.START_OVER === undefined) {
      states[key].on.START_OVER = CANCEL_STATE;
    }

    // ===================
    // STATES: FINAL
    if (states[key]?.type === "final") {
      // --- CANCEL (make sure we pass back a final event)
      if (key === CANCEL_STATE && states[key]?.data === undefined) {
        states[key].data = (ctx, ev) => ({
          // finalCtx: ctx, // don't pass ctx back, avoids accessing/merging data thrown away
          finalEvent: ev,
        });
      }
      // --- SAVE
      if (key === SAVE_STATE && states[key]?.data === undefined) {
        states[key].data = (ctx, ev) => ({
          finalCtx: ctx,
          finalEvent: ev,
          // TODO: we should just refactor merge/handler functions to use finalCtx instead of resources
          resources: cloneDeep(ctx.resources),
          resourcesUpdates: cloneDeep(ctx.resourcesUpdates),
        });
      }
      // Return to ignore other configs
      return states;
    }

    // ===================
    // GENERAL NODE
    // content[] > on{} setups
    if (typeof states[key]?.meta?.content === "function" || Array.isArray(states[key]?.meta?.content)) {
      const contentNodes = Array.isArray(states[key]?.meta?.content)
        ? states[key]?.meta?.content
        : states[key]?.meta?.content(emptyMachineContext);
      const hasBackEventNode = flattenContentNodes({
        contentNodes,
        context: emptyMachineContext,
        functions: serializations?.functions,
      }).some((c) => c.event === "BACK");
      const hasSubmitEventNode = flattenContentNodes({
        contentNodes,
        context: emptyMachineContext,
        functions: serializations?.functions,
      }).some((c) => c.event === "SUBMIT");

      // --- Set BACK to next state if not defined and a button exists w/ event BACK (prev state index key. if first node, set to cancel)
      if (config?.autofillBackTargets === true && states[key]?.on?.BACK === undefined && hasBackEventNode) {
        states[key].on.BACK = index === 0 ? CANCEL_STATE_WITH_CONFIRMATION : array[index - 1];
      }

      // --- Set SUBMIT to next state if not defined and a button exists w/ event SUBMIT (next state index key))
      if (config?.autofillSubmitTargets === true && states[key]?.on?.SUBMIT === undefined && hasSubmitEventNode) {
        states[key].on.SUBMIT = array[index + 1] || SAVE_STATE;
      }
    }

    // ===================
    // RETURN
    logger.debug("wizardStatesPrepper: states", states);
    return states;
  }, {});
}
