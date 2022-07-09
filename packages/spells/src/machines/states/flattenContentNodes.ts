import { cloneDeep } from "lodash";
import { ContentNodeType } from "../../constants/contentNodeConstants";
import { resolveAssignId } from "../../models/resolveAssignId";
import { $TSFixMe } from "../../types";
import { logger } from "../../wizardDebugger";
import {
  evalConditionalOptions,
  evalConditionalValue,
  evalForEachItemContentNodes,
  evalForEachItems,
} from "./evalContentNodeHelpers";

type TFlattenContentNodes = {
  contentNodes: $TSFixMe;
  contentTree?: $TSFixMe;
  context: $TSFixMe;
  flattenFrom?: any; // just a way to log what called this function
  functions: $TSFixMe;
};

// Flatten content nodes helper for counting and setting up resources
export const flattenContentNodes = ({
  contentNodes,
  contentTree,
  context: ctx,
  flattenFrom,
  functions,
}: TFlattenContentNodes) => {
  logger.debug("flattenContentNodes: ", cloneDeep({ contentNodes, contentTree, context: ctx, flattenFrom, functions }));
  const nodes = cloneDeep(contentNodes);
  const flattenedNodes = [];
  // Loop through nodes, push to flattened nodes as we shift througn nodes loop
  while (nodes.length) {
    // --- setup (TODO: + append contentTree???)
    const node = nodes.shift();

    // --- If array or explicit row, count and queue children
    if (Array.isArray(node)) {
      nodes.push(...node);
      flattenedNodes.push({ type: ContentNodeType.ROW, content: [] });
      // --- If explicit row node
    } else if (node.type === ContentNodeType.ROW) {
      const extendedRowNodes = node.content.map((c) => ({ ...c, contentTree: node.contentTree ?? contentTree }));
      nodes.push(...extendedRowNodes);
      flattenedNodes.push(node);
      // --- If forEach
    } else if (node.type === ContentNodeType.FOR_EACH) {
      const evalItems = evalForEachItems(node, { context: ctx });
      const evalItemsContentNodes =
        evalItems
          ?.map((item, itemIndex, items) =>
            // before appending to node processing list, attach the contentTree to this layer
            evalForEachItemContentNodes(node, item, itemIndex, items, ctx).map((node) => ({
              ...node,
              contentTree: { node: { ...item, node: contentTree } },
            }))
          )
          ?.flat() ?? [];
      logger.debug("flattenContentNodes: forEach: ", cloneDeep({ evalItems, evalItemsContentNodes }));
      nodes.push(...evalItemsContentNodes);
      // nodes.push(...evalItemsContentNodes);
      flattenedNodes.push(node);
      // --- If Card
    } else if (node.type === ContentNodeType.CARD) {
      const extendedCardNodes = node.content.map((c) => ({ ...c, contentTree: node.contentTree ?? contentTree }));
      nodes.push(...extendedCardNodes);
      flattenedNodes.push({ type: ContentNodeType.CARD, content: [] });
      // --- If Callout
    } else if (node.type === ContentNodeType.CALLOUT && node.content) {
      const extendedCalloutNodes = node.content.map((c) => ({ ...c, contentTree: node.contentTree ?? contentTree }));
      nodes.push(...extendedCalloutNodes);
      flattenedNodes.push({ type: ContentNodeType.CALLOUT, content: [] });
      // --- If Collapsible Panel
    } else if (node.type === ContentNodeType.COLLAPSIBLE_PANEL) {
      const extendedPanelNodes = node.content.map((c) => ({ ...c, contentTree: node.contentTree ?? contentTree }));
      nodes.push(...extendedPanelNodes);
      flattenedNodes.push({ type: ContentNodeType.COLLAPSIBLE_PANEL, content: [] });
      // --- If conditional, evaluate and then queue
    } else if (node.type === ContentNodeType.CONDITIONAL && node.conditional) {
      const condOptions = evalConditionalOptions(node);
      const condValue = evalConditionalValue(node, { context: ctx });
      const conditionalNodes = condOptions[condValue] ?? [];
      logger.debug("flattenContentNodes: conditional", cloneDeep({ node, condOptions, condValue, conditionalNodes }));
      nodes.push(...conditionalNodes);
      flattenedNodes.push(node);
      // --- If resource editor, push content w/ mapped assign configs (needed for generateValidationMap())
    } else if (node.type === ContentNodeType.RESOURCE_EDITOR && node.content) {
      const resourceEditorNodes = flattenContentNodes({
        contentNodes: node.content,
        context: ctx,
        functions,
        flattenFrom: node,
        contentTree: node.contentTree ?? contentTree, // nodes should already be flattened, so just reference this resourceEditor.contentTree
      });
      const extendedResourceEditorNodes = resourceEditorNodes.map((editorNode) => ({
        ...editorNode,
        assign:
          editorNode.assign && node.config
            ? {
                ...editorNode.assign,
                id: resolveAssignId({
                  context: ctx,
                  assignIdOrTemplateOrJsonLogic: node.config.resourceId,
                  functions,
                  contentTree: node.contentTree ?? contentTree, // nodes should already be flattened, so just reference this resourceEditor.contentTree
                }),
                modelName: node.config.modelName,
              }
            : editorNode.assign,
      }));
      logger.debug(
        "flattenContentNodes: resourceEditor",
        cloneDeep({ node, resourceEditorNodes, extendedResourceEditorNodes })
      );
      nodes.push(...extendedResourceEditorNodes);
      flattenedNodes.push(node);
    } else {
      flattenedNodes.push(node);
    }
  }
  return flattenedNodes;
};

// Count recursively to handle nested conditional nodes
// This gives back a higher number than expected since it'll repeat nested nodes
// This is somewhat intended because we're largely using this to check that state/content has change and trigger a re-evaluation of validation
export const countContentNodes = ({ contentNodes, context, functions }) =>
  flattenContentNodes({ contentNodes, context, functions, flattenFrom: "countContentNodes" }).length;
