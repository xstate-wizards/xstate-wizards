import { CONTENT_NODE_SUBMIT, createSpell, INTERVIEW_INTRO_STATE, TTranslateFn } from "@xstate-wizards/spells";

export const ID_LANGUAGE_PICKER = "languagePicker";

const CONTENT_NODE_SUBMIT_DEFERRED = (t: TTranslateFn) => ({
  type: "button",
  buttonType: "submit",
  text: t("continue"),
  event: "SUBMIT",
  attrs: { className: "xw__btn-lg", width: "100%" },
  disabledByFreshDelay: true,
});

export const machineMapping = createSpell({
  key: ID_LANGUAGE_PICKER,
  version: "1",
  config: {
    initial: INTERVIEW_INTRO_STATE,
    title: (t) => t("title"),
    exitTo: "/",
    sectionsBar: [
      { name: (t) => t("sectionBar1"), trigger: INTERVIEW_INTRO_STATE },
      { name: (t) => t("sectionBar2"), trigger: "secondState" },
    ],
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
      content: ({ context }, t) => [
        { type: "h3", text: t!("h3") },
        { type: "p", text: t!("p") },
        {
          type: "input",
          inputType: "text",
          label: t!("label"),
          assign: { path: "email" },
          validations: ["required", "validEmail"],
        },
        CONTENT_NODE_SUBMIT,
        CONTENT_NODE_SUBMIT_DEFERRED(t!),
      ],
      on: {
        SUBMIT: "secondState",
      },
    },
    secondState: {
      content: ({ context }, t) => [{ type: "p", text: t!("p2") }],
      on: {},
    },
  },
});
