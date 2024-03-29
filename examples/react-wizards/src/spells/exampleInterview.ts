import { CANCEL_STATE } from "@xstate-wizards/spells";
import { CONTENT_NODE_SUBMIT } from "@xstate-wizards/spells";
import {
  CONTENT_NODE_BACK,
  createLocalId,
  createSpell,
  INTERVIEW_INTRO_STATE,
  SAVE_STATE,
  upsertResourceOnContext,
} from "@xstate-wizards/spells";
import _ from "lodash";
import { assign } from "xstate";
import { selectHobbies } from "../models/hobby";
import { getPets, PET_TYPES } from "../models/pet";
import { selectUser } from "../models/user";
import { ID_EXAMPLE_SPAWNED_MACHINE } from "./exampleSpawnedMachine";

export const ID_EXAMPLE_INTERVIEW = "exampleInterview";
const updateFavoritePet = () =>
  assign((ctx, ev: any) => {
    let curctx: any = ctx;
    if (ev.assignConfig.modelName === "Pet" && ev.assignConfig.path === "isFavorite" && ev.assignValue === true) {
      Object.values(curctx.resources.Pet).forEach((pet: any) => {
        if (pet.id !== ev.assignConfig.id) {
          curctx = upsertResourceOnContext(curctx, {
            modelName: "Pet",
            id: pet.id,
            props: {
              isFavorite: false,
            },
          });
        }
      });
    }
    return curctx;
  });

