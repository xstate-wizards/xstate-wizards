import { ValidationTypes } from "../constants/validationConstants";

export const regexValidations = {
  [ValidationTypes.stringLength]: (value, validations, param) => {
    const passed = (value || "").length === Number(param);
    return !passed ? `Expecting ${param} characters.` : null;
  },
};
