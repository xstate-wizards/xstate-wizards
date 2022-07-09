import { castArray } from "lodash";
import { $TSFixMe } from "../../types";
import { logger } from "../../wizardDebugger";
import { evalJsonLogic, isJsonLogic } from "../functions/evalJsonLogic";
import { isEveryInputValid } from "./generateValidationMap";

const doesArrayOfItemsOrOptionsNeedMapping = (arrOfItemsOrOptions?: any[]): boolean =>
  arrOfItemsOrOptions?.every((opt) => ["boolean", "number", "string"].includes(typeof opt) || opt === null) === true;

// CONTENT NODES: conditional
export const evalConditionalOptions = (node: $TSFixMe) => {
  const evalOptions = node.options ?? {};
  // -- Prefixed with true/false because conditionally resourceEditors weren't mounting and setting resource defaults (since they shared index w/ other node)
  evalOptions.true = node?.options?.true ?? node.true;
  evalOptions.false = node?.options?.false ?? node.false;
  return evalOptions;
};

export const evalConditionalValue = (node: $TSFixMe, { context, content }: $TSFixMe, extras?: $TSFixMe) => {
  let val;
  // --- if a function
  if (typeof node.conditional === "function") {
    val = node.conditional(context, { isEveryInputValid: isEveryInputValid(extras?.validationMap) });
    // --- if json-logic
  } else if (isJsonLogic(node.conditional)) {
    val = evalJsonLogic(node.conditional, { context, content });
  } else {
    logger.error("ContentNode 'conditional' was not handled as a function or json logic.", node);
  }
  // HACK: Many conditionals don't resolve true/false explictly (ex: an object returned) so doing so here if options are only true/false
  const nodeOptions = evalConditionalOptions(node);
  const isBooleanOptions =
    Object.keys(nodeOptions).length === 2 &&
    Object.keys(nodeOptions).includes("false") &&
    Object.keys(nodeOptions).includes("true");
  if (isBooleanOptions && typeof val !== "boolean") {
    logger.warning(
      "ContentNode 'conditional' options are true/false but val is not a boolean. Auto-resolving to a boolean.",
      { node, value: val }
    );
  }
  return isBooleanOptions ? Boolean(val) : val;
};

// CONTENT NODES: forEach
export const evalForEachItems = (node: $TSFixMe, { context, content }: $TSFixMe) => {
  logger.debug("evalForEachItems:", { node });
  // --- if an array already, return
  if (Array.isArray(node.items)) {
    return node.items;
  }
  // --- if function
  if (typeof node.items === "function") {
    return node.items(context);
  }
  // --- if json logic, return evalauation
  if (isJsonLogic(node.items)) {
    const evaluatedItems = evalJsonLogic(node.items, { context, content });
    // it's helpful to do a mapping if these are just primitves, bc we can utilize string methods + it destructures well on contentTree
    if (doesArrayOfItemsOrOptionsNeedMapping(evaluatedItems)) {
      return evaluatedItems.map((opt) => ({ text: String(opt), value: opt }));
    }
    return evaluatedItems;
  }
  return [];
};

export const evalForEachItemContentNodes = (node, item, itemIndex, items, ctx) => {
  // --- if function, return as is
  if (typeof node?.content === "function") {
    return castArray(node.content(ctx, item, itemIndex, items));
  }
  // --- TODO: if json logic....???
  if (Array.isArray(node?.content)) {
    return node.content;
  }
  return [];
};

// handle node options as either the passed in value or json-logic to evaluate
export const evalSelectOptions = (options, { content, context }) => {
  if (options && Array.isArray(options)) {
    // --- if array, return
    return options;
  } else if (options && isJsonLogic(options)) {
    // --- if obj, try to eval as json-logic
    const evaluatedOptions = evalJsonLogic(options, { content, context });
    // --- if not array, throw
    if (!Array.isArray(evaluatedOptions)) throw new Error("evaluatedOptions is not an array");
    // --- if items are number/string/boolean, remap to text/value objects that content node expects
    if (doesArrayOfItemsOrOptionsNeedMapping(evaluatedOptions)) {
      return evaluatedOptions.map((opt) => ({ text: String(opt), value: opt }));
    }
    // --- if objects don't match text/value throw err ????
    if (!evaluatedOptions[0]?.hasOwnProperty("text") || !evaluatedOptions[0]?.hasOwnProperty("value"))
      throw new Error("evaluatedOptions is not an array");
    return evaluatedOptions;
  } else {
    // --- else throw err?
    logger.error("'options' is not an array or executable json-logic", options);
    return [];
  }
};