export const machineMapping = createSpell({
  key: ID_EXAMPLE_INTERVIEW,
  version: "1",
  config: {
    initial: INTERVIEW_INTRO_STATE,
    //initial: "userName",
    title: "Example Interview",
    // exitTo: "/",
    sectionsBar: [
      { name: "Validation", trigger: INTERVIEW_INTRO_STATE },
      { name: "Data", trigger: "userName" },
      { name: "Data Pt.2", trigger: "petsAsk" },
      { name: "Data Pt.3", trigger: "hobbiesAsk" },
      { name: "Learn More", trigger: "faq" },
    ],
  },
  models: {
    Hobby: { loader: {} },
    Pet: { loader: {} },
    User: { loader: {} }, // { loader: { arbitraryParamForWaiting: 1000 * 2.5 } }
  },
  schema: {
    type: "object",
    properties: {
      states: {
        type: "object",
        properties: {
          showPiTest: { type: ["boolean"], default: false },
        },
      },
    },
  },
  states: {
    [INTERVIEW_INTRO_STATE]: {
      content: [
        CONTENT_NODE_BACK,
        { type: "h4", text: "Let's explore functionality in more depth!" },
        CONTENT_NODE_SUBMIT,
      ],
      on: {
        BACK: CANCEL_STATE,
        SUBMIT: "humanTestPi",
      },
    },
    // broken example showing how if you have an invoke with a timeout that shows an input but doesn't change the total number of nodes, validation won't run
    humanTestPi: {
      invoke: () => (transition: any) => setTimeout(() => transition({ type: "SHOW_INPUT_TIMEOUT" }), 0),
      content: [
        CONTENT_NODE_BACK,
        { type: "h4", text: "First up are custom validations on inputs! Here's an odd one below." },
        { type: "p", text: "What are the starting digits of Pi?" },

        {
          type: "conditional",
          description: "swap 2 things",
          conditional: (ctx) => ctx?.states?.showPiTest ?? false,
          options: {
            false: [
              {
                type: "button",
                text: "show pi input",
                event: "CLICKED_PI_BUTTON",
              },
            ],
            true: [
              {
                type: "input",
                inputType: "text",
                label: "Pi",
                assign: "states.humanTestPi",
                validations: ["required", "startOfPi"],
              },
            ],
          },
        },
        { type: "small", text: `HINT: It is not <<<JSON_LOGIC('{"Math.random":[]}')>>>` },
        CONTENT_NODE_SUBMIT,
      ],
      on: {
        BACK: INTERVIEW_INTRO_STATE,
        SUBMIT: "humanTestYear",
        CLICKED_PI_BUTTON: { actions: [assign((ctx: any) => _.set(ctx, "states.showPiTest", true))] },
        SHOW_INPUT_TIMEOUT: { actions: [assign((ctx: any) => _.set(ctx, "states.showPiTest", true))] },
      },
    },
    humanTestYear: {
      content: [
        CONTENT_NODE_BACK,
        { type: "h4", text: "Here's an example of a custom drop down with another unique validator." },
        {
          type: "select",
          label: "Current Year",
          labelByLine: "There can only be __one__ correct answer.",
          options: {
            "lodash.range": [
              { "date-fns.getYear": [{ "Date.now": [] }] },
              { "-": [{ "date-fns.getYear": [{ "Date.now": [] }] }, 5] },
            ],
          },
          // vvv -- alternatively, this is what I did at first in javascript to get the years
          // options: Array(5)
          //   .fill(null)
          //   .map((empty, i) => ({
          //     text: new Date().getFullYear() - i,
          //     value: new Date().getFullYear() - i,
          //   }))
          //   .reverse(),
          assign: "states.humanTestYear",
          validations: ["required", "isCurrentYear"],
        },
        CONTENT_NODE_SUBMIT,
      ],
      on: {
        BACK: "humanTestPi",
        SUBMIT: "userName",
      },
    },
    userName: {
      content: (ctx) => [
        CONTENT_NODE_BACK,
        { type: "h4", text: "Editing a data model: **User**" },
        { type: "p", text: "Use a 'resourceEditor' to wrap inputs so it's easier to update values." },
        {
          type: "resourceEditor",
          config: {
            modelName: "User",
            // TODO: fix outline mode access/referene of serialized functions
            resourceId: selectUser(ctx)?.id,
            // resourceId: {
            //   selectUser: [{ var: ["context"] }, "id"],
            // },
            resourceDefaults: {},
          },
          content: [
            // { type: "p", text: `user id: <<<JSON_LOGIC('{"selectUser":[{"var":["context"]},"id"]}')>>>` },
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
              attrs: { size: "sm" },
            },
            {
              type: "input",
              inputType: "tel",
              label: "Your Phone Number",
              // allowSelectingCountryCode: false, // if false, country code select is replaced with default country code (+1), default: true
              // defaultCountryCode: 1,
              assign: { path: "phoneNumber" },
              validations: [], // "validPhoneNumber" is now built in. We'll see a validation err only if its a bad input
              attrs: { size: "sm" },
            },
            {
              type: "multiSelect",
              inputType: "list",
              label: "Favorite Colors",
              assign: { path: "favoriteColors" },
              options: [
                { text: "Red", value: "red" },
                { text: "Blue", value: "blue" },
              ],
              validations: [],
              attrs: { size: "sm" },
            },
          ],
        },
        { type: "button", buttonType: "submit", text: "Looks good", event: "SUBMIT" },
      ],
      on: {
        BACK: "humanTestYear",
        SUBMIT: "petsAsk",
      },
    },
    petsAsk: {
      content: [
        CONTENT_NODE_BACK,
        {
          type: "h4",
          text: "Let's now show how to skip sections! Clicking yes brings us to an list screen, no skips to the next section.",
        },
        { type: "p", text: "Do you have pets?" },
        { type: "button", text: "Yep!", event: "YES" },
        { type: "button", text: "No", event: "NO" },
      ],
      on: {
        BACK: "userName",
        YES: "petsEditor",
        NO: "hobbiesAsk",
      },
    },
    petsEditor: {
      entry: (ctx, ev) => console.log("entry action"),
      exit: (ctx, ev) => console.log("exit action"),
      content: [
        CONTENT_NODE_BACK,
        {
          type: "h5",
          text: "From here, we'll see a 'forEach' content node in action, repeating editors for each 'Pet' model we create.",
        },
        { type: "h4", text: "Do you have any pets?" },
        {
          type: "row",
          content: [
            { type: "h5", text: "Pets" },
            { type: "button", text: "+Add", event: "ADD_PET" },
          ],
        },
        {
          // selectPets(ctx)
          // interesting json logic below
          // 1. behind the scenes, we exteded the json-logic expressions with native javascript methods
          // 2. as such, we can now execute Object.values() on an obj selected with standard json-logic operators
          // 3. so to get an array of the state machine context resources, we...
          // 3a. do a conditional to see if the resources model is defined
          // 3b. if so, we return the 2nd arg in the array which is a selector for those vals
          // 3c. if not, we return an empty array
          // 4. Object.values would throw if provided undefined/null, so we had to return an {}
          type: "forEach",
          items: {
            "Object.values": [
              {
                // prettier-ignore
                // if: 1st statement is eval, 2nd is if true, 3rd is if false
                "if": [
                  { "!=": [{ var: ["context.resources.Pet"] }, null] },
                  { var: ["context.resources.Pet"] },
                  {},
                ],
              },
            ],
          },
          content: [
            // { type: "h4", text: `pet id: <<<JSON_LOGIC('{"var":["content.node.id"]}')>>>` },
            {
              type: "resourceEditor",
              config: {
                modelName: "Pet",
                resourceId: {
                  var: ["content.node.id"],
                },
                resourceDefaults: {},
              },
              content: [
                // { type: "small", text: `smaller pet id: <<<JSON_LOGIC('{"var":["content.node.id"]}')>>>` },
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
                      validations: [""],
                    },
                    // TODO: { type: "button", text: "Delete", event: { type: "DELETE_PET", data: { id: item.id } } },
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
        BACK: "petsAsk",
        REMOVE_PET: { actions: ["Models.Pet.delete"] },
        SUBMIT: { target: "hobbiesAsk" },
        ASSIGN_CONTEXT: {
          actions: [updateFavoritePet()],
        },
      },
    },
    hobbiesAsk: {
      content: [
        CONTENT_NODE_BACK,
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
        CONTINUE: { target: "faq" },
      },
    },
    hobbyEditor: {
      key: ID_EXAMPLE_SPAWNED_MACHINE,
      context: (ctx, ev) => ({
        hobbyId: ev?.data?.hobbyId,
        showDelete: true,
      }),
      onDone: [
        { target: "hobbiesList", cond: (ctx, ev) => ev?.data?.finalEvent?.type === "BACK" },
        { target: "hobbiesList", actions: ["mergeEventDataResources"] },
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
