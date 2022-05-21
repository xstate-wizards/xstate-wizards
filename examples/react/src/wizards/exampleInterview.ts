import { createLocalId, createWizard, INTERVIEW_INTRO_STATE, SAVE_STATE } from "@upsolve/wizards";
import { selectHobbies } from "../models/hobby";
import { getPets, PET_TYPES, selectPets } from "../models/pet";
import { ID_EXAMPLE_SPAWNED_MACHINE } from "./exampleSpawnedMachine";
import { wizardModelLoaders } from "./wizardModels";

export const ID_EXAMPLE_INTERVIEW = "exampleInterview";

export const machineMapping = createWizard({
  config: {
    id: ID_EXAMPLE_INTERVIEW,
    initial: INTERVIEW_INTRO_STATE,
    // initial: "hobbiesAsk",
    label: "Example Interview",
    exitTo: "/",
    progressBar: true,
    sectionsBar: [],
    version: 1,
  },
  schema: {
    states: {},
    machineModels: [
      wizardModelLoaders.User({ loader: { arbitraryParamForWaiting: 1000 * 2.5 } }),
      wizardModelLoaders.Pet(),
      wizardModelLoaders.Hobby(),
    ],
  },
  states: {
    [INTERVIEW_INTRO_STATE]: {
      content: [
        { type: "h4", text: "Alright, well let's walk through some functionality!" },
        { type: "button", event: "SUBMIT", text: "ok" },
      ],
      // on: { SUBMIT: "humanTestPi" },
      on: {},
    },
    humanTestPi: {
      content: [
        { type: "h4", text: "First up are custom validations on inputs! Here's an odd one below." },
        { type: "p", text: "What are the starting digits of Pi?" },
        {
          type: "input",
          inputType: "text",
          label: "Pi",
          assign: "states.humanTestPi",
          validations: ["required", "startOfPi"],
        },
        { type: "button", buttonType: "submit", text: "Continue", event: "SUBMIT" },
      ],
      on: {
        BACK: INTERVIEW_INTRO_STATE,
        SUBMIT: "humanTestYear",
      },
    },
    humanTestYear: {
      content: [
        { type: "h4", text: "Here's an example of a custom drop down with another unique validator." },
        { type: "p", text: "What year is it currently?" },
        {
          type: "select",
          label: "Current Year",
          options: Array(5)
            .fill(null)
            .map((empty, i) => ({
              text: new Date().getFullYear() - i,
              value: new Date().getFullYear() - i,
            }))
            .reverse(),
          assign: "states.humanTestYear",
          validations: ["required", "isCurrentYear"],
        },
        { type: "button", buttonType: "submit", text: "Continue", event: "SUBMIT" },
      ],
      on: {
        BACK: "humanTestPi",
        SUBMIT: "userName",
      },
    },
    userName: {
      content: [
        { type: "h4", text: "Now let's do some editing to a **User** model/resource:" },
        { type: "p", text: "Use a 'resourceEditor' to wrap inputs so it's easier to update values." },
        {
          type: "resourceEditor",
          config: {
            modelName: "User",
            resourceId: `<<<selectUser("id")>>>`,
            resourceDefaults: {},
          },
          content: [
            {
              type: "input",
              inputType: "text",
              label: "First Name",
              assign: { path: "firstName" },
              validations: ["required"],
            },
            {
              type: "input",
              inputType: "text",
              label: "Last Name",
              assign: { path: "lastName" },
              validations: ["required"],
            },
            {
              type: "input",
              inputType: "text",
              label: "E-mail",
              assign: { path: "email" },
              validations: ["required", "validEmail"],
            },
            {
              type: "input",
              inputType: "age",
              label: "Pick your age!",
              assign: { path: "age" },
              validations: ["required"],
            },
          ],
        },
        { type: "button", buttonType: "submit", text: "Looks good", event: "SUBMIT" },
      ],
      on: {
        SUBMIT: "petsAsk",
      },
    },
    petsAsk: {
      content: [
        {
          type: "h4",
          text: "Let's now show how to skip sections! Clicking yes brings us to an list screen, no skips to the next section.",
        },
        { type: "p", text: "Do you have pets?" },
        { type: "button", text: "Yep!", event: "YES" },
        { type: "button", text: "No", event: "NO" },
      ],
      on: {
        YES: "petsEditor",
        NO: "hobbiesAsk",
      },
    },
    petsEditor: {
      content: (ctx) => [
        {
          type: "h4",
          text: "From here, we'll see a 'forEach' content node in action, repeating editors for each 'Pet' model we create.",
        },
        { type: "h2", text: "Do you have any pets?" },
        {
          type: "row",
          content: [
            { type: "h5", text: "Pets" },
            { type: "button", text: "+Add", event: "ADD_PET" },
          ],
        },
        {
          type: "forEach",
          items: selectPets(ctx),
          content: (ctx, item) => [
            {
              type: "resourceEditor",
              config: {
                modelName: "Pet",
                resourceId: item.id,
                resourceDefaults: {},
              },
              content: [
                {
                  type: "row",
                  content: [
                    {
                      type: "select",
                      options: PET_TYPES.map((str) => ({
                        text: str,
                        value: str,
                      })),
                      label: "Type of pet!",
                      validations: ["required"],
                      assign: { path: "type" },
                    },
                    {
                      type: "input",
                      inputType: "text",
                      label: "Name",
                      assign: { path: "name" },
                      validations: ["required"],
                    },
                    { type: "button", text: "Delete", event: { type: "DELETE_PET", data: { id: item.id } } },
                  ],
                },
              ],
            },
          ],
        },
        { type: "button", buttonType: "submit", text: "Done", event: "SUBMIT" },
      ],
      on: {
        ADD_PET: { actions: ["Models.Pet.create"] },
        REMOVE_PET: { actions: ["Models.Pet.delete"] },
        SUBMIT: "hobbiesAsk",
      },
    },
    hobbiesAsk: {
      content: [
        { type: "h4", text: "Same as before, we have a section skip based on a YES/NO event." },
        { type: "p", text: "Do you have any hobbies?" },
        { type: "button", text: "Yep!", event: "YES" },
        { type: "button", text: "No", event: "NO" },
      ],
      on: {
        BACK: [{ target: "petsAsk", cond: (ctx) => getPets(ctx)?.length === 0 }, { target: "petsEditor" }],
        YES: "hobbiesList",
        NO: "faq",
      },
    },
    hobbiesList: {
      content: (ctx) => [
        {
          type: "h4",
          text: "Unlike the pets section, adding a 'Hobby' model here will spawn a new state machine. Upon it resolving, we'll resolve its data payload back into the current machine's context.",
        },
        { type: "p", text: "Have any hobbies?" },
        {
          type: "row",
          content: [
            { type: "h5", text: "Hobbies" },
            {
              type: "button",
              text: "+ Add Hobby",
              event: { type: "CREATE_EDIT_HOBBY", data: { hobbyId: createLocalId() } },
            },
          ],
        },
        {
          type: "forEach",
          items: selectHobbies(ctx),
          content: (ctx, item) => [
            {
              type: "row",
              content: [
                { type: "p", text: item.description },
                { type: "button", text: "Edit", event: { type: "CREATE_EDIT_HOBBY", data: { hobbyId: item.id } } },
                { type: "button", text: "Delete", event: { type: "DELETE_HOBBY", data: { id: item.id } } },
              ],
            },
          ],
        },
        { type: "button", text: "Done", event: "CONTINUE" },
      ],
      on: {
        CREATE_EDIT_HOBBY: { target: "hobbyEditor" },
        DELETE_HOBBY: { actions: ["Models.Hobby.delete"] },
        CONTINUE: "faq",
      },
    },
    hobbyEditor: {
      id: ID_EXAMPLE_SPAWNED_MACHINE,
      context: (ctx, ev) => ({
        hobbyId: ev?.data?.hobbyId,
        states: { editor: { showDelete: true } },
      }),
      onDone: [
        { target: "hobbiesList", cond: (ctx, ev) => ev?.data?.finalEvent?.type === "BACK" },
        { target: "hobbiesList", actions: ["resolveInvokedContext"] },
      ],
    },
    faq: {
      content: [
        { type: "h4", text: "Awesome! Thanks for checking things out!" },
        {
          type: "p",
          text: "There will be more to show and exemplify, but that's it for now. check back soon!",
        },
        {
          type: "p",
          text: "In the meantime, watch some inspiration on this approach!",
        },
        {
          type: "p",
          text: "A video about state machines and state charts from XState creator David Khourshid!",
        },
        { type: "video", url: "https://www.youtube.com/watch?v=_umnF7gpbfg" },
        {
          type: "p",
          text: "A video about the 'Actor Model' that inspired our approach for resource editor",
        },
        { type: "video", url: "https://www.youtube.com/watch?v=7erJ1DV_Tlo" },
        { type: "button", text: "Exit", event: "EXIT" },
      ],
      on: {
        EXIT: SAVE_STATE,
      },
    },
  },
});
