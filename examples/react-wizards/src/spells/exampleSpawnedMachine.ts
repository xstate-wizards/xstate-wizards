import { subYears } from "date-fns";
import { CANCEL_STATE, createSpell, SAVE_STATE } from "@xstate-wizards/spells";

export const ID_EXAMPLE_SPAWNED_MACHINE = "exampleSpawnedMachine";

export const machineMapping = createSpell({
  key: ID_EXAMPLE_SPAWNED_MACHINE,
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
  editor: {},
  states: {
    editor: {
      content: (ctx) => [
        { type: "h4", text: "Hobby Editor" },
        {
          type: "small",
          text: "This is a sub-machine, spawned in isolation from the prior interview. These machines pass messages and data from one another, allowing them to modify data as needed as they pass it onto the next. In complex cases, you may spawn several machines which each handle related data models.",
        },
        { type: "hr" },
        // Example modifying a resource via resourceEditor wrapper node
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
              dateStart: subYears(new Date(), 5),
              // dateEnd: addYears(new Date(), 5),
              // dateStart: "2017-01-01",
              // dateEnd: "2028-01-01",
            },
          ],
        },
        // Example modifying an object property via dot notation path syntax
        {
          type: "input",
          inputType: "text",
          label: "Collaborator Name (Optional)",
          assign: { modelName: "Hobby", id: ctx.hobbyId, path: "collaborator.name" },
          validations: ["required"],
        },
        // example of address
        { type: "h5", text: "Where do you do this hobby?" },
        {
          type: "address",
          assign: { modelName: "Hobby", id: ctx.hobbyId, path: "address" },
          config: {
            attention: { enabled: true, label: "In Care of Name (if any)" },
            // Configs check for defaults above, before falling back to true
            street1: { enabled: true, validations: ["required"] },
            street2: { enabled: true, validations: [] },
            unit: { enabled: true, options: [{ value: "APT", text: "APT" }] },
            notStable: { enabled: false },
            city: { enabled: true, validations: ["required"] },
            county: { enabled: true, validations: [] },
            state: { enabled: true, validations: ["required"], nodeType: "input" },
            zipcode: {
              enabled: true,
              validations: ["required"],
            },
            country: { enabled: true, validations: ["required"] },
          },
          attrs: { size: "sm" },
        },

        { type: "hr" },
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
