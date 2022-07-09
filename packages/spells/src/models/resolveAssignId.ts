import { $TSFixMe, TWizardSerializations } from "../types";
import { isTemplateFunctionPattern, templateFunctionToValue } from "../machines/functions/templateFunctionToValue";
import { evalJsonLogic, isJsonLogic } from "../machines/functions/evalJsonLogic";
import { logger } from "../wizardDebugger";

type TResolveAssignIdParams = {
  context: $TSFixMe;
  assignIdOrTemplateOrJsonLogic: number | string | $TSFixMe;
  functions: TWizardSerializations["functions"];
  // --- situational
  event?: $TSFixMe;
  contentTree?: $TSFixMe;
};

// If a string/number,
export const resolveAssignId = ({
  assignIdOrTemplateOrJsonLogic,
  context,
  event,
  functions,
  contentTree,
}: TResolveAssignIdParams) => {
  logger.debug("resolveAssignId: ", {
    assignIdOrTemplateOrJsonLogic,
    context,
    event,
    functions,
    contentTree,
  });
  // --- if it's a string referencing a function
  if (isTemplateFunctionPattern(assignIdOrTemplateOrJsonLogic)) {
    return templateFunctionToValue({
      ctx: context,
      string: assignIdOrTemplateOrJsonLogic as string,
      functions,
      contentTree,
    });
  }
  // --- if it's json-logic
  if (isJsonLogic(assignIdOrTemplateOrJsonLogic)) {
    return evalJsonLogic(assignIdOrTemplateOrJsonLogic, { context, event, content: contentTree });
  }
  // else
  return assignIdOrTemplateOrJsonLogic;
};
