import React, { useState } from "react";
import { spellMap } from "../spells/spellMap";
import { ID_INLINE_I18N } from "../spells/inlineI18n";
import { WizardRunner } from "@xstate-wizards/wizards-of-react";
import { TWizardNavigationPanelProps } from "@xstate-wizards/spells";

export const WizardNavigationPanel: React.FC<TWizardNavigationPanelProps> = ({
  allowBack,
  allowStartOver,
  exitTo,
  navigate,
  onBack,
  onStartOver,
}) => {
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
              Exit
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
  const [locale, setLocale] = useState("en");

  return (
    <div className="app">
      <header className="app-header">
        <h1>i18n Example</h1>
        <div className="app-header__controls">
          <span className="app-header__label">Language:</span>
          <button
            className={locale === "en" ? "active" : ""}
            onClick={() => setLocale("en")}
          >
            English
          </button>
          <button
            className={locale === "es" ? "active" : ""}
            onClick={() => setLocale("es")}
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
        spellKey={ID_INLINE_I18N}
        spellMap={spellMap}
        locale={locale}
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
        navigate={console.log}
        sessionEnabled={false}
        onWizardFinal={({ machine }) => {
          console.log(machine);
        }}
      />
    </div>
  );
};
