import { CANCEL_STATE, createWizard, INTERVIEW_INTRO_STATE, SAVE_STATE } from "@upsolve/wizards";
import { wizardModelLoaders } from "./wizardModels";

export const ID_EXAMPLE_SCREENER = "exampleScreener";

export const machineMapping = createWizard({
  config: {
    id: ID_EXAMPLE_SCREENER,
    initial: INTERVIEW_INTRO_STATE,
    label: "Example Screener",
    exitTo: "/",
    progressBar: true,
    sectionsBar: [],
    version: 1,
  },
  schema: {
    states: {
      isInterestedInInterview: null,
      wizardScore: 0,
    },
    machineModels: [wizardModelLoaders.User()],
  },
  states: {
    [INTERVIEW_INTRO_STATE]: {
      content: [
        { type: "button", text: "back", event: "BACK" },
        { type: "h3", text: "Welcome!" },
        { type: "p", text: "This is a screener to help you evaluate the WonderWizard™️ in front of you." },
        { type: "p", text: "Let's find out if this is helpful." },
        { type: "button", text: "Continue", event: "SUBMIT" },
      ],
      on: {
        SUBMIT: "questionVolume",
      },
    },
    questionVolume: {
      content: [
        { type: "p", text: "Do you find yourself asking users **a lot** of questions?" },
        { type: "button", text: "Yes! So many", event: "YES" },
        { type: "button", text: "Nope", event: "NO" },
      ],
      on: {
        YES: { target: "questionComplexity", actions: ["Screener.incrementWizardScore"] },
        NO: "questionComplexity",
      },
    },
    questionComplexity: {
      content: [
        { type: "p", text: "Do you find yourself asking users __complex__ questions?" },
        { type: "button", text: "Yes! Very very complex", event: { type: "SUBMIT", data: { incrementBy: 2 } } },
        { type: "button", text: "Nope, nothing fancy", event: { type: "SUBMIT" } },
      ],
      on: {
        SUBMIT: {
          target: "developerExperience",
          actions: ["Screener.incrementWizardScoreBy"],
        },
      },
    },
    developerExperience: {
      content: [
        {
          type: "p",
          text: "Do you wonder how to let developers easily weave content and logic for questionnaires?",
        },
        { type: "button", text: "Yea, sometimes", event: "YES" },
        { type: "button", text: "Eh, not really", event: "NO" },
      ],
      on: {
        YES: { target: "evaluationProcessing", actions: ["Screener.incrementWizardScore"] },
        NO: "evaluationProcessing",
      },
    },
    evaluationProcessing: {
      invoke: {
        // Faking a delay to "process"
        src: `<<<invokeTimer(2000)>>>`,
        onDone: [{ target: "evaluationResult" }],
      },
      content: [{ type: "p", text: "Determining whether you need this..." }],
    },
    evaluationResult: {
      content: [
        { type: "h1", text: "This may be useful!" },
        { type: "hr" },
        {
          type: "conditional",
          conditional: `<<<gt("states.wizardScore",0)>>>`, // (ctx) => ctx.states?.wizardScore > 0,
          true: [
            {
              type: "p",
              text: `You got a wizard score of <<<get("states.wizardScore")>>>! This might be useful for you to explore.`,
            },
          ],
          false: [
            {
              type: "p",
              text: "You got a 0 on your wizard score, but maybe it's still worth exploring an example interview with data manipulation and logic?",
            },
          ],
        },
        {
          type: "conditional",
          conditional: `<<<eq("states.isInterestedInInterview",null)>>>`, // (ctx) => ctx.states?.isInterestedInInterview == null,
          true: [
            {
              type: "button",
              text: "Yea! Let's do it",
              event: "INTERESTED",
            },
            { type: "button", text: "Thanks, but no thanks", event: "NOT_INTERESTED" },
          ],
        },
        {
          type: "conditional",
          conditional: `<<<eq("states.isInterestedInInterview",true)>>>`, // (ctx) => ctx.states?.isInterestedInInterview === true,
          true: [
            { type: "p", text: "Great! Just add your first and last names here and we'll continue!" },
            [
              {
                type: "input",
                inputType: "text",
                label: "First Name",
                assign: { modelName: "User", id: `<<<selectUser("id")>>>`, path: "firstName" },
                validations: ["required"],
              },
              {
                type: "input",
                inputType: "text",
                label: "Last Name",
                assign: { modelName: "User", id: `<<<selectUser("id")>>>`, path: "lastName" },
                validations: ["required"],
              },
            ],
            // buttonType submit will ensure all input validations pass before firing off
            { type: "button", buttonType: "submit", text: "Yea! Let's do it", event: "SUBMIT" },
            { type: "button", text: "Nevermind", event: "NOT_INTERESTED" },
          ],
        },
      ],
      on: {
        // Just updates state if interested
        INTERESTED: {
          actions: ["Screener.isInterested", "Models.User.create"],
        },
        NOT_INTERESTED: CANCEL_STATE,
        SUBMIT: SAVE_STATE,
      },
    },
  },
});
