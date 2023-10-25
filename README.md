# 🔮 XState Wizards 🧙🏽‍♂️


### Handle incredibly complex questionnaires with ease, by writing questions and sets of questions as state machines! Here's how it works:

1. Write your flows with each question/question set presented to the user as its own state.
2. On each state...
   1. we list out content as JSON which is turned into a pretty UI by the library (you can replace it with your own styling components). 
   2. As the user interacts with components, they trigger events which you will explictly write out transitions for. Sometimes it sends them to a new state or modifies data. **The magic of xstate-wizards** is that we've abstracted out a lot of boilerplate events/configs to speed up the development flow.
3. Each transition can have conditions for different target states. That can be another question, a data fetch, or spawning an entirely new and isolated question flow that will resolve back into this state machine.

| Example Question State | Example State Listing Address Records | Re-Usable Spawned Address Editor |
| :---: | :---: | :---: |
| ![Phone number question](/docs/example-state-1.png) | ![Phone number question](/docs/example-state-2.png) | ![Phone number question](/docs/example-state-3.png) 

| Spawned Actor Model for Resuable UI Flows/State Machines |
| :--: | 
| ![Diagram of questionnaire state machines invoking each other](/docs/flow.png) |

## The Packages

To make this work across multiple frontends, we've separated out our logic & UI packages.

- `@xstate-wizards/spells` has state machine ("spell") setup functions and references
- `@xstate-wizards/wizards-of-react` has UI components for running in a [React](https://react.dev/) setup
- `@xstate-wizards/wizards-of-vue` Placeholder for [Vue](https://vuejs.org/) implementation of components
- `@xstate-wizards/wizards-of-svelte` Placeholder for [Svelte](https://svelte.dev/) implementation of components

In addition, as we've built complex flows that need input from non-technical team members, we've created some packages to aid in visibility as well as an entire no-code editor.

- `@xstate-wizards/crystal-ball` is a way to view state machines in an 'outline' mode, or in other words, in a linear chart with their branching sub-components revealed as well.
- `@xstate-wizards/spellbook` is a no-code editor for these flows. It takes advantage of the fact that state machines can be serialized as JSON. (If you decide to turn this into a wildly successful for-profit company, please consider throwing some money back to this project)

| *Crystal Ball* Reviewer | *Spellbook* No-code Editor |
| :--: | :--: |
| ![State machine outline viewer](/docs/crystal-ball.png) | ![No code editor for questionnaire flows called Spellbook](/docs/spellbook.png) |

## Casting Your First Spell (aka Writing Your First State Machine)

We highly recommend you check out the examples `./examples/react-wizards` and `./examples/react-wizards-i18n` to see how the whole system works. But at a high level, here is what it looks like to code a question flow, with some annotations provided as comments.

```typescript
export const machineMapping = createSpell({
  version: "1", // if persisting sessions, incrementing can force restarts
  config: {
    initial: "personalizedStartMessage", // state machine initial state choice
    title: "Example Screener",
    exitTo: "/",
    sectionsBar: [],
  },
  models: {}, // If you want to map to ORM/database models for pushing updates simply
  schema: {}, // If you want to set defaults
  states: {
    // 1st state...
    personalizedStartMessage: {
      // ... content to be rendered in React/Vue
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
      // ... events to be evaluated (check XState docs)
      on: {
        WAITED: { target: "questionVolume" },
      },
    },
    // 2nd state...
    questionVolume: {
      content: (ctx) => [
        { type: "h5", text: "How many questions do you have to ask your users?" },
        { type: "p", text: "Err on the side of max questions, as if a user hits every branch of conditionals." },
        {
          type: "button",
          text: "200+ Questions",
          // Example of how we can send data to our event listeners (look below at the 'on' object)
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
        // Here's an example of a serialized function that increments an internal property/value from data tied to the event.
        SUBMIT: { target: "developerExperience", actions: ["Screener.incrementWizardScoreBy"] },
        NONE: { target: "developerExperience" },
      },
    },
    // 3rd state...
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
        // Example of a link, but also one that fires off an event when clicked. In this case VIEW_OUTLINE will change a boolean on our machine context.
        {
          type: "buttonLink",
          text: "View Outline Tool [⬈]",
          href: "/outline?spellKey=exampleScreener",
          attrs: { inverted: true, target: "_blank" },
          event: "VIEW_OUTLINE",
        },
        { type: "hr" },
        // Example disabling buttons until the VIEW_OUTLINE event is triggered, which modifies machine state.
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
          // Example of inline modification of the machine context with actions. See XState docs for more on tihs.
          actions: [
            assign({
              states: (ctx) => ({ ...ctx.states, developerExperience: { viewedOutline: true } }),
            }),
          ],
        },
        YES: [{ target: "jsonLogicNeed", actions: ["Screener.incrementWizardScore"] }],
        NO: { target: "jsonLogicNeed" },
        // Example of conditional w/ json-logic for entirely serialized machines.
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
  },
});

```

## Who is Using this?

This library was created by [Mark Hansen](https://markhansen.com) who was building a self-service tool for low-income people to file bankruptcy along with several immigration products. It continues to be used at [Upsolve](https://upsolve.org/) and other social impact and government adjacent orgs in the U.S.

This library stands on the shoulders of the XState community, which is why the name was chosen to pay clear respect. It's also been deeply informed by the past experiences of the team that salvaged Healthcare.gov after its launch.


## Development

### Getting Started

Since we have several layers of package dependency, we use `Lerna` for pushing installs/builds of packages through to one another. We use `yalc` for propagating package changes up the chain (ex: /spells -> /wizards-of-react -> /spellbook) locally so we can play in our examples with refinements.

But before we do anything, get onto the right Node version, and run our install/build lerna scripts via yarn.

- `nvm use`
- `yarn install`
- `yarn build`

Then we'll want to connect our package directories to our local registry mirror using `yalc`:

- `yarn yalclink`

And whenever we make changes across packages, to easily propagate them to the registry and into our other packages:

- `yarn yalcpush`


### Norms

This project has a wrapper to `console.log` so we can prefix output and make it easier to spot/filter. This means you cannot use console.log. Look for examples of logger.debug or logger.info instead.

To update these packages on the NPM registry, we have commands such as `yarn patch` that you can run on each of the packages.