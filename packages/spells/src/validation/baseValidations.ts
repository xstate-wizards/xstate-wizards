import { parseTel } from "tel-fns";
import zxcvbn from "zxcvbn";
import { TValidationMap } from "../types";
import { ValdidationTypes } from "../constants/validationConstants";

// VALIDATIONS METHODS
export const baseValidations: TValidationMap = {
  [ValdidationTypes.required]: (value) => {
    const validateRequired = () => {
      if (value == null) return false;
      if (typeof value === "string" && value.length === 0) return false;
      if (typeof value === "boolean") return true;
      if (value && Array.isArray(value) && value.length === 0) return false;
      // if (typeof value === 'number' && value < 0) return false;
      return true;
    };
    return !validateRequired() ? "You need to fill this in." : null;
  },
  [ValdidationTypes.positiveNumber]: (value) => {
    const validatePositiveNumber = () => value > 0;
    return !validatePositiveNumber() ? "Must be higher than 0." : null;
  },
  [ValdidationTypes.zeroOrGreaterNumber]: (value) => {
    const validateZeroOrGreaterNumber = () => value >= 0;
    return !validateZeroOrGreaterNumber() ? "Must be 0 or higher." : null;
  },
  [ValdidationTypes.isInteger]: (value) => {
    const validateInteger = () => value % 1 === 0;
    return !validateInteger() ? "Cannot be a decimal." : null;
  },
  [ValdidationTypes.isTrue]: (value) => {
    const validateTrueBoolean = () => value === true;
    return !validateTrueBoolean() ? "Must be true." : null;
  },
  [ValdidationTypes.isFalse]: (value) => {
    const validateFalseBoolean = () => value === false;
    return !validateFalseBoolean() ? "Must be false." : null;
  },
  [ValdidationTypes.password]: (value) => {
    const validatePassword = (str) => {
      // at least 6 characters
      if (str.length <= 6) return "Passwords must contain more than 6 characters.";
      // rough scoring requirement
      const passwordStrength = zxcvbn(str);
      if (passwordStrength.score === 0 || passwordStrength.guesses < 50000) return "Password can be easily guessed.";
    };
    return validatePassword(String(value));
  },
  [ValdidationTypes.validEmail]: (value, validations) => {
    // TODO: make better
    const validateEmail = () => value?.includes("@") && value?.includes(".") && String(value)?.length > 5;
    return !validateEmail() ? "Invalid email." : null;
  },
  [ValdidationTypes.validPhoneNumber]: (value, validations) => {
    // TODO: can be a bit smarter with this check + need to handle international?
    const validatePhoneNumber = () =>
      (!validations.includes("required") && !value) || parseTel(value)?.isValidNumber;
    return !validatePhoneNumber() ? "Invalid phone number." : null;
  },
  [ValdidationTypes.isChecked]: (value) => {
    const validateTrueBoolean = () => value === true;
    return !validateTrueBoolean() ? "Must be checked." : null;
  },
  [ValdidationTypes.isNotChecked]: (value) => {
    const validateFalseBoolean = () => value === false;
    return !validateFalseBoolean() ? "Must not be checked." : null;
  },
  [ValdidationTypes.fullName]: (value, validations) => {
    const validateFullName = () =>
      (!validations.includes("required") && !value) || value.split(" ").filter((name) => name.length > 0).length >= 2;
    return !validateFullName() ? "Must enter first and last name." : null;
  },
};
