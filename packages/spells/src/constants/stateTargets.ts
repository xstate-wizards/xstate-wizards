// Events (often w/ hidden side effects)
export const EVENT_ASSIGN_CONTEXT = "ASSIGN_CONTEXT";
export const EVENT_BACK = "BACK";
export const EVENT_SUBMIT = "SUBMIT";
export const EVENT_START_OVER = "START_OVER";
// States (often w/ references outside machine transitions)
export const CANCEL_STATE = "cancel";
export const CANCEL_STATE_WITH_CONFIRMATION = {
  target: CANCEL_STATE,
  cond: () => window.confirm("Changes you made may not be saved. Are you sure?"),
};
export const INTERVIEW_REVIEW_STATE = "interviewReview";
export const INTERVIEW_INTRO_STATE = "interviewIntro";
export const SAVE_STATE = "save";
