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

In addition, as we've built complex flows that need input from non-technical team members, we've created some packages to aid in visibility as well as an entire no-code editor.

- `@xstate-wizards/crystal-ball` is a way to view state machines in an 'outline' mode, or in other words, in a linear chart with their branching sub-components revealed as well.
- `@xstate-wizards/spellbook` is a no-code editor for these flows. It takes advantage of the fact that state machines can be serialized as JSON.

| *Crystal Ball* Reviewer | *Spellbook* No-code Editor |
| :--: | :--: |
| ![State machine outline viewer](/docs/crystal-ball.png) | ![No code editor for questionnaire flows called Spellbook](/docs/spellbook.png) |

## Casting Your First Spell (aka Writing Your First State Machine)

We highly recommend you check out the examples `./examples/react-wizards` and `./examples/react-wizards-i18n` to see how the whole system works. But at a high level, here is what it looks like to code a question flow, with some annotations provided as comments.

```typescript
import { assign } from "xstate";
import { createSpell } from "@xstate-wizards/spells";

export const machineMapping = createSpell({
  key: "exampleScreener",
  version: "1",
  config: {
    initial: "welcome",
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
          wizardScore: { type: ["number"], default: 0 },
        },
      },
    },
  },
  states: {
    welcome: {
      // Content is a function of machine context, returning UI nodes
      content: ({ context }) => [
        {
          type: "h5",
          text: `Great to meet you, ${selectUser(context)?.firstName}!`,
          attrs: { textAlign: "center" },
        },
        { type: "p", text: "Let's explore some use cases!" },
        { type: "button", text: "Get Started", event: "SUBMIT" },
      ],
      on: {
        SUBMIT: { target: "questionVolume" },
      },
    },
    questionVolume: {
      content: ({ context }) => [
        { type: "h5", text: "How many questions do you have to ask your users?" },
        {
          type: "button",
          text: "200+ Questions",
          // Send data along with events
          event: { type: "SUBMIT", data: { incrementBy: 5 } },
        },
        {
          type: "button",
          text: "50-100 Questions",
          event: { type: "SUBMIT", data: { incrementBy: 2 } },
        },
        { type: "button", text: "Less than 10", event: "NONE" },
        { type: "hr" },
        {
          type: "callout",
          content: [{ type: "small", text: `Wizard Score: ${context?.states?.wizardScore ?? 0}` }],
        },
      ],
      on: {
        // Serialized action reference — defined in your serializations
        SUBMIT: { target: "nextState", actions: ["Screener.incrementWizardScoreBy"] },
        NONE: { target: "nextState" },
      },
    },
    nextState: {
      content: ({ context }) => [
        { type: "h5", text: "Inline assign example" },
        { type: "button", text: "Continue", event: "CONTINUE" },
        { type: "button", text: "Skip", event: "SKIP" },
      ],
      on: {
        CONTINUE: {
          // Inline XState v5 assign action
          target: "done",
          actions: [
            assign({
              states: ({ context }) => ({
                ...context.states,
                completed: true,
              }),
            }),
          ],
        },
        // Conditional transitions with json-logic for fully serialized machines
        SKIP: [
          {
            target: "done",
            cond: {
              type: "jsonLogic",
              jsonLogic: {
                ">=": [{ var: "context.states.wizardScore" }, 3],
              },
            },
          },
          { target: "questionVolume" },
        ],
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

Requires Node >= 22. The project uses npm workspaces — all packages and examples are linked automatically.

```bash
npm install
npm run build
```

### Running Examples

```bash
cd examples/react-wizards && npm run dev
cd examples/react-wizards-i18n && npm run dev
cd examples/react-spellbook && npm run dev
```

### Testing

```bash
npm test           # unit tests
npm run test:e2e   # Playwright e2e tests
```

### Publishing

Each package has `patch`, `minor`, and `major` scripts for publishing to npm.