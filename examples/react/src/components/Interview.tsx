import { WizardRunner } from "@upsolve/wizards";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { getUser } from "../models/user";
import { ID_EXAMPLE_INTERVIEW } from "../wizards/exampleInterview";
import { wizardMap } from "../wizards/wizardMap";
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
        debugConfig={{
          logging: true,
          skipSaves: true,
        }}
        machineId={ID_EXAMPLE_INTERVIEW}
        machineMap={wizardMap}
        machineSerializations={wizardSerializations}
        navigate={navigate}
        sessionEnabled={false}
        onMachineFinal={({ machine }) => {
          // When done, send back to base route w/ screener
          navigate("/");
        }}
      />
    </form>
  );
};
