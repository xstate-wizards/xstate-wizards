import { WizardRunner } from "@xstate-wizards/wizards-of-react";
import React from "react";
import { useNavigate } from "react-router";
import { spellMap } from "../spells/spellMap";
import { putUser, selectUser } from "../models/user";
import { wizardSerializations } from "../wizards/wizardSerializations";
import { ID_EXAMPLE_SCREENER } from "../spells/exampleScreener";
import { wizardModelMap } from "../wizards/wizardModelMap";

type TScreenerProps = {
  onClose: () => void;
};

export const Screener: React.FC<TScreenerProps> = ({ onClose }) => {
  const navigate = useNavigate();
  return (
    <WizardRunner
      debugConfig={{
        logging: true,
        skipSaves: true,
      }}
      spellKey={ID_EXAMPLE_SCREENER}
      spellMap={spellMap}
      models={wizardModelMap}
      serializations={wizardSerializations}
      navigate={navigate}
      sessionEnabled={false}
      onWizardFinal={({ machine }) => {
        // if user qualified...
        if (machine.context.states.isInterestedInInterview) {
          // --- update user info
          putUser(selectUser(machine.context));
          // --- route to interview
          navigate("/interview");
        } else {
          // otherwise signal to parent component to close
          onClose?.();
        }
      }}
    />
  );
};
