import { isEqual } from "lodash";
import { assign } from "xstate";
import { $TSFixMe } from "../../types";
import { logger } from "../../wizardDebugger";

export const mergeEventDataResources = assign(({ context, event }: { context: $TSFixMe; event: $TSFixMe }) => {
  // v5: event.output replaces ev.data for invoked machine results
  const output = event?.output ?? event?.data ?? {};
  if (isEqual(output?.resources, context.resources)) {
    return {}; // no changes needed
  }
  logger.info("Resolving Machine: Resources", output?.resources || context.resources);
  logger.info("Resolving Machine: Resources Updates", output?.resourcesUpdates || context.resourcesUpdates);
  logger.info("Resolving Machine: Dispatched Updates", output?.dispatchedUpdates || context.dispatchedUpdates);
  return {
    resources: output?.resources || context.resources,
    resourcesUpdates: output?.resourcesUpdates || context.resourcesUpdates,
    dispatchedUpdates: output?.dispatchedUpdates || context.dispatchedUpdates,
  };
});
