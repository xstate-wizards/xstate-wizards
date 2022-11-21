import { CONTENT_NODE_SUBMIT, createSpell, INTERVIEW_INTRO_STATE } from "@xstate-wizards/spells";

export const ID_LANGUAGE_PICKER = "languagePicker";

const CONTENT_NODE_SUBMIT_DEFERRED = (t) => ({
  type: "button",
  buttonType: "submit",
  text: t("continue"),
  event: "SUBMIT",
  attrs: { size: "lg", width: "100%" },
  disabledByFreshDelay: true,
});

export const machineMapping = createSpell({
  key: ID_LANGUAGE_PICKER,
  version: "1",
  config: {
    initial: INTERVIEW_INTRO_STATE,
    title: (t) => t("title"),
    exitTo: "/",
    sectionsBar: [{ name: (t) => t("sectionBar"), trigger: "awpType" }],
  },
  editor: {},
  models: {
    User: { loader: {} },
  },
  schema: {
    type: "object",
    properties: {
      states: {
        type: "object",
        properties: {},
      },
    },
  },
  states: {
    [INTERVIEW_INTRO_STATE]: {
      content: (ctx, t) => {
        return [
          {
            type: "h3",
            text: t("h3"),
          },
          { type: "h3", text: t("h1") },
          { type: "p", text: t("p") },
          {
            type: "input",
            inputType: "text",
            label: t("label"),
            assign: { path: "email" },
            validations: ["required", "validEmail"],
          },
          CONTENT_NODE_SUBMIT,
          CONTENT_NODE_SUBMIT_DEFERRED(t),
        ];
      },
      on: {
        SUBMIT: "secondState",
      },
    },
    secondState: {
      content: (ctx, t) => [{ type: "p", text: t("p2") }],
      on: {},
    },
  },
});
