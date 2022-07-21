import { cloneDeep, merge } from "lodash";
import { createMachine } from "xstate";
import { INTERVIEW_INTRO_STATE } from "../constants/stateTargets";
import { TSpellInstructions, TPrepparedSpellMapping } from "../types";
import { prepMachineContextWithResources } from "./context/contextHelpers";
import { setupMetaSession } from "../sessions/setupMetaSession";
import { wizardStatesPrepper } from "./states/wizardStatesPrepper";
import { getJsonSchemaDefaults } from "../models/getJsonSchemaDefaults";

// ==========================
// v2 machine making
// ==========================
export const createSpell = ({
  key,
  version,
  config,
  models,
  schema,
  states,
}: TSpellInstructions): TPrepparedSpellMapping => {
  return {
    key,
    version,
    config,
    models,
    schema,
    createMachine: (context, extras) => {
      const { initial, spellMap, serializations, session } = extras ?? {};

      const preppedMachineContextWithResources = prepMachineContextWithResources(models, {});
      const jsonSchemaDefaults = getJsonSchemaDefaults(schema);

      const defaultMachineContext = merge(
        {
          ...preppedMachineContextWithResources, //why do we prep resources only to override them with cloned resources?
          ...jsonSchemaDefaults,
        },
        { states: context.states ?? {} }
      );

      const machineContext = session?.machineContext || {
        ...merge(defaultMachineContext, context ?? {}),
        resources: cloneDeep(context.resources),
        resourcesUpdates: cloneDeep(context.resourcesUpdates),
      };

      const machineMeta = {
        ...config,
        ...setupMetaSession(session),
      };

      const machineStates = wizardStatesPrepper({
        config,
        states,
        spellMap,
        serializations,
        meta: machineMeta,
      });

      return createMachine(
        {
          id: key,
          initial:
            (session?.machineState && machineStates[session?.machineState]) != null
              ? session?.machineState
              : initial ?? config?.initial ?? INTERVIEW_INTRO_STATE,
          context: machineContext,
          meta: machineMeta,
          states: machineStates,
        },
        {
          actions: serializations?.actions,
          guards: serializations?.guards,
        }
      );
    },
  };
};
