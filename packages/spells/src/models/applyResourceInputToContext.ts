import { isEqual, get, set } from "lodash";

// Function that take machine context and applys a resource input to it, returning an updated context
export const applyResourceInputToContext = (ctx, assignConfig, value) => {
  const actionKey =
    assignConfig.id && typeof assignConfig.id === "string" && assignConfig.id.includes("local") ? "create" : "update";
  const assignConfigValue =
    assignConfig?.value !== undefined
      ? assignConfig?.value
      : typeof assignConfig?.transformValue?.to === "function"
      ? assignConfig.transformValue.to(value)
      : value;

  const assignConfigPath = `${assignConfig.modelName}[${assignConfig.id}].${assignConfig.path}`;
  if (isEqual(assignConfigValue, get(ctx.resources, assignConfigPath))) {
    return ctx; // if the new value is the same as the existing value, exit early and do nothing!
  }
  const resources = set(ctx.resources, assignConfigPath, assignConfigValue);

  if (!ctx.resourcesUpdates[assignConfig.modelName])
    throw new Error(
      `Resource slice is missing from machine context: '${assignConfig.modelName}'. Cannot setup resource.`
    );
  const resourcesUpdates = {
    ...ctx.resourcesUpdates,
    [assignConfig.modelName]: {
      ...ctx.resourcesUpdates[assignConfig.modelName],
      [actionKey]: (ctx.resourcesUpdates[assignConfig.modelName][actionKey] || []).some((u) => u.id === assignConfig.id)
        ? (ctx.resourcesUpdates[assignConfig.modelName][actionKey] || []).map((update) => {
            // If update relates to other resource, skip
            if (update.id !== assignConfig.id) return update;
            // Update the input key (in the cases of addresses where we pass an object, merge. We need to merge so we can get id of nested relation)
            // OPTIMIZE: Maybe we can just grab the id of the child relation rather than merge?
            let updates = set(update, assignConfig.path, assignConfigValue);
            // Add relations id if updates are nested within other models (ex: claim > creditor > address)
            assignConfig.path.split(".").forEach((path, pathIndex, paths) => {
              if (
                get(ctx.resources[assignConfig.modelName][assignConfig.id], `${paths.slice(0, pathIndex).join(".")}.id`)
              ) {
                updates = set(
                  updates,
                  `${paths.slice(0, pathIndex).join(".")}.id`,
                  get(
                    ctx.resources[assignConfig.modelName][assignConfig.id],
                    `${paths.slice(0, pathIndex).join(".")}.id`
                  )
                );
              }
            });
            return updates;
          })
        : (ctx.resourcesUpdates[assignConfig.modelName][actionKey] || []).concat(
            (() => {
              let updates = set({ id: assignConfig.id }, assignConfig.path, assignConfigValue);
              // Add relations id if updates are nested within other models. Was missing IDs so PUT requests failed
              assignConfig.path.split(".").forEach((path, pathIndex, paths) => {
                if (
                  get(
                    ctx.resources[assignConfig.modelName][assignConfig.id],
                    `${paths.slice(0, pathIndex).join(".")}.id`
                  )
                ) {
                  updates = set(
                    updates,
                    `${paths.slice(0, pathIndex).join(".")}.id`,
                    get(
                      ctx.resources[assignConfig.modelName][assignConfig.id],
                      `${paths.slice(0, pathIndex).join(".")}.id`
                    )
                  );
                }
              });
              return updates;
            })()
          ),
    },
  };
  return {
    ...ctx,
    resources,
    resourcesUpdates,
  };
};
