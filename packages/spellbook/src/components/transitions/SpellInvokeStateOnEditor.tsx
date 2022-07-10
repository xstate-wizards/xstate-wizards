import React from "react";
import styled from "styled-components";
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
    spellsStatic?.[state.key] ?? Object.values(spells).find((s) => s.isActive && s.key === state.key)
  )?.schema;
  // RENDER
  return (
    <StyledSpellInvokeStateOnEditor>
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
    </StyledSpellInvokeStateOnEditor>
  );
};

const StyledSpellInvokeStateOnEditor = styled.div`
  padding: 0.5em 1em;
  background: #f0f0f0;
  overflow-x: scroll;
  .on-event {
    display: flex;
    padding-bottom: 0.2em;
    border-bottom: 1px solid #bbb;
    margin-bottom: 0.2em;
    .on-event__name {
      min-width: 120px;
      max-width: 120px;
      width: 120px;
      padding-top: 0.2em;
      font-weight: 900;
      font-size: 14px;
      div {
        display: flex;
        justify-content: flex-start;
      }
      button {
        font-size: 10px;
      }
    }
    .on-event__transitions {
      display: flex;
      width: 100%;
    }
  }
`;
