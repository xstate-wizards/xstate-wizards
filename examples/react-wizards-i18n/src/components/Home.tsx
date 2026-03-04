import React, { useEffect, useState } from "react";
import { spellMap } from "../spells/spellMap";
import { ID_LANGUAGE_PICKER } from "../spells/languagePicker";
import { WizardRunner } from "@xstate-wizards/wizards-of-react";
import { TWizardNavigationPanelProps } from "@xstate-wizards/spells";
import { useTranslation } from "react-i18next";

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

  return (
    <>
      <div className="xw--nav-options" onClick={() => setShowOptions(!showOptions)}>
        ☰
      </div>
      {showOptions && (
        <div className="xw--nav-dropdown" onMouseLeave={() => setShowOptions(false)}>
          {allowBack !== false && (
            <div>
              <button onClick={() => onBack()}>← Back</button>
            </div>
          )}
          <div>
            <button onClick={() => navigate(exitTo, { state: { skipConfirm: true } })}>
              {t("exit")}
            </button>
          </div>
          {allowStartOver && (
            <div>
              <button onClick={() => onStartOver()}>← Start Over</button>
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
    <div className="app">
      <header className="app-header">
        <h1>i18n Example</h1>
        <div className="app-header__controls">
          <span className="app-header__label">Language</span>
          <button
            className={languageCode === "en" ? "active" : ""}
            onClick={() => setLanguageCode("en")}
          >
            English
          </button>
          <button
            className={languageCode === "es" ? "active" : ""}
            onClick={() => setLanguageCode("es")}
          >
            Spanish
          </button>
        </div>
      </header>

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
          components: { WizardNavigationPanel },
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
