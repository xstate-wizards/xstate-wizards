import { ValdidationTypes } from "../constants/validationConstants";

export const regexValidations = {
  [ValdidationTypes.stringLength]: (value, validations, param) => {
    const passed = (value || "").length === Number(param);
    return !passed ? `Expecting ${param} characters.` : null;
  },
};
