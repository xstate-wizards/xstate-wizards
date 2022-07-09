import React, { useState } from "react";
import { $TSFixMe } from "@xstate-wizards/spells";
import { ConfirmButton } from "../contentNodes/ConfirmButton";
import { logger } from "../../wizardDebugger";

type TWizardNavigationPanelProps = {
  allowBack: $TSFixMe;
  allowStartOver: $TSFixMe;
  exitTo: $TSFixMe;
  machineMeta: $TSFixMe;
  serializations: $TSFixMe;
  navigate: $TSFixMe;
  onBack: $TSFixMe;
  onStartOver: $TSFixMe;
};

export const WizardNavigationPanel: React.FC<TWizardNavigationPanelProps> = ({
  allowBack,
  allowStartOver,
  exitTo,
  machineMeta,
  serializations,
  navigate,
  onBack,
  onStartOver,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const triggerBack = () => {
    logger.info("BACK Triggered (via navigation panel)");
    onBack();
  };
  const triggerExitTo = () => {
    logger.info("EXIT Triggered (via navigation panel)");
    navigate(exitTo || "/journey", { state: { skipConfirm: true } });
  };
  const triggerStartOver = () => {
    logger.info("START_OVER Triggered (via navigation panel)");
    onStartOver();
  };

  // RENDER
  return (
    <>
      <div className="x-wizard__header__navigation-options" onClick={() => setShowOptions(!showOptions)}>
        ☰
      </div>
      {showOptions && (
        <div className="x-wizard__header__navigation-options-dropdown" onMouseLeave={() => setShowOptions(false)}>
          {allowBack !== false && (
            <div className="navigation-options-dropdown back-button">
              <button onClick={() => triggerBack()}>← Back</button>
            </div>
          )}
          <div>
            <button onClick={() => triggerExitTo()}>
              {machineMeta?.session && !machineMeta?.session?.hasPreviouslyFinished
                ? `← Pause & Exit ${machineMeta?.title ? `"${machineMeta?.title}"` : "Section"}`
                : `← Exit ${machineMeta?.title ? `"${machineMeta?.title}"` : "Section"}`}
            </button>
          </div>
          {allowStartOver && (
            <div>
              <ConfirmButton
                width="100%"
                size="sm"
                buttonType="white"
                messagePrompts={[
                  `← Redo This Section`,
                  `← Yes, Start ${machineMeta?.title ? `"${machineMeta?.title}"` : "Section"} Over`,
                ]}
                onConfirm={() => triggerStartOver()}
                serializations={serializations}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};
