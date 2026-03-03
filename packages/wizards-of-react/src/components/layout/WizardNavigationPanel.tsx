import React, { useState } from "react";
import { $TSFixMe, TWizardNavigationPanelProps } from "@xstate-wizards/spells";
import { ConfirmButton } from "../contentNodes/ConfirmButton";
import { logger } from "../../wizardDebugger";

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
    logger.info("EXIT Triggered (via navigation panel)", JSON.parse(JSON.stringify({ exitTo, machineMeta })));
    navigate(exitTo, { state: { skipConfirm: true } });
  };
  const triggerStartOver = () => {
    logger.info("START_OVER Triggered (via navigation panel)");
    onStartOver();
  };

  // RENDER
  return (
    <>
      <div className="xw--nav-options" onClick={() => setShowOptions(!showOptions)}>
        ☰
      </div>
      {showOptions && (
        <div className="xw--nav-dropdown" onMouseLeave={() => setShowOptions(false)}>
          {allowBack !== false && (
            <div className="xw--nav-dropdown xw--back-btn">
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
                className="xw--btn-sm xw--btn-white"
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
