import { createLocalId } from "@xstate-wizards/spells";
import { CONTENT_NODE_SUBMIT } from "@xstate-wizards/spells";
import { CANCEL_STATE, createSpell, INTERVIEW_INTRO_STATE, SAVE_STATE } from "@xstate-wizards/spells";
import { assign } from "xstate";
import { selectUser } from "../models/user";

export const ID_EXAMPLE_SCREENER = "exampleScreener";

export const machineMapping = createSpell({
  key: ID_EXAMPLE_SCREENER,
  version: "1",
  config: {
    initial: INTERVIEW_INTRO_STATE,
    title: "Example Screener",
    exitTo: "/",
    sectionsBar: [],
  },
  models: {
    User: { loader: {} },
  },
  schema: {
    type: "object",
    properties: {
      states: {
        type: "object",
        properties: {
          isInterestedInInterview: { type: ["boolean", "null"], default: null },
          wizardScore: { type: ["number"], default: 0 },
        },
      },
    },
  },
  states: {
    [INTERVIEW_INTRO_STATE]: {
      content: (ctx) => [
        { type: "h4", text: "Welcome!" },
        { type: "p", text: "This is a screener to help you evaluate the XState Wizard™️ in front of you." },
        {
          type: "p",
          text: `We'll keep a running score below, but before we get started, what's your name?`,
        },
        {
          type: "resourceEditor",
          config: {
            modelName: "User",
            resourceId: selectUser(ctx)?.id || createLocalId(),
            resourceDefaults: {},
          },
          content: [
            {
              type: "input",
              inputType: "text",
              label: "First Name",
              assign: { path: "firstName" },
              validations: ["required"],
              attrs: { size: "md" },
            },
          ],
        },
        // CONTENT_NODE_SUBMIT, // shorthand template
        { type: "button", buttonType: "submit", text: "Get Started", event: "SUBMIT" },
        { type: "hr" },
        {
          type: "callout",
          content: [{ type: "small", text: `Wizard Score: ${ctx?.states?.wizardScore ?? 0}` }],
          attrs: { textAlign: "center" },
        },
      ],
      on: {
        SUBMIT: { target: "personalizedStartMessage" },
      },
    },
    personalizedStartMessage: {
      invoke: {
        // Faking a delay to "process" with an internal serialized function (converts to be src)
        srcSerialized: {
          jsonLogic: {
            waitSeconds: [5],
          },
          transitionEventType: "WAITED",
        },
        // onDone: [{ target: "evaluationResult" }],
      },
      content: (ctx) => [
        {
          type: "h5",
          text: `Great to meet you, ${selectUser(ctx)?.firstName}!`,
          attrs: { textAlign: "center" },
        },
        { type: "p", text: "Let's explore some use cases!", attrs: { textAlign: "center" } },
        { type: "hr" },
        { type: "countdownTimer", config: { timer: 1000 * 5 } },
      ],
      on: {
        WAITED: { target: "questionVolume" },
      },
    },
    questionVolume: {
      content: (ctx) => [
        { type: "h5", text: "How many questions do you have to ask your users?" },
        { type: "p", text: "Err on the side of max questions, as if a user hits every branch of conditionals." },
        {
          type: "button",
          text: "200+ Questions",
          event: { type: "SUBMIT", data: { incrementBy: 5 } },
          attrs: { size: "sm" },
        },
        {
          type: "button",
          text: "100-200 Questions",
          event: { type: "SUBMIT", data: { incrementBy: 3 } },
          attrs: { size: "sm" },
        },
        {
          type: "button",
          text: "50-100 Questions",
          event: { type: "SUBMIT", data: { incrementBy: 2 } },
          attrs: { size: "sm" },
        },
        {
          type: "button",
          text: "10-50 Questions",
          event: { type: "SUBMIT", data: { incrementBy: 1 } },
          attrs: { size: "sm" },
        },
        { type: "button", text: "Less than 10", event: "NONE", attrs: { size: "sm" } },
        { type: "hr" },
        {
          type: "callout",
          content: [{ type: "small", text: `Wizard Score: ${ctx?.states?.wizardScore ?? 0}` }],
          attrs: { textAlign: "center" },
        },
      ],
      on: {
        SUBMIT: { target: "questionComplexity", actions: ["Screener.incrementWizardScoreBy"] },
        NONE: { target: "questionComplexity" },
      },
    },
    questionComplexity: {
      content: (ctx) => [
        { type: "h5", text: "Do you find yourself asking users __complex__ questions?" },
        {
          type: "p",
          text: "Examples of complexity are, logic branches into sub-flows or having to validating data across multiple models to ensure correctness and possibility.",
        },
        { type: "button", text: "Yes! Very very complex", event: { type: "SUBMIT", data: { incrementBy: 2 } } },
        { type: "button", text: "Nope, nothing fancy", event: { type: "SUBMIT" } },
        { type: "hr" },
        {
          type: "callout",
          content: [{ type: "small", text: `Wizard Score: ${ctx?.states?.wizardScore ?? 0}` }],
          attrs: { textAlign: "center" },
        },
      ],
      on: {
        SUBMIT: {
          target: "developerExperience",
          actions: ["Screener.incrementWizardScoreBy"],
        },
      },
    },
    developerExperience: {
      content: (ctx) => [
        {
          type: "h5",
          text: "Do you care about developer experience and maintability?",
        },
        {
          type: "p",
          text: "When building complex and domain knowledge heavy flows, readability is paramount.",
        },
        {
          type: "p",
          text: "That's what we've made tools like our 'outline viewer' for non-technical teammates to review content and logic. Click below to view the screener content and logic, and to be allowed to continue.",
        },
        {
          type: "buttonLink",
          text: "View Outline Tool [⬈]",
          href: "/outline?spellKey=exampleScreener",
          attrs: { inverted: true, target: "_blank" },
          event: "VIEW_OUTLINE",
        },
        { type: "hr" },
        // disable buttons until the VIEW_OUTLINE event is triggered, which modifies machine state
        {
          type: "button",
          text: "Yes, I care about maintability.",
          event: "YES",
          attrs: { disabled: ctx?.states?.developerExperience?.viewedOutline !== true },
        },
        {
          type: "button",
          text: "Dev UX is not important.",
          event: "NO",
          attrs: { disabled: ctx?.states?.developerExperience?.viewedOutline !== true },
        },
        { type: "hr" },
        {
          type: "callout",
          content: [{ type: "small", text: `Wizard Score: ${ctx?.states?.wizardScore ?? 0}` }],
          attrs: { textAlign: "center" },
        },
      ],
      on: {
        VIEW_OUTLINE: {
          // example of inline modification of the machine context
          actions: [
            assign({
              states: (ctx) => ({ ...ctx.states, developerExperience: { viewedOutline: true } }),
            }),
          ],
        },
        YES: [{ target: "jsonLogicNeed", actions: ["Screener.incrementWizardScore"] }],
        NO: { target: "jsonLogicNeed" },
        // Example of conditional w/ json-logic
        // NO: [
        //   {
        //     target: "jsonLogicNeed",
        //     cond: {
        //       type: "jsonLogic",
        //       jsonLogic: {
        //         "===": [{ var: "context.states.wizardScore" }, 0],
        //       },
        //     },
        //   },
        //   { target: "evaluationProcessing" },
        // ],
      },
    },
    jsonLogicNeed: {
      content: (ctx) => [
        {
          type: "h5",
          text: "Does strict data collection with json schemas and serialized json-logic interest you?",
        },
        { type: "button", text: "Oh perfect!", event: "YES" },
        { type: "button", text: "No clue what that means, but sure.", event: "YES" },
        {
          type: "button",
          text: "No",
          event: "NO",
          attrs: { disabled: ctx?.states?.wizardScore !== 0, variant: "red" },
        },
        {
          type: "conditional",
          conditional: (ctx) => ctx?.states?.wizardScore !== 0,
          options: {
            true: [
              {
                type: "callout",
                content: [
                  {
                    type: "small",
                    text: "Saying 'not interested' is only available with a wizard score of 0.",
                  },
                ],
                attrs: { variant: "warning" },
              },
            ],
          },
        },
        { type: "hr" },
        {
          type: "callout",
          content: [{ type: "small", text: `Wizard Score: ${ctx?.states?.wizardScore ?? 0}` }],
          attrs: { textAlign: "center" },
        },
      ],
      on: {
        YES: [{ target: "evaluationProcessing", actions: ["Screener.incrementWizardScore"] }],
        NO: { target: CANCEL_STATE },
      },
    },
    evaluationProcessing: {
      invoke: {
        // Faking a delay to "process" with an internal serialized function (converts to be src)
        srcSerialized: {
          jsonLogic: {
            waitSeconds: [2],
          },
          transitionEventType: "WAITED",
        },
        // onDone: [{ target: "evaluationResult" }],
      },
      content: [{ type: "h5", text: "Calculating need...", attrs: { textAlign: "center" } }],
      on: {
        WAITED: { target: "evaluationResult" },
      },
    },
    evaluationResult: {
      content: (ctx) => [
        { type: "h4", text: "XState Wizards will be useful!", attrs: { textAlign: "center" } },
        {
          type: "conditional",
          conditional: {
            ">": [{ var: ["context.states.wizardScore"] }, 0],
          },
          options: {
            true: [
              {
                type: "p",
                // Crazy example of inline math using json-logic
                // text: `You got a wizard score of <<<JSON_LOGIC('{"*":[2,{"Math.random":[]},{"var":["context.states.wizardScore"]}]}')>>>! This might be useful for you to explore.`,
                text: `You got a **"I need to use XState Wizards"** score of **${ctx?.states?.wizardScore}**. It looks like it'll be of help to you!`,
              },
            ],
            false: [
              {
                type: "p",
                text: "You got a 0 on your wizard score, but maybe it's still worth exploring an example interview with data manipulation and logic?",
              },
            ],
          },
        },
        {
          type: "conditional",
          conditional: {
            "==": [{ var: ["context.states.isInterestedInInterview"] }, null],
          },
          options: {
            true: [
              {
                type: "button",
                text: "Great! Show me more.",
                event: "INTERESTED",
                attrs: { size: "lg" },
              },
              {
                type: "buttonConfirm",
                text: ["Exit", "Confirm Exit"],
                event: "NOT_INTERESTED",
                attrs: { size: "sm", inverted: true },
              },
            ],
            false: [
              {
                type: "conditional",
                conditional: {
                  "===": [{ var: ["context.states.isInterestedInInterview"] }, true],
                },
                options: {
                  true: [
                    { type: "p", text: "Great! Just add your first and last names here and we'll continue!" },
                    {
                      type: "input",
                      inputType: "text",
                      label: "First Name",
                      assign: {
                        modelName: "User",
                        id: {
                          selectUser: [{ var: "context" }, "id"],
                        },
                        path: "firstName",
                      },
                      validations: ["required"],
                    },
                    {
                      type: "input",
                      inputType: "text",
                      label: "Last Name",
                      assign: {
                        modelName: "User",
                        id: {
                          selectUser: [{ var: "context" }, "id"],
                        },
                        path: "lastName",
                      },
                      validations: ["required"],
                    },
                    {
                      type: "input",
                      inputType: "password",
                      label: "Password",
                      assign: {
                        modelName: "User",
                        id: {
                          selectUser: [{ var: "context" }, "id"],
                        },
                        path: "password",
                      },
                      validations: ["required"],
                    },
                    // buttonType submit will ensure all input validations pass before firing off
                    { type: "button", buttonType: "submit", text: "Yea! Let's do it", event: "SUBMIT" },
                    {
                      type: "buttonConfirm",
                      text: ["Nevermind, not intersted", "I am really not interested."],
                      event: "NOT_INTERESTED",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
      on: {
        // Just updates state if interested
        INTERESTED: {
          actions: ["Screener.isInterested", "Models.User.create"],
        },
        NOT_INTERESTED: { target: CANCEL_STATE },
        SUBMIT: { target: SAVE_STATE },
      },
    },
  },
});
