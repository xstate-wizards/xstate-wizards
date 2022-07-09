import { cloneDeep, get } from "lodash";
import { logger } from "../../wizardDebugger";
import { validateInputValue } from "../../validation/validateInputValue";
import { flattenContentNodes } from "./flattenContentNodes";
import { validationKeyForNode } from "./validationKeyForNode";
import { TContentNodeValidationMap } from "../../types";

// Assess validation errors on every field via assign path {}
export const generateValidationMap = ({ contentNodes, meta, state, serializations }) => {
  logger.debug("generateValidationMap: Start", { contentNodes, meta, state, serializations });
  const nodes = flattenContentNodes({
    contentNodes,
    context: state.context,
    functions: serializations?.functions,
    flattenFrom: "generateValidationMap",
  });
  logger.debug("generateValidationMap: Flattened", cloneDeep([...nodes]));

  // Build validation map
  const validationMap = {};
  while (nodes.length) {
    const node = nodes.shift();
    // validation keys can be a string of values, so we want to use lodash get() instead of optional chaining
    const validationKey = validationKeyForNode(node, {
      ctx: state.context,
      functions: serializations.functions,
    });
    // ....when mounting resources, they may have not been initialized yet so we may be evaluating context too early...
    if (!validationKey) {
      // If its an address, step through its config to see what fields are enabled
    } else if (validationKey && node.type === "address" && node.config) {
      Object.keys(node.config).forEach((key) => {
        validationMap[validationKey.concat(`.${key}`)] = {
          dirty: meta.showValidateErrorsAtEntry
            ? validateInputValue(
                node.config[key]?.validations,
                get(get(state.context, validationKey), key),
                serializations?.validations
              ) != null
            : false,
          validationError: validateInputValue(
            node.config[key]?.validations,
            get(get(state.context, validationKey), key),
            serializations?.validations
          ),
        };
      });
      // Otherwise run validation
    } else if (validationKey && node.validations) {
      validationMap[validationKey] = {
        dirty: meta.showValidateErrorsAtEntry
          ? validateInputValue(node.validations, get(state.context, validationKey), serializations?.validations) != null
          : false,
        validationError: validateInputValue(
          node.validations,
          get(state.context, validationKey),
          serializations?.validations
        ),
      };
    }
  }

  logger.info("generateValidationMap: Generated", validationMap);
  return validationMap;
};

// Simple check to see if all validation keys have null err messages
export const isEveryInputValid = (validationMap: TContentNodeValidationMap) => {
  return Object.values(validationMap || {}).every((instruct) => instruct?.validationError == null);
};
