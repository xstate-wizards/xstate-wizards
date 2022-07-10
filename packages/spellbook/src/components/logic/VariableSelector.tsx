import { castArray, cloneDeep, uniq } from "lodash";
import React from "react";
import { $TSFixMe, ContentNodeType } from "@xstate-wizards/spells";

type TVariableSelectorProps = {
  contentTree?: $TSFixMe;
  // need this bc input assign values don't contain the context prefix...
  //  ... but json-logic handlers need context.xyz to distinguish between event and content tree data
  invokedSchema?: $TSFixMe;
  isAssignSelector?: boolean;
  models?: $TSFixMe;
  onChange?: $TSFixMe;
  schema?: $TSFixMe;
  state?: $TSFixMe;
  states?: $TSFixMe;
  value?: $TSFixMe;
};

const getPropertiesRecursively = (arr: string[], obj: Record<string, any>, parentPath?: string) => {
  for (const k in obj) {
    // if we're looking at the obj & properites, then add them all into arr
    if (k === "properties") {
      Object.keys(obj[k]).forEach((propertyKey) => {
        const joinedPropPath = [parentPath, propertyKey].filter((str) => str).join(".");
        if (castArray(obj.properties?.[propertyKey]?.type).includes("object")) {
          getPropertiesRecursively(arr, obj.properties?.[propertyKey], joinedPropPath);
        } else {
          arr.push(joinedPropPath);
        }
      });
    }
  }
  return arr;
};

const getEventDataKeysRecursively = (arr: string[], obj: Record<string, any>, parentPath?: string) => {
  for (const k in obj) {
    const joinedPropPath = [parentPath, k].filter((str) => str).join(".");
    if (obj[k] && typeof obj[k] == "object" && obj[k]?.type !== "jsonLogic") {
      // --- if an obj, still push the path in case we want to push whole objs
      arr.push(joinedPropPath);
      // --- dive another layer down
      getEventDataKeysRecursively(arr, obj[k], joinedPropPath);
    } else {
      // --- if not an obj (or will be evaluated json-logic) push
      arr.push(joinedPropPath);
    }
  }
  return arr;
};

// When we recursively check event.data.property options, we need to check events in nested loops/containers
const flattenContentNodesNaively = (contentNodes): $TSFixMe[] => {
  const nodes = cloneDeep(contentNodes);
  const flattenedNodes = [];
  while (nodes.length) {
    const node = nodes.shift();
    if (
      [
        ContentNodeType.CALLOUT,
        ContentNodeType.CARD,
        ContentNodeType.COLLAPSIBLE_PANEL,
        ContentNodeType.FOR_EACH,
        ContentNodeType.RESOURCE_EDITOR,
        ContentNodeType.ROW,
      ].includes(node.type)
    ) {
      nodes.push(...(node.content ?? []));
      flattenedNodes.push(node);
    } else if (ContentNodeType.CONDITIONAL === node.type) {
      for (const k in node.options) {
        nodes.push(...node.options[k]);
      }
    } else {
      flattenedNodes.push(node);
    }
  }
  return flattenedNodes;
};

const getEventDataProperties = (contentNodes: any[]) =>
  flattenContentNodesNaively(contentNodes ?? [])
    .filter((cn) => cn.event?.data)
    .map((cn) => getEventDataKeysRecursively([], cn.event.data))
    .flat()
    .sort();

export const VariableSelector: React.FC<TVariableSelectorProps> = ({
  contentTree,
  invokedSchema,
  isAssignSelector,
  models,
  onChange,
  schema,
  state,
  states,
  value,
}) => {
  // SETUP
  // --- get this spell's schema for context.XYZ selection
  const selectableSchemaProperties = getPropertiesRecursively([], schema);
  const selectableInvokedSchemaProperties = getPropertiesRecursively([], invokedSchema ?? {});
  // --- recursively go through content node event data objects to get potentially selectable keys
  const selectableEventDataProperties = uniq(getEventDataProperties(state.content));
  // --- go through all the states content nodes to see if any incoming
  const allSelectableEventDataPrporeties = uniq(
    Object.values(states ?? {})
      ?.filter((st: $TSFixMe) => Array.isArray(st.content))
      ?.map((st: $TSFixMe) => getEventDataProperties(st.content))
      .flat()
  ).sort();

  // RENDER
  return (
    <select
      value={isAssignSelector === true ? `context.${value}` : value}
      onChange={(e) => onChange(isAssignSelector === true ? e.target.value.replace("context.", "") : e.target.value)}
    >
      <option value="">---</option>
      {/* machine context via schema */}
      <optgroup label="Context (Vars)">
        {selectableSchemaProperties.map((prop) => (
          <option key={prop} value={`context.${prop}`}>
            {`context.${prop}`}
          </option>
        ))}
      </optgroup>
      {/* machine context via models */}
      {models && (
        <optgroup label="Context (Models)">
          {Object.keys(models ?? {}).map((modelName) => (
            <option key={modelName} value={`context.resources.${modelName}`}>
              {`context.resources.${modelName}`}
            </option>
          ))}
        </optgroup>
      )}
      {/* content node event.data or invoked machine finalCtx+schema reference */}
      {state.invoke != null || selectableEventDataProperties?.length > 0 ? (
        <optgroup label="Event Data (from this state)">
          <option value="event.data">event.data</option>
          {selectableEventDataProperties?.map((prop) => (
            <option key={prop} value={`event.data.${prop}`}>
              {`event.data.${prop}`}
            </option>
          ))}
        </optgroup>
      ) : null}
      {states && allSelectableEventDataPrporeties?.length > 0 ? (
        <optgroup label="Event Data (from all states)">
          {allSelectableEventDataPrporeties.map((prop) => (
            <option key={prop} value={`event.data.${prop}`}>
              {`event.data.${prop}`}
            </option>
          ))}
        </optgroup>
      ) : null}
      {state.key ? (
        <optgroup label="Event Data (from spawned machine)">
          {/* from invoked schema */}
          {selectableInvokedSchemaProperties?.map((prop) => (
            <option key={prop} value={`event.data.finalCtx.${prop}`}>
              {`event.data.finalCtx.${prop}`}
            </option>
          ))}
          {/* from final event */}
          <option value="event.data.finalEvent.type">event.data.finalEvent.type</option>
        </optgroup>
      ) : null}
      {/* TODO: content node loops */}
      {contentTree && (
        <optgroup label="Content/Node Tree">
          {contentTree?.node != null && <option value="content.node">content.node</option>}
          {contentTree?.node?.node != null && <option value="content.node.node">content.node.node</option>}
          {contentTree?.node?.node?.node != null && (
            <option value="content.node.node.node">content.node.node.node</option>
          )}
        </optgroup>
      )}
    </select>
  );
};
