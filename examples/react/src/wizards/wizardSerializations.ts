import {
  createLocalId,
  createResourceOnContext,
  deleteResourceOnContext,
  resolveInvokedContext,
  TMachineSerializations,
} from "@upsolve/wizards";
import { assign } from "xstate";

// =================
// ACTIONS
// =================
const actions: TMachineSerializations["actions"] = {
  // --- defaults/special
  resolveInvokedContext,
  // --- models (todo: auto-generate)
  "Models.Hobby.create": assign((ctx) =>
    createResourceOnContext(ctx, {
      modelName: "Hobby",
      id: createLocalId(),
    })
  ),
  "Models.Hobby.delete": assign((ctx, ev) =>
    deleteResourceOnContext(ctx, {
      modelName: "Hobby",
      id: ev?.data?.id,
    })
  ),
  "Models.Pet.create": assign((ctx) =>
    createResourceOnContext(ctx, {
      modelName: "Pet",
      id: createLocalId(),
    })
  ),
  "Models.Pet.delete": assign((ctx, ev) =>
    deleteResourceOnContext(ctx, {
      modelName: "Pet",
      id: ev?.data?.id,
    })
  ),
  "Models.User.create": assign((ctx) =>
    createResourceOnContext(ctx, {
      modelName: "User",
      id: createLocalId(),
    })
  ),
  // --- wizards
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
  guards: {},
  validations,
};
