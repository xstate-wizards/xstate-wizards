import { WizardRunner } from "@upsolve/wizards";
import React from "react";
import { useNavigate } from "react-router";
import { wizardMap } from "../wizards/wizardMap";
import { putUser, selectUser } from "../models/user";
import { wizardSerializations } from "../wizards/wizardSerializations";
import { ID_EXAMPLE_SCREENER } from "../wizards/exampleScreener";

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
      machineId={ID_EXAMPLE_SCREENER}
      machineMap={wizardMap}
      machineSerializations={wizardSerializations}
      navigate={navigate}
      sessionEnabled={false}
      onMachineFinal={({ machine }) => {
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
