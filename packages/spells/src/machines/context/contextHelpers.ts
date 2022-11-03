import { cloneDeep, isEqual, keyBy, merge, mergeWith, omitBy } from "lodash";
import {
  $TSFixMe,
  TCreateMachineContext,
  TCreateUpdateDeleteResourceConfig,
  TCreateUpdateDeleteResourceOptions,
  TRelateManyConfig,
  TUnrelateManyConfig,
  TSpellModelOptionsMap,
} from "../../types";
import { isIdLocal } from "../../models/idHelpers";
import { logger } from "../../wizardDebugger";

export const emptyMachineContext = { resources: {}, resourcesUpdates: {} };

// Pull redux data + setup matching context for machines
// When initializing a machine/using this function, storeProps can be accessed w/ store.getState()
// TODO: Properly type
export function prepMachineContextWithResources(
  wizardModels: TSpellModelOptionsMap,
  resources: $TSFixMe = {}
): TCreateMachineContext {
  return {
    resources: Object.keys(wizardModels).reduce(
      (r, modelName) => ({
        ...r,
        [modelName]: keyBy(resources[modelName], "id") || {},
      }),
      {}
    ),
    resourcesUpdates: Object.keys(wizardModels).reduce(
      (r, modelName) => ({
        ...r,
        [modelName]: { create: [], update: [], delete: [], relate: [], unrelate: [] },
      }),
      {}
    ),
  };
}

// Helper merge function to ensure I don't mix up the merge order or forget the array handling case (handle nulls?)
const resourceMergeWith = (baseResourceProps: Record<string, any>, newProps: Record<string, any>) => {
  return mergeWith(cloneDeep(baseResourceProps), cloneDeep(newProps), (objValue, srcValue) => {
    // always replace Array values (instead of trying to recursively merge them)
    if (Array.isArray(objValue)) return srcValue;
  });
};

const omitByRemoveNulls = (value) => {
  if (value == null)
    logger.warning(
      "Avoid using 'null' as a default resource property! This may lead to unintentional resourcesUpdates that clear values."
    );
  return value == null;
};

// When using CRUD machines, it's much easier to prep the resources/resourcesUpdates context with the resource
// Besides passing in an id, we can pass in props such as relations (look at FilerAddressEditingMachine)
// OPTIMIZE: Default properties being passed in cause unnecessary CRUD update oeprations, that just reaffirm existing properties. Idk maybe theres a way to diff and reduce
export function upsertResourceOnContext(
  ctxParam,
  config: TCreateUpdateDeleteResourceConfig | TCreateUpdateDeleteResourceConfig[],
  options?: TCreateUpdateDeleteResourceOptions
): TCreateMachineContext {
  const ctx = cloneDeep(ctxParam);
  const setups = Array.isArray(config) ? config : [config];
  for (const setup of setups) {
    const { modelName, id, props } = setup;
    logger.debug(`upsertResourceOnContext: ${modelName} (id:'${id}')`, props);
    // Require a resource slice to have been loaded unless we're in outline mode
    if (!ctx.resources[modelName] && options?.outlineMode !== true) {
      throw new Error(`Resource modelName is missing from machine context: '${modelName}'. Cannot setup resource.`);
    }
    const hasResource = ctx.resources?.[modelName]?.[id] != null;
    logger.info("hellooooooo");
    // If a local id & resource is not found
    if (isIdLocal(id)) {
      logger.info("before local update:", ctx);
      // -- Create resource + resource update CRUD create (and include the relation if exists)
      ctx.resources[modelName][id] = merge(cloneDeep({ id, ...props }), cloneDeep(ctx.resources[modelName][id] || {}));
      ctx.resourcesUpdates[modelName].create = ctx.resourcesUpdates[modelName].create.some((c) => c.id === id)
        ? ctx.resourcesUpdates[modelName].create.map((c) =>
            c.id === id ? merge(cloneDeep(omitBy(props, omitByRemoveNulls)), c) : c
          )
        : ctx.resourcesUpdates[modelName].create.concat({ id, ...omitBy(props, omitByRemoveNulls) });

      logger.info("after local update: ", ctx);
    } else if (hasResource) {
      // -- Stamp the relation on the resource if it doesn't already have it. Will go on update route as opposed to create
      // -- FILTER NULL values that are machine defaults so they don't linger in resourceUpdates update calls and clear values that may exist but just weren't updated
      // mergeWith mutates the obj, so we're doing cloneDeep just to ensure we have no side-effects
      const updatedResource = resourceMergeWith(ctx.resources[modelName][id], props);
      if (isEqual(ctx.resources[modelName][id], updatedResource)) {
        logger.debug(`upsertResourceOnContext: hasResource === true, skipping update for ${modelName}(id:'${id}')`, {
          clonedProps: cloneDeep(props),
          clonedResource: cloneDeep(ctx.resources[modelName][id]),
          updatedResource,
        });
        continue; // if the existing resource already has these props, there's nothing to update!
      }
      ctx.resources[modelName][id] = updatedResource;
      ctx.resourcesUpdates[modelName].update = ctx.resourcesUpdates[modelName].update.some((u) => u.id === id)
        ? ctx.resourcesUpdates[modelName].update.map((u) =>
            u.id === id ? merge(cloneDeep(omitBy(props, omitByRemoveNulls)), u) : u
          )
        : ctx.resourcesUpdates[modelName].update.concat({ id, ...omitBy(props, omitByRemoveNulls) });
      // OR we created a resource external to the interview and need to merge it in (ex: caseFile uploads)
    } else if (!isIdLocal(id) && !hasResource && modelName && id) {
      // --- Add to resources
      ctx.resources[modelName][id] = cloneDeep({ id, ...props });
      // --- TODO: Prune any deletes referencing this id
    } else {
      logger.error(`upsertResourceOnContext: Failed to setup '${modelName}' resource with id '${id}'`);
    }
  }
  return ctx;
}

