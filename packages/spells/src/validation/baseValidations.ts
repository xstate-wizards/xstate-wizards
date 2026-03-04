import { parseTel } from "tel-fns";
import zxcvbn from "zxcvbn";
import { TValidationMap } from "../types";
import { ValidationTypes } from "../constants/validationConstants";
import { logger } from "../wizardDebugger";

// VALIDATIONS METHODS
export const baseValidations: TValidationMap = {
  [ValidationTypes.required]: (value) => {
    const validateRequired = () => {
      if (value == null) return false;
      if (typeof value === "string" && value.length === 0) return false;
      if (typeof value === "boolean") return true;
      if (value && Array.isArray(value) && value.length === 0) return false;
      // if (typeof value === 'number' && value < 0) return false;
      return true;
    };
    return !validateRequired() ? "Required." : null;
  },
  [ValidationTypes.positiveNumber]: (value) => {
    const validatePositiveNumber = () => value > 0;
    return !validatePositiveNumber() ? "Must be higher than 0." : null;
  },
  [ValidationTypes.zeroOrGreaterNumber]: (value) => {
    const validateZeroOrGreaterNumber = () => value >= 0;
    return !validateZeroOrGreaterNumber() ? "Must be 0 or higher." : null;
  },
  [ValidationTypes.isInteger]: (value) => {
    const validateInteger = () => value % 1 === 0;
    return !validateInteger() ? "Cannot be a decimal." : null;
  },
  [ValidationTypes.isTrue]: (value) => {
    const validateTrueBoolean = () => value === true;
    return !validateTrueBoolean() ? "Must be true." : null;
  },
  [ValidationTypes.isFalse]: (value) => {
    const validateFalseBoolean = () => value === false;
    return !validateFalseBoolean() ? "Must be false." : null;
  },
  [ValidationTypes.password]: (value) => {
    const validatePassword = (str) => {
      // at least 6 characters
      if (str.length <= 6) return "Passwords must contain more than 6 characters.";
      // rough scoring requirement
      const passwordStrength = zxcvbn(str);
      if (passwordStrength.score === 0 || passwordStrength.guesses < 50000) return "Password can be easily guessed.";
    };
    return validatePassword(String(value));
  },
  [ValidationTypes.validEmail]: (value, validations) => {
    // TODO: make better
    const validateEmail = () => value?.includes("@") && value?.includes(".") && String(value)?.length > 5;
    return !validateEmail() ? "Invalid email." : null;
  },
  [ValidationTypes.validPhoneNumber]: (value, validations) => {
    // TODO: can be a bit smarter with this check + need to handle international?
    const parsed = parseTel(value)
    logger.debug("validateInputValue (validPhoneNumber):", { parsed, value });
    const validatePhoneNumber = () =>
      (!validations.includes("required") && !value) || parsed?.isValidNumber;
    return !validatePhoneNumber() ? "Invalid phone number." : null;
  },
  [ValidationTypes.isChecked]: (value) => {
    const validateTrueBoolean = () => value === true;
    return !validateTrueBoolean() ? "Must be checked." : null;
  },
  [ValidationTypes.isNotChecked]: (value) => {
    const validateFalseBoolean = () => value === false;
    return !validateFalseBoolean() ? "Must not be checked." : null;
  },
  [ValidationTypes.fullName]: (value, validations) => {
    const validateFullName = () =>
      (!validations.includes("required") && !value) || value.split(" ").filter((name) => name.length > 0).length >= 2;
    return !validateFullName() ? "Must enter first and last name." : null;
  },
};
