import { INTERVIEW_REVIEW_STATE } from "./stateTargets";

// Transition Templates
export const IN_REVIEW_TRANSITION = {
  target: INTERVIEW_REVIEW_STATE,
  cond: (ctx) => ctx?.states?.[INTERVIEW_REVIEW_STATE] === true,
};

// Buttons
export const CONTENT_NODE_BACK = {
  type: "button",
  event: "BACK",
  attrs: { className: "x-wizard__header-back-button" },
};
export const CONTENT_NODE_SUBMIT = {
  type: "button",
  buttonType: "submit",
  text: "Continue",
  event: "SUBMIT",
  attrs: { size: "lg", width: "100%" },
  disabledByFreshDelay: true,
};
export const CONTENT_NODE_YES = { type: "button", buttonType: "submit", text: "Yes", event: "YES" };
export const CONTENT_NODE_NO = { type: "button", buttonType: "submit", text: "No", event: "NO" };

// Exiting
export const CONTENT_NODE_PAUSE_AND_EXIT_TO = {
  type: "button",
  text: "Pause and Exit Interview",
  attrs: { size: "lg", className: "x-wizard__pause-and-exit-to-button" },
};
