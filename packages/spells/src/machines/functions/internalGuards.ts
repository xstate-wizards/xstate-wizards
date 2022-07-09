import { evalJsonLogic } from "./evalJsonLogic";

export const internalGuards = {
  // Our json-logic guard evals serialized rules! 🥳
  // https://xstate.js.org/docs/guides/guards.html#custom-guards
  jsonLogic: (ctx, ev, { cond }) => {
    return evalJsonLogic(cond.jsonLogic, { context: ctx, event: ev });
  },
};
