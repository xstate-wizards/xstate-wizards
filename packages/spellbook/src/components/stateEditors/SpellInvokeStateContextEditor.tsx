import { omit } from "lodash";
import React, { useMemo } from "react";
import styled from "styled-components";
import { $TSFixMe, TPrepparedSpellMapping, TSpellInstructions, TWizardSerializations } from "@xstate-wizards/spells";
import { JsonLogicBuilder } from "../logic/JsonLogicBuilder";

type TSpellInvokeStateContextEditorProps = {
  schema: $TSFixMe;
  serializations: TWizardSerializations;
  spells: {
    [id: number]: TSpellInstructions;
  };
  spellsStatic: {
    [key: string]: TSpellInstructions | TPrepparedSpellMapping;
  };
  state: $TSFixMe;
  states: $TSFixMe;
  onUpdate: (data: any) => void;
};

export const SpellInvokeStateContextEditor: React.FC<TSpellInvokeStateContextEditorProps> = ({
  onUpdate,
  serializations,
  spells,
  spellsStatic,
  state,
  states,
  schema,
}) => {
  // OPTIMIZE this look up feels super inefficient
  const targetSpellProps = useMemo(() => {
    const spell =
      spellsStatic?.[state.key] ?? Object.values(spells ?? {}).find((s) => s.isActive && s.key === state.key);
    return Object.keys(spell?.schema?.properties ?? {});
  }, [spells, state.key]);

  // RENDER
  return (
    <StyledSpellInvokeStateContextEditor>
      <div className="context-editor__key">
        <small>Send Context: </small>
        <button onClick={() => onUpdate({ context: { ...state.context, "": {} } })}>+</button>
      </div>
      <div className="context-editor__value">
        {Object.keys(state.context ?? {})
          .sort()
          .map((contextKey) => (
            <div key={contextKey} className="context-key">
              <div className="context-key__name">
                <div>
                  <select
                    value={contextKey}
                    onChange={(e) =>
                      onUpdate({
                        // update new key, and omit old
                        context: omit({ ...state.context, [e.target.value]: state.context[contextKey] }, [contextKey]),
                      })
                    }
                  >
                    <option value="">---</option>
                    {/* context options are first layer of properties on target spell schema */}
                    {targetSpellProps.map((key) => (
                      <option key={key} value={key} disabled={Object.keys(state.context ?? {}).includes(key)}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="context-key__editor">
                <JsonLogicBuilder
                  functions={serializations?.functions ?? {}}
                  jsonLogic={state.context[contextKey]}
                  onUpdate={(jsonLogic) => {
                    console.log("JsonLogicBuilder: onUpdate");
                    onUpdate({
                      context: { ...state.context, [contextKey]: jsonLogic },
                    });
                  }}
                  schema={schema}
                  state={state}
                  states={states}
                />
              </div>
              <div>
                <button onClick={() => onUpdate({ context: omit(state.context, [contextKey]) })}>❌</button>
              </div>
            </div>
          ))}
      </div>
    </StyledSpellInvokeStateContextEditor>
  );
};

const StyledSpellInvokeStateContextEditor = styled.div`
  display: flex;
  padding: 0.5em 1em 0;
  .context-editor__key {
    width: 80px;
    min-width: 80px;
    max-width: 80px;
    button {
      max-width: 18px;
    }
  }
  .context-editor__value {
    width: 100%;
  }

  .context-key {
    display: flex;
    padding-bottom: 0.2em;
    border-bottom: 1px solid #bbb;
    margin-bottom: 0.2em;
    .context-key__name {
      font-size: 13px;
      padding-top: 0.2em;
      min-width: 40px;
      select {
        max-width: 100%;
        width: 100%;
      }
    }
    .context-key__editor {
      display: flex;
      width: 100%;
    }
  }
`;
