import { CANCEL_STATE, createSpell, SAVE_STATE } from "@xstate-wizards/spells";

export const ID_EXAMPLE_SPAWNED_MACHINE = "exampleSpawnedMachine";

export const machineMapping = createSpell({
  id: ID_EXAMPLE_SPAWNED_MACHINE,
  version: "1",
  config: {
    initial: "editor",
    title: "Example Spawned Machine Editor",
    exitTo: "/",
    sectionsBar: [],
  },
  models: {
    Hobby: { loader: {} },
  },
  schema: {
    type: "object",
    properties: {
      hobbyId: { type: ["integer", "null"], default: null },
      showDelete: { type: ["boolean", "null"], default: false },
    },
  },
  states: {
    editor: {
      content: (ctx) => [
        {
          type: "h4",
          text: "This is a sub-machine, spawned in isolation from the prior interview. These machines pass messages and data from one another, allowing them to modify data as needed as they pass it onto the next. In complex cases, you may spawn several machines which each handle related data models.",
        },
        { type: "p", text: "Hobby" },
        {
          type: "resourceEditor",
          config: {
            modelName: "Hobby",
            resourceId: ctx.hobbyId,
            resourceDefaults: {},
          },
          content: [
            {
              type: "input",
              inputType: "text",
              label: "Description",
              assign: { path: "description" },
              validations: ["required"],
            },
            {
              type: "input",
              inputType: "date",
              label: "When did you start?",
              assign: { path: "startedAt" },
              validations: ["required"],
            },
          ],
        },
        { type: "button", buttonType: "submit", text: "Save", event: "SAVE" },
        { type: "button", text: "Cancel", event: "CANCEL" },
      ],
      on: {
        CANCEL: CANCEL_STATE,
        SAVE: SAVE_STATE,
      },
    },
  },
});
