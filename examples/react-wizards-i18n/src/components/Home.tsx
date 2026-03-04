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
