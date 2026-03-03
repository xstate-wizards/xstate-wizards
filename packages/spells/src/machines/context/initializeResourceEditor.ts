import { assign } from "xstate";
import { upsertResourceOnContext } from "./contextHelpers";

export const initializeResourceEditor = assign(({ context }: { context: any }) => ({
  ...upsertResourceOnContext(context, {
    modelName: context?.editorConfig.resourceType,
    id: context?.editorConfig.resourceId,
    props: context?.editorConfig.resourceDefaults,
  }),
}));
