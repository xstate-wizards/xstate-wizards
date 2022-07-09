import { isEqual } from "lodash";
import { assign } from "xstate";
import { $TSFixMe } from "../../types";
import { logger } from "../../wizardDebugger";

export const mergeEventDataResources = assign((ctx: $TSFixMe, ev: $TSFixMe) => {
  if (isEqual(ev?.data?.resources, ctx.resources)) {
    return ctx; // continue to use original context if resources did not change
  }
  logger.info("Resolving Machine: Resources", ev?.data?.resources || ctx.resources);
  logger.info("Resolving Machine: Resources Updates", ev?.data?.resourcesUpdates || ctx.resourcesUpdates);
  logger.info("Resolving Machine: Dispatched Updates", ev?.data?.dispatchedUpdates || ctx.dispatchedUpdates);
  return {
    resources: ev?.data?.resources || ctx.resources,
    resourcesUpdates: ev?.data?.resourcesUpdates || ctx.resourcesUpdates,
    dispatchedUpdates: ev?.data?.dispatchedUpdates || ctx.dispatchedUpdates,
  };
});
