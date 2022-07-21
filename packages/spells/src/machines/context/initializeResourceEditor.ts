import { assign } from "xstate";
import { upsertResourceOnContext } from "./contextHelpers";

export const initializeResourceEditor = assign((ctx: any) => ({
  ...upsertResourceOnContext(ctx, {
    modelName: ctx?.editorConfig.resourceType,
    id: ctx?.editorConfig.resourceId,
    props: ctx?.editorConfig.resourceDefaults,
  }),
}));
