import React from "react";

const WizardLocaleContext = React.createContext<string | undefined>(undefined);

export const WizardLocaleProvider = WizardLocaleContext.Provider;
export const useWizardLocale = () => React.useContext(WizardLocaleContext);
