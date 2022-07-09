export const logger = {
  debug: (...args) => {
    console.debug("%c[Wizard]", `color:#a246ff;font-weight:900;`, ...args);
  },
  error: (...args) => {
    console.error("%c[Wizard]", `color:#a246ff;font-weight:900;`, ...args);
  },
  info: (...args) => {
    console.log("%c[Wizard]", `color:#a246ff;font-weight:900;`, ...args);
  },
  warning: (...args) => {
    console.warn("%c[Wizard]", `color:#a246ff;font-weight:900;`, ...args);
  },
};
