import {
  // CONTENT_NODE_BACK,
  createLocalId,
  createResourceOnContext,
  createWizard,
  deleteResourceOnContext,
  INTERVIEW_INTRO_STATE,
  resolveInvokedContext,
  SAVE_STATE,
} from "@upsolve/wizards";
import { assign } from "xstate";
import { selectHobbies } from "../models/hobby";
import { getPets, PET_TYPES, selectPets } from "../models/pet";
import { selectUser } from "../models/user";
import { getWizardMap, ID_EXAMPLE_INTERVIEW, ID_EXAMPLE_SPAWNED_MACHINE } from "./wizardMap";
import { wizardModelLoaders } from "./wizardModels";

export const machineMapping = createWizard({
  config: {
    id: ID_EXAMPLE_INTERVIEW,
    initial: INTERVIEW_INTRO_STATE,
    label: "Example Interview",
    exitTo: "/",
    progressBar: true,
    sectionsBar: [],
    version: 1,
  },
  machineMap: getWizardMap(),
  schema: {
    states: {},
    machineModels: [wizardModelLoaders.User(), wizardModelLoaders.Pet(), wizardModelLoaders.Hobby()],
  },
  serializations: {
    actions: {
      createPet: assign((ctx) =>
        createResourceOnContext(ctx, {
          modelName: "Pet",
          id: createLocalId(),
        })
      ),
      removePet: assign((ctx, ev) =>
        deleteResourceOnContext(ctx, {
          modelName: "Pet",
          id: ev?.data?.id,
        })
      ),
      resolveInvokedContext,
    },
    // serializations here can be overriden by WizardRunner machineSerializations,
    // TODO: could be more obvious
    validations: {
      isCurrentYear: (value) => (String(new Date().getFullYear()) === value ? null : "That's the wrong year"),
      startOfPi: (value) => {
        if (!String(value).startsWith("3.14")) return "Pi should start with 3.14...";
        return null;
      },
    },
  },
  states: {
    [INTERVIEW_INTRO_STATE]: {
      content: () => [
        { type: "h3", text: "Before we begin lets make sure you're a human...." },
        { type: "button", event: "SUBMIT", text: "ok" },
      ],
      on: {},
    },
    humanTestPi: {
      content: () => [
        // CONTENT_NODE_BACK,
        { type: "h4", text: "What are the starting digits of Pi?" },
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
      content: () => [
        // CONTENT_NODE_BACK,
        { type: "h4", text: "What year is it currently?" },
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
      content: (ctx) => [
        { type: "h4", text: "So far so good... confirm your name please:" },
        {
          type: "resourceEditor",
          config: {
            modelName: "User",
            resourceId: selectUser(ctx)?.id,
            resourceDefaults: {},
          },
          content: [
            [
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
            ],
          ],
        },
        { type: "button", buttonType: "submit", text: "Looks good", event: "SUBMIT" },
      ],
      on: {},
    },
    userEmail: {
      content: (ctx) => [
        { type: "p", text: "what's your email?" },
        {
          type: "resourceEditor",
          config: {
            modelName: "User",
            resourceId: selectUser(ctx)?.id,
            resourceDefaults: {},
          },
          content: [
            {
              type: "input",
              inputType: "text",
              label: "E-mail",
              assign: { path: "email" },
              validations: ["required", "validEmail"],
            },
          ],
        },
        { type: "button", buttonType: "submit", text: "Looks good", event: "SUBMIT" },
      ],
    },
    userAge: {
      content: (ctx) => [
        { type: "p", text: "what's your age?" },
        {
          type: "resourceEditor",
          config: {
            modelName: "User",
            resourceId: selectUser(ctx)?.id,
            resourceDefaults: {},
          },
          content: [
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
      on: {},
    },
    petsAsk: {
      content: (ctx) => [
        { type: "p", text: "do you have pets?" },
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
        // CONTENT_NODE_BACK,
        { type: "h2", text: "have any pets?" },
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
        ADD_PET: { actions: ["createPet"] },
        REMOVE_PET: { actions: ["removePet"] },
        SUBMIT: "hobbiesAsk",
      },
    },

    // TODO: Implement submachine spawning example
    hobbiesAsk: {
      content: (ctx) => [
        // CONTENT_NODE_BACK,
        { type: "p", text: "do you have any hobbies?" },
        { type: "button", text: "Yep!", event: "YES" },
        { type: "button", text: "No", event: "NO" },
      ],
      on: {
        BACK: [
          // if no pets exist on the machine skip back to ask, not editor
          { target: "petsAsk", cond: (ctx) => getPets(ctx)?.length === 0 },
          { target: "petsEditor" },
        ],
        YES: "hobbiesList",
        NO: "sessionExplorer",
      },
    },
    hobbiesList: {
      content: (ctx) => [
        // CONTENT_NODE_BACK,
        { type: "h2", text: "have any hobbies?" },
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
                { type: "button", text: "Delete", event: { type: "DELETE_HOBBY", data: { hobbyId: item.id } } },
              ],
            },
          ],
        },
        { type: "button", text: "Done", event: "CONTINUE" },
      ],
      on: {
        // CREATE_EDIT_HOBBY: { target: "hobbyEditor" },
        CREATE_EDIT_HOBBY: { actions: [() => alert("Spawning sub-machine editors will be exemplified soon.")] },
        DELETE_HOBBY: { actions: ["removeHobby"] },
        CONTINUE: "sessionExplorer",
      },
    },
    // hobbyEditor: {
    //   id: ID_EXAMPLE_SPAWNED_MACHINE,
    //   context: (ctx, ev) => ({
    //     hobbyId: ev?.data?.hobbyId,
    //     states: { editor: { showDelete: true } },
    //   }),
    //   onDone: [
    //     { target: "hobbiesList", cond: (ctx, ev) => ev?.data?.finalEvent?.type === "BACK" },
    //     { target: "hobbiesList", actions: ["resolveInvokedContext"] },
    //   ],
    // },
    sessionExplorer: {
      content: () => [
        {
          type: "p",
          text: "TODO: Show how to render a custom react component here that can access machine state/context",
        },
        { type: "component", component: "SessionExplorer" },
        { type: "button", text: "Next", event: "CONTINUE" },
      ],
      on: {
        CONTINUE: "faq",
      },
    },
    faq: {
      content: () => [
        { type: "h4", text: "Thanks for stopping by!" },
        { type: "p", text: "there will be more to show and exemplify, but that's it for now. check back soon!" },
        { type: "p", text: "in the meantime, check out these videos" },
        { type: "p", text: "ready to head out?" },
        { type: "button", text: "Finish", event: "CONTINUE" },
      ],
      on: {
        CONTINUE: SAVE_STATE,
      },
    },
  },
});
