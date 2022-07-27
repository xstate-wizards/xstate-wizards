import { JSONSchema7 } from "json-schema";
import { castArray, cloneDeep, isObject, merge } from "lodash";
import { $TSFixMe } from "../types";
import { logger } from "../wizardDebugger";
// Forked from: https://raw.githubusercontent.com/MGDIS/json-schema-defaults/master/lib/defaults.js

/**
 * get object by reference. works only with local references that points on
 * definitions object
 *
 * @param {String} path
 * @param {Object} definitions
 * @return {Object}
 */
const getLocalRef = function (path, definitions) {
  path = path.replace(/^#\/definitions\//, "").split("/");
  var find = function (path, root) {
    const key = path.shift();
    if (!root[key]) {
      return {};
    } else if (!path.length) {
      return root[key];
    } else {
      return find(path, root[key]);
    }
  };
  const result = find(path, definitions);
  if (!isObject(result)) {
    return result;
  }
  return cloneDeep(result);
};

/**
 * merge list of objects from allOf properties
 * if some of objects contains $ref field extracts this reference and merge it
 *
 * @param {Array} allOfList
 * @param {Object} definitions
 * @return {Object}
 */
const mergeAllOf = function (allOfList, definitions) {
  let length = allOfList.length,
    index = -1,
    result = {};
  while (++index < length) {
    let item = allOfList[index];
    item = typeof item["$ref"] !== "undefined" ? getLocalRef(item["$ref"], definitions) : item;
    result = merge(result, item);
  }
  return result;
};

/**
 * returns a object that built with default values from json schema
 *
 * @param {Object} schema
 * @param {Object} definitions
 * @return {Object}
 */
const defaults = function (schema, definitions) {
  const schemaWithDefaults = { properties: {} };
  if (typeof schema["default"] !== "undefined") {
    return schema["default"];
  } else if (typeof schema["allOf"] !== "undefined") {
    const mergedItem = mergeAllOf(schema["allOf"], definitions);
    return defaults(mergedItem, definitions);
  } else if (typeof schema["$ref"] !== "undefined") {
    const reference = getLocalRef(schema["$ref"], definitions);
    return defaults(reference, definitions);
  } else if (castArray(schema.type).includes("object")) {
    if (!schema.properties) {
      return {};
    }
    for (const key in schema.properties) {
      if (schema.properties.hasOwnProperty(key)) {
        schemaWithDefaults.properties[key] = defaults(schema.properties[key], definitions);
        if (typeof schemaWithDefaults.properties[key] === "undefined") {
          delete schemaWithDefaults.properties[key];
        }
      }
    }
    return schemaWithDefaults.properties;
  } else if (castArray(schema.type).includes("array")) {
    if (!schema.items) {
      return [];
    }
    return [defaults(schema.items, definitions)];
  }
};

/**
 * main function
 *
 * @param {Object} schema
 * @param {Object|undefined} definitions
 * @return {Object}
 */
export const getJsonSchemaDefaults = (schema: JSONSchema7, definitions?: $TSFixMe) => {
  if (typeof definitions === "undefined") {
    definitions = schema.definitions || {};
  } else if (isObject(schema.definitions)) {
    definitions = merge(definitions, schema.definitions);
  }
  const jsonSchemaDefaults = defaults(cloneDeep(schema), definitions);
  logger.debug("getJsonSchemaDefaults: ", jsonSchemaDefaults);
  return jsonSchemaDefaults;
};
