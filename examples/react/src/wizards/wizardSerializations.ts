import { get } from "lodash";
import {
  $TSFixMe,
  createLocalId,
  createResourceOnContext,
  deleteResourceOnContext,
  resolveInvokedContext,
  TMachineSerializations,
} from "@upsolve/wizards";
import { assign } from "xstate";
import { wizardMap } from "./wizardMap";

// =================
// ACTIONS
// =================
const actions: TMachineSerializations["actions"] = {
  resolveInvokedContext,
  "Screener.incrementWizardScore": assign({
    states: (ctx) => ({ ...ctx.states, wizardScore: ctx.states.wizardScore + 1 }),
  }),
  "Screener.incrementWizardScoreBy": assign({
    states: (ctx, ev) => ({
      ...ctx.states,
      wizardScore: ctx.states.wizardScore + Math.max(Number(ev?.data?.incrementBy) || 0),
    }),
  }),
  "Screener.isInterested": assign({ states: (ctx) => ({ ...ctx.states, isInterestedInInterview: true }) }),
};
// --- models (auto-generate from looking at all loaders modelName properties)
Object.values(wizardMap)
  .map((machineMap) => machineMap.machineModels.map((machineModel) => machineModel.modelName))
  .flat()
  .forEach((modelName) => {
    actions[`Models.${modelName}.create`] = assign((ctx) =>
      createResourceOnContext(ctx, {
        modelName,
        id: createLocalId(),
      })
    );
    actions[`Models.${modelName}.delete`] = assign((ctx, ev) =>
      deleteResourceOnContext(ctx, {
        modelName,
        id: ev?.data?.id,
      })
    );
  });

// =================
// FUNCTIONS (for ContentNode strings, conditional evaluations, forEach iterators, etc... as well as invoked srcs)
// =================
const functions: TMachineSerializations["functions"] = {
  // --- getters
  get: (ctx: $TSFixMe, path: string) => get(ctx, path),
  // --- operators
  gt: (ctx: $TSFixMe, path: string, value: number) => get(ctx, path) > value, // greater than
  gte: (ctx: $TSFixMe, path: string, value: number) => get(ctx, path) >= value, // greater than or equal
  lt: (ctx: $TSFixMe, path: string, value: number) => get(ctx, path) < value, // less than
  lte: (ctx: $TSFixMe, path: string, value: number) => get(ctx, path) <= value, // less than or equal
  eq: (ctx: $TSFixMe, path: string, value: number) => get(ctx, path) == value, // equal
  ne: (ctx: $TSFixMe, path: string, value: number) => get(ctx, path) == value, // not equal
  // --- invokes (factory functions for invokes, meaning should expect (ctx,ev))
  invokeTimer: (milliseconds: number) => (ctx: $TSFixMe, ev: $TSFixMe) =>
    new Promise<void>((resolve) => setTimeout(() => resolve(), milliseconds)),
  // --- CUSTOM
  selectUser: (ctx: $TSFixMe, key: string) => {
    const user = Object.values(ctx.resources?.User ?? {})?.[0];
    return key ? user?.[key] : user;
  },
};

// =================
// VALIDATIONS (for inputs only)
// =================
const validations: TMachineSerializations["validations"] = {
  isCurrentYear: (value) => (String(new Date().getFullYear()) === value ? null : "That's the wrong year"),
  startOfPi: (value) => {
    if (!String(value).startsWith("3.14")) return "Pi should start with 3.14...";
    return null;
  },
};

export const wizardSerializations: TMachineSerializations = {
  actions,
  components: {},
  functions,
  guards: {},
  validations,
};
