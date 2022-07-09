import { cloneDeep } from "lodash";
import { resolveAssignId } from "../../models/resolveAssignId";
import { $TSFixMe } from "../../types";
import { logger } from "../../wizardDebugger";

// Given a resource node/assign config, whats the path that will be looked to on our validation map
export const validationKeyForNode = (node, { ctx, functions, contentTree }: $TSFixMe) => {
  // VALIDATION KEY (used if assign is a function)
  if (node.validationKey && typeof node.validationKey === "object") {
    // --- modelNames
    if (node.validationKey?.modelName && node.validationKey?.id) {
      return node.validationKey?.path
        ? `resources.${node.validationKey.modelName}[${node.validationKey.id}].${node.validationKey.path}`
        : `resources.${node.validationKey.modelName}[${node.validationKey.id}]`;
    }
    // --- path
    if (node.validationKey?.path) return node.validationKey.path;
  }
  // ASSIGN
  // --- obj
  if (node.assign != null && typeof node.assign === "object" && !Array.isArray(node.assign)) {
    // --- modelNames
    if (node.assign?.modelName && node.assign?.id) {
      return `resources.${node.assign.modelName}[${resolveAssignId({
        context: ctx,
        assignIdOrTemplateOrJsonLogic: node.assign.id,
        functions,
        contentTree: node.contentTree ?? contentTree,
      })}]${node.assign.path && String(node.assign.path)?.length > 0 ? `.${node.assign.path}` : ""}`.trim();
    } else if (node.assign?.modelName && node.assign?.id == null) {
      logger.error("validationKeyForNode: modelName provided, but id is null/undefined", cloneDeep(node));
    }
    // --- path/value
    if (node.assign?.path && node.assign?.value != null) return node.assign.path;
  }
  // --- str
  if (typeof node.assign === "string") return node.assign;

  // ERROR: if we're calling this for an input, validation map, etc. we should have returned something
  if (node.assign || node.validationKey) {
    logger.warning("validationKeyForNode: Cannot determine validation key for node", cloneDeep(node));
  }
};
