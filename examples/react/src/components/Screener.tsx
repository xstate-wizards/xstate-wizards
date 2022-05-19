import { WizardRunner } from "@upsolve/wizards";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getWizardMap, ID_EXAMPLE_SCREENER } from "../wizards/wizardMap";
import { putUser, selectUser } from "../models/user";

type TScreenerProps = {
  onClose: () => void;
};

export const Screener: React.FC<TScreenerProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [wizardMap, setWizardMap] = useState();
  // HACK: set async to avoid wizardMap circular dependency issue...
  useEffect(() => {
    getWizardMap().then(setWizardMap);
  }, []);

  return !wizardMap ? null : (
    <WizardRunner
      debugConfig={{
        logging: true,
        skipSaves: true,
      }}
      machineId={ID_EXAMPLE_SCREENER}
      machineMap={wizardMap}
      machineSerializations={{
        components: {},
        validations: {},
      }}
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
