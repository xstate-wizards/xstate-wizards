import { parse } from "acorn";
import { cloneDeep } from "lodash";
import { $TSFixMe, TWizardSerializations } from "../../types";
import { logger } from "../../wizardDebugger";
import { evalJsonLogic } from "./evalJsonLogic";

// String cleaners
export const isTemplateFunctionPattern = (str: any): boolean => typeof str === "string" && /^<<<(.+?)>>>$/.test(str);
export const cleanTemplateFunction = (str: string): string => /<<<(.+?)>>>/.exec(str)[1];

export type TSelectStatementToValue = {
  ctx?: $TSFixMe; // machine context
  string: string;
  functions: TWizardSerializations["functions"];
  contentTree?: $TSFixMe; // comes from renderWizardML
};

// Eval
export const templateFunctionToValue = ({ ctx, string, functions, contentTree }: TSelectStatementToValue): any => {
  const stringStripped = isTemplateFunctionPattern(string) ? cleanTemplateFunction(string) : string;
  logger.debug("templateFunctionToValue: ", cloneDeep({ ctx, functions, contentTree, string, stringStripped }));
  try {
    const parsed = parse(stringStripped, { ecmaVersion: 2020 }); // ecmaVersion: "latest" hangs
    // FN NAME
    // @ts-ignore
    const callee = parsed.body?.[0]?.expression?.callee?.name;
    // ARGS (if json-logic, this is a JSON.stringified() obj)
    // @ts-ignore
    const args = parsed.body?.[0]?.expression?.arguments?.map((a) => a?.value) ?? [];
    logger.debug("templateFunctionToValue: ", { callee, args, parsed });
    // Return (handle JSON_LOGIC special, cause we want to pass in extra data)
    return callee === "JSON_LOGIC"
      ? evalJsonLogic(JSON.parse(args), { context: ctx, content: contentTree ?? {} })
      : functions[callee]?.(ctx, ...args);
  } catch (e) {
    logger.error("templateFunctionToValue: ", { string, stringStripped });
    return undefined;
  }
};