// When needing to apply an update to a resource in a transition action, makes things easier
export function updateResourceOnContext(
  ctxParam,
  config: TCreateUpdateDeleteResourceConfig | TCreateUpdateDeleteResourceConfig[]
): TCreateMachineContext {
  const ctx = cloneDeep(ctxParam);
  const setups = Array.isArray(config) ? config : [config];
  for (const setup of setups) {
    const { modelName, id, props } = setup;

    const hasResource = ctx.resources?.[modelName]?.[id] != null;
    if (hasResource) {
      // mergeWith mutates the obj, so we're doing cloneDeep just to ensure we have no side-effects
      const updatedResource = resourceMergeWith(ctx.resources[modelName][id], props);
      if (isEqual(ctx.resources[modelName][id], updatedResource)) {
        continue; // if the existing resource already has these props, there's nothing to update!
      }
      ctx.resources[modelName][id] = updatedResource;
      if (isIdLocal(id) && ctx.resourcesUpdates[modelName].create.some((c) => c.id === id)) {
        ctx.resourcesUpdates[modelName].create = ctx.resourcesUpdates[modelName].create.map((c) =>
          c.id === id ? resourceMergeWith(c, props) : c
        );
      } else {
        ctx.resourcesUpdates[modelName].update = ctx.resourcesUpdates[modelName].update.some((u) => u.id === id)
          ? ctx.resourcesUpdates[modelName].update.map((u) => (u.id === id ? resourceMergeWith(u, props) : u))
          : ctx.resourcesUpdates[modelName].update.concat({ id, ...props });
      }
    } else {
      logger.error(`updateResourceOnContext: Failed to update '${modelName}' resource with id '${id}'`);
    }
  }
  return ctx;
}

// When using CRUD machines, and a DELETE event occurs, this helper updates resources/resourcesUpdates so they be re-assign()'d (look at FilerAddressEditingMachine)
// TODO: With props, we can probably do some sort of relation checking. Probably need to do unrelates
export function deleteResourceOnContext(
  ctxParam,
  config: TCreateUpdateDeleteResourceConfig | TCreateUpdateDeleteResourceConfig[]
): TCreateMachineContext {
  const ctx = cloneDeep(ctxParam);
  const setups = Array.isArray(config) ? config : [config];
  for (const setup of setups) {
    const { modelName, id } = setup;
    const hasResource = ctx.resources?.[modelName]?.[id] != null;
    if (hasResource) {
      logger.info(`deleteResourceOnContext: deleting ${modelName}.${id}`);
      // Rmv from resources
      delete ctx.resources[modelName][id];
      // Clear resource updates for this
      ["create", "update"].forEach((crud) => {
        ctx.resourcesUpdates[modelName][crud] = ctx.resourcesUpdates[modelName][crud].filter((ru) => ru.id !== id);
      });
      ["relate", "unrelate"].forEach((rel) => {
        ctx.resourcesUpdates[modelName][rel] = ctx.resourcesUpdates[modelName][rel].filter((r) => r.resourceId !== id);
      });
      // Add a deletion if not local id
      if (!isIdLocal(id)) ctx.resourcesUpdates[modelName].delete.push({ id });
    } else {
      logger.error(`deleteResourceOnContext: Failed to delete '${modelName}' resource with id '${id}'`);
    }
  }
  // Return ctx
  return ctx;
}

