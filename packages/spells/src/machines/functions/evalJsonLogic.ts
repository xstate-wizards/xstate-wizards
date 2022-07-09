const datefns = require("date-fns"); // can't seem to import *
import jsonLogic from "json-logic-js";
const lodash = require("lodash"); // import * causes runtime err
import { $TSFixMe } from "../../types";
import { logger } from "../../wizardDebugger";

// JSON LOGIC (https://jsonlogic.com/operations.html)
// --- extra libs (native constructors)
jsonLogic.add_operation("Array", Array);
jsonLogic.add_operation("Number", Number);
jsonLogic.add_operation("Object", Object);
jsonLogic.add_operation("String", String);
// --- extra libs (others)
jsonLogic.add_operation("Date", Date);
jsonLogic.add_operation("date-fns", datefns);
jsonLogic.add_operation("lodash", lodash);
// @ts-expect-error
jsonLogic.add_operation("Math", Math);

// --- extra operators/methods
jsonLogic.add_operation("return", (...args) => args?.[0]); // a dumb simple way to just return at the top of a json-logic tree

// --- TODO: passed in by user of xstate-wizards library

type TEvalJsonLogicData = {
  context: $TSFixMe; // state machine context
  event?: $TSFixMe; // state machine event (accessible via actions, etc.)
  content?: $TSFixMe; // if we're nested into loops, we need to be able to access items within
};

export const evalJsonLogic = (rules: $TSFixMe, data: TEvalJsonLogicData): any => {
  logger.debug("evalJsonLogic", { data, rules });
  const result = jsonLogic.apply(rules, data);
  logger.debug("evalJsonLogic: Result", { data, rules, result });
  return result;
};

export const isJsonLogic = (data: any) => {
  const isObj = typeof data === "object" && data != null;
  const hasOneKey = isObj && Object.keys(data ?? {}).length === 1;
  const hasArgsArray = isObj && Array.isArray(Object.values(data)[0]);
  // TODO: evaluate better.... when we use all the rules things start breaking
  // return isObj;
  return isObj && hasOneKey && hasArgsArray;
};

export const setJsonLogicOperation = (functionName: string, fn: $TSFixMe): void => {
  logger.debug("setJsonLogicOperation: ", functionName);
  jsonLogic.add_operation(functionName, fn);
};
