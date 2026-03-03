import { evalJsonLogic } from "./evalJsonLogic";

export const internalGuards = {
  // Our json-logic guard evals serialized rules! 🥳
  // v5: ({ context, event }, params) replaces (ctx, ev, { cond })
  jsonLogic: ({ context, event }, params) => {
    return evalJsonLogic(params.jsonLogic, { context, event });
  },
};
