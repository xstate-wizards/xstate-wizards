// VALIDATION RUNNER

import { TInputValidations, TValidationMap } from "../types";
import { logger } from "../wizardDebugger";
import { baseValidations } from "./baseValidations";
import { regexValidations } from "./regexValidations";

// TODO: Log when a validation string doesn't match a basic, regex, or serialized validator
export function validateInputValue(
  validations: TInputValidations = [],
  value?: string | number,
  serailizedValidations?: TValidationMap
): string | null {
  logger.debug("validateInputValue:", { validations, value, serailizedValidations });

  // FUNCTIONS PASSED IN (Allows context specific, business logic driven validation err messages to sit under inputs)
  if (validations.some((v) => typeof v === "function")) {
    for (const validation of validations.filter((v) => typeof v === "function")) {
      if (typeof validation === "function" && validation(value) != null) return validation(value);
    }
  }

  // BASIC VALIDATIONS
  for (const validation of validations) {
    if (typeof validation === "string" && baseValidations?.[validation]) {
      if (baseValidations[validation]?.(value, validations)) return baseValidations[validation](value, validations);
    }
  }

  // REGEX VALIDATIONS
  for (const validation of validations) {
    // --- check for validations that contain a "#" char in their str
    if (typeof validation === "string" && validation.includes("#")) {
      // --- split method + param (ex: "stringLength#4" => ["stringLength", "4"])
      const [regexValidator, param] = validation.split("#");
      if (regexValidations[regexValidator]?.(value, validations, param)) {
        return regexValidations[regexValidator](value, validations, param);
      }
    }
  }

  // CUSTOM VALIDATIONS (ex: SSN, zipcodes, business logic, etc.)
  for (const validation of validations) {
    if (typeof validation === "string" && serailizedValidations?.[validation]) {
      if (serailizedValidations[validation]?.(value, validations))
        return serailizedValidations[validation](value, validations);
    }
  }

  // --- YOU PASSED EYYYYY
  return null;
}
