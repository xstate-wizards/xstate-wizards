# 🔮 xstate-wizards example: react 🧙🏽‍♂️

A quick demo of various features and ways of using xstate-wizards in React. See a screener doing quick yes/nos, more advanced data manipulation and logic jumps, custom validation, and more!

---

## Get Started & Preview

This frontend demo is quick to setup and preview. From this directory, simply `yarn install` and `yarn dev` and Vite will spin up.

---

## Todo List

This is a WIP repo for this library so things to be implemented

- example of spawned interview machines, that resolve back to the machine that invoked it
- example of custom React component reference and interactivity
- examples of styling control

This is also a WIP library, largely refactored for simplified public use. In my mind, milestones are:

- Alpha
  - Simpler way to compile machine maps (and a way thats less likely to cause circular dependencies)
  - Less error prone way of handling "local id"
- Beta
  - Better styling experience/handling
  - More extensive/helpful typings
- v1
  - String patterns for referencing/selecting data rather than importing selectors so we're more JSON friendly
  - Accept json-logic in event guards and other conditionals
