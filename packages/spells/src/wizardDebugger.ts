import create from "zustand";
import createVanilla from "zustand/vanilla";

export type TWizardDebuggerStore = {
  logging: boolean;
  setLogging: (logging: boolean) => void;
  skipSaves?: boolean; // don't dispatches saves/progress/requests
  setSkipSaves: (logging: boolean) => void;
};

export const wizardDebuggerStore = createVanilla<TWizardDebuggerStore>((set, get) => ({
  logging: false,
  setLogging: (logging: boolean) => set({ logging: logging ?? false }),
  skipSaves: null,
  setSkipSaves: (skipSaves: boolean) => set({ skipSaves: skipSaves ?? false }),
}));

export const useWizardDebugger = create(wizardDebuggerStore);

export const logger = {
  debug: (...args) => {
    if (wizardDebuggerStore.getState().logging) console.debug("%c[Wizard]", `color:#a246ff;font-weight:900;`, ...args);
  },
  error: (...args) => {
    if (wizardDebuggerStore.getState().logging) console.error("%c[Wizard]", `color:#a246ff;font-weight:900;`, ...args);
  },
  info: (...args) => {
    if (wizardDebuggerStore.getState().logging) console.log("%c[Wizard]", `color:#a246ff;font-weight:900;`, ...args);
  },
  warning: (...args) => {
    if (wizardDebuggerStore.getState().logging) console.warn("%c[Wizard]", `color:#a246ff;font-weight:900;`, ...args);
  },
};
