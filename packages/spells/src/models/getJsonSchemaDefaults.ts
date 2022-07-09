import { JSONSchema7 } from "json-schema";
import { cloneDeep, isObject, merge } from "lodash";
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
var getLocalRef = function (path, definitions) {
  path = path.replace(/^#\/definitions\//, "").split("/");
  var find = function (path, root) {
    var key = path.shift();
    if (!root[key]) {
      return {};
    } else if (!path.length) {
      return root[key];
    } else {
      return find(path, root[key]);
    }
  };
  var result = find(path, definitions);
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
var mergeAllOf = function (allOfList, definitions) {
  var length = allOfList.length,
    index = -1,
    result = {};
  while (++index < length) {
    var item = allOfList[index];
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
var defaults = function (schema, definitions) {
  if (typeof schema["default"] !== "undefined") {
    return schema["default"];
  } else if (typeof schema["allOf"] !== "undefined") {
    var mergedItem = mergeAllOf(schema["allOf"], definitions);
    return defaults(mergedItem, definitions);
  } else if (typeof schema["$ref"] !== "undefined") {
    var reference = getLocalRef(schema["$ref"], definitions);
    return defaults(reference, definitions);
  } else if (schema.type === "object") {
    if (!schema.properties) {
      return {};
    }
    for (var key in schema.properties) {
      if (schema.properties.hasOwnProperty(key)) {
        schema.properties[key] = defaults(schema.properties[key], definitions);

        if (typeof schema.properties[key] === "undefined") {
          delete schema.properties[key];
        }
      }
    }
    return schema.properties;
  } else if (schema.type === "array") {
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
