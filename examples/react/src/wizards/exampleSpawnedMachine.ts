import { CANCEL_STATE, createWizard, SAVE_STATE } from "@upsolve/wizards";
import { wizardModelLoaders } from "./wizardModels";

export const ID_EXAMPLE_SPAWNED_MACHINE = "exampleSpawnedMachine";

export const machineMapping = createWizard({
  config: {
    id: ID_EXAMPLE_SPAWNED_MACHINE,
    initial: "editor",
    label: "Example Spawned Machine Editor",
    exitTo: "/",
    progressBar: true,
    sectionsBar: [],
    version: 1,
  },
  schema: {
    states: {
      hobbyId: null,
    },
    machineModels: [wizardModelLoaders.Hobby()],
  },
  serializations: {},
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
