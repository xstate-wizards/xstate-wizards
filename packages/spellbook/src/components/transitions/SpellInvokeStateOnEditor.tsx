import React from "react";

import { $TSFixMe, TPrepparedSpellMapping, TSpellInstructions, TWizardSerializations } from "@xstate-wizards/spells";
import { SpellStateEventTransitionsEditor } from "./SpellStateEventTransitionsEditor";

type TSpellInvokeStateOnEditorProps = {
  onUpdate: (data: any) => void;
  schema: $TSFixMe;
  serializations: TWizardSerializations;
  state: $TSFixMe;
  stateName: string;
  states: $TSFixMe;
  spells: {
    [id: number]: TSpellInstructions;
  };
  spellsStatic: {
    [key: string]: TSpellInstructions | TPrepparedSpellMapping;
  };
};

export const SpellInvokeStateOnEditor: React.FC<TSpellInvokeStateOnEditorProps> = ({
  onUpdate,
  schema,
  serializations,
  state,
  stateName,
  states,
  spells,
  spellsStatic,
}) => {
  const invokedSchema = (
    spellsStatic?.[state.key] ?? Object.values(spells ?? {}).find((s) => s.isActive && s.key === state.key)
  )?.schema;
  // RENDER
  return (
    <div className="xw-sb__invoke-on">
      <div>
        {["onDone", "onError"].map((handlerName) => (
          <div key={handlerName} className="on-event">
            <div className="on-event__name">
              <div title={handlerName}>{handlerName}</div>
              <div>
                <button onClick={() => onUpdate({ [handlerName]: (state[handlerName] ?? []).concat({}) })}>+</button>
              </div>
            </div>
            <div className="on-event__transitions">
              <SpellStateEventTransitionsEditor
                onUpdate={(transitions) => {
                  console.log("SpellInvokeStateOnEditor: onUpdate", { transitions });
                  onUpdate({ [handlerName]: transitions ?? [] });
                }}
                schema={schema}
                invokedSchema={invokedSchema}
                serializations={serializations}
                stateName={stateName}
                states={states}
                transitions={state[handlerName]}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};