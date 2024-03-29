import { WizardRunner, WizardWrapFullScreen } from "@xstate-wizards/wizards-of-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { getUser } from "../models/user";
import { ID_EXAMPLE_INTERVIEW } from "../spells/exampleInterview";
import { spellMap } from "../spells/spellMap";
import { wizardModelMap } from "../wizards/wizardModelMap";
import { wizardSerializations } from "../wizards/wizardSerializations";

export const Interview = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // if no user, navigate back to home route
    getUser().then((user) => {
      // if (!user) navigate("/");
    });
  }, []);

  return (
    <form>
      <WizardRunner
        configExitTo="/"
        debugConfig={{
          logging: true,
          skipSaves: true,
        }}
        spellKey={ID_EXAMPLE_INTERVIEW}
        spellMap={spellMap}
        models={wizardModelMap}
        serializations={{
          ...wizardSerializations,
          components: {
            ...wizardSerializations.components,
            WizardWrap: WizardWrapFullScreen,
          },
        }}
        navigate={navigate}
        sessionEnabled={false}
        onWizardFinal={({ machine }) => {
          // When done, send back to base route w/ screener
          navigate("/");
        }}
      />
    </form>
  );
};