export function unrelateManyResourceOnContext(
  ctxParam,
  { left, right }: { left: TUnrelateManyConfig; right?: TUnrelateManyConfig }
): TCreateMachineContext {
  const ctx = cloneDeep(ctxParam);
  // LEFT (Required) >>>
  // Use from Left unrelate to adjust resources + create unrelate records
  // --- If no id, loop over every resource
  const leftResources: $TSFixMe[] =
    left.id == null ? Object.values(ctx.resources[left.modelName]) : [ctx.resources[left.modelName]?.[left.id]];
  leftResources.forEach((leftResource) => {
    if (Array.isArray(ctx.resources[left.modelName]?.[leftResource.id]?.[left.relation])) {
      // For each,
      ctx.resources[left.modelName][leftResource.id][left.relation] = ctx.resources[left.modelName][leftResource.id][
        left.relation
      ].filter((rel) => {
        // --- Filter resourcesUpdates relates so we don't submit relates/unrelates for same resource
        ctx.resourcesUpdates[left.modelName].relate = ctx.resourcesUpdates[left.modelName].relate.filter(
          (un) => !(un.resourceId === leftResource.id && un.relation === left.relation && un.relatedId === rel.id)
        );
        // --- If relatedId, unrelate only one item
        if (left.relatedId != null) {
          if (rel.id !== left.relatedId) {
            return true;
          }
          // TODO: Probably need to consider/conditional on localIds
          ctx.resourcesUpdates[left.modelName].unrelate.push({
            resourceId: leftResource.id,
            relation: left.relation,
            relatedId: left.relatedId,
          });
          return false;

          // --- If no related resource, unrelate everything
        }
        // TODO: Probably need to consider/conditional on localIds
        ctx.resourcesUpdates[left.modelName].unrelate.push({
          resourceId: leftResource.id,
          relation: left.relation,
          relatedId: rel.id,
        });
        return false;
      });
    } else {
      logger.warning(`Resource slice '${left.modelName}' did not have relation '${left.relation}' loaded`);
    }
  });
  // <<< RIGHT
  if (right && right.modelName) {
    // Use right just to adjust resources on other models loaded in with a similar relation
    const rightResources: $TSFixMe[] =
      right.id == null ? Object.values(ctx.resources[right.modelName]) : [ctx.resources[right.modelName]?.[right.id]];
    rightResources.forEach((rightResource) => {
      if (Array.isArray(ctx.resources[right.modelName]?.[rightResource.id]?.[right.relation])) {
        // For each,
        ctx.resources[right.modelName][rightResource.id][right.relation] = ctx.resources[right.modelName][
          rightResource.id
        ][right.relation].filter((rel) => {
          // --- If relatedId, unrelate only one item
          if (right.relatedId != null) {
            if (rel.id !== right.relatedId) {
              return true;
            }
            return false;

            // --- If no related resource, unrelate everything
          }
          return false;
        });
      } else {
        logger.warning(`Resource slice '${right.modelName}' did not have relation '${right.relation}' loaded`);
      }
    });
  }
  // Return with cleaned resource relation arrays + new unrelate records
  return ctx;
}

export function relateManyResourceOnContext(
  ctxParam,
  { left, right }: { left: TRelateManyConfig; right?: TRelateManyConfig }
): TCreateMachineContext {
  const ctx = cloneDeep(ctxParam);
  // LEFT (Required) >>>
  if (Array.isArray(ctx.resources[left.modelName]?.[left.id]?.[left.relation])) {
    // --- Append to resources (if doesn't already exist)
    if (!ctx.resources[left.modelName][left.id][left.relation]?.some((rel) => rel.id === left.relatedId)) {
      ctx.resources[left.modelName][left.id][left.relation].push({
        id: left.relatedId,
        ...(left.extras || {}),
      });
    }
    // --- Append to resourcesUpdates (if doesn't already exist)
    if (
      !ctx.resourcesUpdates[left.modelName].relate?.some(
        (rel) => rel.resourceId === left.id && rel.relation === left.relation && rel.relatedId === left.relatedId
      )
    ) {
      ctx.resourcesUpdates[left.modelName].relate.push({
        resourceId: left.id,
        relation: left.relation,
        relatedId: left.relatedId,
        extras: typeof left.extras === "object" ? left.extras : undefined,
      });
    }
    // --- Filter resourcesUpdates unrelates so we don't submit relates/unrelates for same resource
    ctx.resourcesUpdates[left.modelName].unrelate = ctx.resourcesUpdates[left.modelName].unrelate.filter(
      (un) => !(un.resourceId === left.id && un.relatedId === left.relatedId)
    );
  } else {
    logger.warning(`Resource slice '${left.modelName}' did not have relation '${left.relation}' loaded`);
  }
  // <<< RIGHT
  if (right && right.modelName) {
    if (Array.isArray(ctx.resources[right.modelName]?.[right.id]?.[right.relation])) {
      // --- Append to resources (if doesn't already exist)
      if (!ctx.resources[right.modelName][right.id][right.relation]?.some((rel) => rel.id === right.relatedId)) {
        ctx.resources[right.modelName][right.id][right.relation].push({
          id: right.relatedId,
          ...(right.extras || {}),
        });
      }
    } else {
      logger.warning(`Resource slice '${right.modelName}' did not have relation '${right.relation}' loaded`);
    }
  }
  return ctx;
}
