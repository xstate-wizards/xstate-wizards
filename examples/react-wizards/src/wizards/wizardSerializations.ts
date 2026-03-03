import { $TSFixMe, mergeEventDataResources, TWizardSerializations } from "@xstate-wizards/spells";
import { assign } from "xstate";

// =================
// ACTIONS
// =================
const actions: TWizardSerializations["actions"] = {
  mergeEventDataResources,
  // v5: assign(({ context, event }) => ...) replaces assign((ctx, ev) => ...)
  "Screener.incrementWizardScore": assign({
    states: ({ context }) => ({ ...context.states, wizardScore: context.states.wizardScore + 1 }),
  }),
  "Screener.incrementWizardScoreBy": assign({
    states: ({ context, event }: { context: any; event: any }) => ({
      ...context.states,
      wizardScore: context.states.wizardScore + Math.max(Number(event?.data?.incrementBy) || 0),
    }),
  }),
  "Screener.isInterested": assign({ states: ({ context }) => ({ ...context.states, isInterestedInInterview: true }) }),
  // --- models (auto-generate from loader modelNames)
  // Models.User.create...
  // Models.User.delete...
};

// =================
// FUNCTIONS (for ContentNode strings, conditional evaluations, forEach iterators, etc... as well as invoked srcs)
// =================
const functions: TWizardSerializations["functions"] = {
  selectUser: (ctx: $TSFixMe, key: string) => {
    // console.warn("selectUser: ", cloneDeep(ctx), key);
    const user = Object.values(ctx.resources?.User ?? {})?.[0];
    return key ? user?.[key] : user;
  },
  waitSeconds: (seconds: number, callback?: Promise<any>) =>
    new Promise<void>((resolve) => setTimeout(() => resolve(callback), 1000 * seconds)),
};

// =================
// VALIDATIONS (for inputs only)
// =================
const validations: TWizardSerializations["validations"] = {
  isCurrentYear: (value) => (String(new Date().getFullYear()) === String(value) ? null : "That's the wrong year"),
  startOfPi: (value) => {
    if (!String(value).startsWith("3.14")) return "Pi should start with 3.14...";
    return null;
  },
};

export const wizardSerializations: TWizardSerializations = {
  actions,
  components: {},
  functions,
  guards: {},
  validations,
};
