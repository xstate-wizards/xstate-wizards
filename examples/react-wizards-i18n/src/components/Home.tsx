import { t } from "i18next";
import React, { useEffect, useState } from "react";
import { spellMap } from "../spells/spellMap";
import { ID_LANGUAGE_PICKER } from "../spells/languagePicker";
import { WizardRunner } from "@xstate-wizards/wizards-of-react";
import { $TSFixMe, TWizardNavigationPanelProps, TWizardSerializations } from "@xstate-wizards/spells";
import { useTranslation } from "react-i18next";

import styled from "styled-components";

const WizardWrap = ({ children, title, progress, sections, showResourcesUpdatesWarning }) => {
  return (
    <div>
      <div className="x-wizard__header">{title}</div>
      {sections?.map((section) => (
        <span key={section.trigger} className={`x-wizard-section-bar__tag ${section.highlight ? "highlight" : ""}`}>
          {section.name}
        </span>
      ))}
      <form className="x-wizard__body" onSubmit={(e) => e.preventDefault()}>
        {children}
      </form>
    </div>
  );
};

type TConfirmButtonProps = {
  buttonType?: string;
  disabled?: boolean;
  inverted?: boolean;
  serializations: TWizardSerializations;
  messagePrompts: string[];
  onConfirm: () => void;
  size?: string;
  width?: string;
};

const FallbackButton = styled.button``;

export const ConfirmButton: React.FC<TConfirmButtonProps> = ({
  buttonType,
  disabled,
  inverted,
  messagePrompts,
  onConfirm,
  size,
  width,
  ...props
}) => {
  // Styled/Component Refs
  const Button: $TSFixMe = props.serializations?.components?.Button ?? FallbackButton;
  // State
  const [messageIndex, setMessageIndex] = useState(0);
  const handleClick = () => {
    if (messageIndex === messagePrompts.length - 1) {
      onConfirm();
    } else {
      setMessageIndex(messageIndex + 1);
    }
  };

  return (
    <Button
      disabled={disabled}
      size={size}
      width={width}
      buttonType={buttonType}
      inverted={inverted}
      onClick={handleClick}
    >
      {messagePrompts[messageIndex]}
    </Button>
  );
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
  const { t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);
  const triggerBack = () => {
    // logger.info("BACK Triggered (via navigation panel)");
    onBack();
  };
  const triggerExitTo = () => {
    // logger.info("EXIT Triggered (via navigation panel)", JSON.parse(JSON.stringify({ exitTo, machineMeta })));
    navigate(exitTo, { state: { skipConfirm: true } });
  };
  const triggerStartOver = () => {
    // logger.info("START_OVER Triggered (via navigation panel)");
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
              {machineMeta?.session && !machineMeta?.session?.hasPreviouslyFinished ? t("exit") : t("exit")}
              {/* ? `← Pause & Exit ${machineMeta?.title() ? `"${machineMeta?.title()}"` : "Section"}`
                : `← Exit ${machineMeta?.title() ? `"${machineMeta?.title()}"` : "Section"}`} */}
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
                  "Start Over",
                  // `← Yes, Start ${machineMeta?.title ? `"${machineMeta?.title}"` : "Section"} Over`,
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

export const Home = () => {
  const [languageCode, setLanguageCode] = useState("en");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(languageCode);
  }, [languageCode]);

  return (
    <div>
      <div>
        <h1>Language Changing Test</h1>
        <button onClick={() => setLanguageCode("en")}>English</button>
        <button onClick={() => setLanguageCode("es")}>Spanish</button>
        <hr />
      </div>

      <WizardRunner
        debugConfig={{
          logging: true,
          skipSaves: true,
        }}
        spellKey={ID_LANGUAGE_PICKER}
        spellMap={spellMap}
        models={{
          User: {
            modelName: "User",
            schema: {},
            loader: async () => [],
          },
        }}
        serializations={{
          actions: {},
          components: { WizardWrap, WizardNavigationPanel },
          guards: {},
          functions: {},
        }}
        translate={t}
        navigate={console.log}
        sessionEnabled={false}
        onWizardFinal={({ machine }) => {
          console.log(machine);
        }}
      />
    </div>
  );
};
