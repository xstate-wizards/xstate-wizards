import { WizardRunner } from "@upsolve/wizards";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getUser } from "../models/user";
import { getWizardMap, ID_EXAMPLE_INTERVIEW } from "../wizards/wizardMap";

export const Interview = () => {
  const navigate = useNavigate();
  const [wizardMap, setWizardMap] = useState();
  useEffect(() => {
    // HACK: set async to avoid wizardMap circular dependency issue...
    getWizardMap().then(setWizardMap);
    // if no user, navigate back to home route
    getUser().then((user) => {
      if (!user) navigate("/");
    });
  }, []);

  return (
    <form>
      {!wizardMap ? null : (
        <WizardRunner
          debugConfig={{
            logging: true,
            skipSaves: true,
          }}
          machineId={ID_EXAMPLE_INTERVIEW}
          machineMap={wizardMap}
          machineSerializations={{}}
          navigate={navigate}
          sessionEnabled={false}
          onMachineFinal={({ machine }) => {
            // idk
          }}
        />
      )}
    </form>
  );
};
