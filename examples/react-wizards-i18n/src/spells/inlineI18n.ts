import { CONTENT_NODE_SUBMIT, createSpell, INTERVIEW_INTRO_STATE } from "@xstate-wizards/spells";

export const ID_INLINE_I18N = "inlineI18n";

export const machineMapping = createSpell({
  key: ID_INLINE_I18N,
  version: "1",
  config: {
    initial: INTERVIEW_INTRO_STATE,
    title: { en: "Inline i18n Demo", es: "Demo i18n en linea" },
    locales: ["en", "es"],
    exitTo: "/",
    sectionsBar: [
      { name: { en: "Welcome", es: "Bienvenido" }, trigger: INTERVIEW_INTRO_STATE },
      { name: { en: "Details", es: "Detalles" }, trigger: "detailsState" },
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
      content: [
        { type: "h3", text: { en: "Welcome to Inline i18n", es: "Bienvenido a i18n en linea" } },
        {
          type: "p",
          text: {
            en: "This spell uses inline locale objects instead of external translation files.",
            es: "Este formulario usa objetos de idioma en linea en vez de archivos de traduccion externos.",
          },
        },
        {
          type: "input",
          inputType: "text",
          label: { en: "Your name", es: "Tu nombre" },
          placeholder: { en: "Enter your name", es: "Ingresa tu nombre" },
          assign: "name",
          validations: ["required"],
        },
        CONTENT_NODE_SUBMIT,
      ],
      on: {
        SUBMIT: "detailsState",
      },
    },
    detailsState: {
      content: [
        {
          type: "p",
          text: {
            en: "Hello, {name}! You reached the details page.",
            es: "Hola, {name}! Llegaste a la pagina de detalles.",
          },
        },
      ],
      on: {},
    },
  },
});
