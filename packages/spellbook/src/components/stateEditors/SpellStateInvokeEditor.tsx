import React from "react";
import styled from "styled-components";
import { $TSFixMe, TWizardSerializations } from "@xstate-wizards/spells";
import { JsonLogicBuilder } from "../logic/JsonLogicBuilder";

type TSpellStateInvokeEditorProps = {
  onUpdate: (data: any) => void;
  schema: $TSFixMe;
  serializations: TWizardSerializations;
  state: $TSFixMe;
  stateName: string;
};

export const SpellStateInvokeEditor: React.FC<TSpellStateInvokeEditorProps> = ({
  onUpdate,
  schema,
  serializations,
  state,
}) => {
  return (
    <StyledSpellStateInvokeEditor>
      {state?.invoke?.srcSerialized == null ? (
        <div className="invoke__add">
          <div>
            <button
              onClick={() =>
                onUpdate({
                  invoke: {
                    srcSerialized: {
                      transitionEventType: null,
                      jsonLogic: {},
                    },
                  },
                })
              }
            >
              + On page shown...
            </button>
          </div>
        </div>
      ) : (
        <div className="invoke__editor">
          <div>
            <div className="invoke__editor__header">
              <small>If showing page, run function: </small>
            </div>
            <div className="invoke__editor__logic">
              <JsonLogicBuilder
                functions={serializations?.functions ?? {}}
                schema={schema}
                state={state}
                jsonLogic={state.invoke.srcSerialized?.jsonLogic ?? {}}
                onUpdate={(jsonLogic) =>
                  onUpdate({
                    invoke: {
                      srcSerialized: {
                        transitionEventType: state.invoke.srcSerialized?.transitionEventType,
                        jsonLogic,
                      },
                    },
                  })
                }
              />
            </div>
          </div>
          <div>
            <div className="invoke__editor__header">
              <small>💥 Event Trigger/Data:</small>
            </div>
            <div className="invoke__editor__logic">
              <select
                value={state.invoke.srcSerialized?.transitionEventType}
                onChange={(e) =>
                  onUpdate({
                    invoke: {
                      srcSerialized: {
                        transitionEventType: e.target.value,
                        jsonLogic: state.invoke.srcSerialized?.jsonLogic,
                      },
                    },
                  })
                }
              >
                <option value=""></option>
                {Object.keys(state.on).map((on) => (
                  <option key={on} value={on}>
                    {on}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="invoke__editor__header">
              <button onClick={() => onUpdate({ invoke: null })}>❌</button>
            </div>
            <div />
          </div>
        </div>
      )}
    </StyledSpellStateInvokeEditor>
  );
};

const StyledSpellStateInvokeEditor = styled.div`
  padding: 0em 1em 0.5em;
  background: #fff; #f0f0f0;
  overflow-x: scroll;
  .invoke__editor {
    display: flex;
    border: 2px solid #f5f5f5;
    & > div {
      width: 100%;
      flex-grow: 1;
    }
    & > div:first-of-type {
      width: 100%;
    }
    & > div:nth-of-type(2) {
      max-width: 150px;
      select {
        max-width: 100%;
      }
    }
    & > div:last-of-type {
      margin-right: 0;
      max-width: 36px;
    }
  }
  .invoke__editor__header {
    padding: 0 4px;
    background: #f5f5f5;
    border-bottom: 2px solid #f0f0f0;
    border-right: 2px solid #f0f0f0;
    width: 100%;
    small {
      font-size: 11px;
      font-weight: 800;
    }
    button {
      font-size: 8px;
    }
  }
  .invoke__editor__logic {
    padding: 4px 8px;
  }
  .invoke__add button {
    font-size: 12px;
  }
`;
