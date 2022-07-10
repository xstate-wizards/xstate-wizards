import { cloneDeep } from "lodash";
import React from "react";
import styled from "styled-components";
import { SAVE_STATE, CANCEL_STATE, $TSFixMe, TWizardSerializations } from "@xstate-wizards/spells";
import { reorderArrayItem, REORDER_DIRECTION, removeArrayItem } from "../../utils";
import { JsonLogicBuilder } from "../logic/JsonLogicBuilder";
import { ActionEditor } from "./ActionEditor";

type TSpellStateEventTransitionsEditorProps = {
  allowActionTypes?: $TSFixMe;
  allowTarget?: boolean;
  onUpdate: $TSFixMe;
  schema: $TSFixMe;
  invokedSchema?: $TSFixMe;
  serializations: TWizardSerializations;
  stateName: string;
  states: $TSFixMe;
  transitions: $TSFixMe;
};

export const SpellStateEventTransitionsEditor: React.FC<TSpellStateEventTransitionsEditorProps> = ({
  allowActionTypes,
  allowTarget = true,
  onUpdate,
  schema,
  invokedSchema,
  serializations,
  stateName,
  states,
  transitions,
}) => {
  return (
    <StyledSpellStateEventTransitionEditor>
      {transitions?.map((transition, transitionIndex, transitionArr) => (
        <div key={`${transition.target}-${transitionIndex}`} className="transition">
          <div className="transition__details">
            {/* COND */}
            <div className="transition__details__logic-holder">
              <small>{transitionIndex === 0 ? "Condition" : ""}</small>
              {transition.cond != null && (
                <div key="transition.cond-exists" style={{ display: "flex" }}>
                  <button
                    // interestingly onClick causes the add btn to also fire onClick, so i had to add a key
                    key="delete-cond-btn"
                    style={{ maxWidth: "24px", marginLeft: "4px" }}
                    onMouseDown={() => {
                      console.log("button: onMouseDown delete");
                      const newTransitions = cloneDeep(transitions);
                      newTransitions[transitionIndex].cond = null;
                      onUpdate(newTransitions);
                    }}
                  >
                    ❌
                  </button>
                  <JsonLogicBuilder
                    functions={serializations?.functions ?? {}}
                    jsonLogic={transition.cond.jsonLogic}
                    onUpdate={(jsonLogic) => {
                      console.log("JsonLogicBuilder: onUpdate");
                      const newTransitions = cloneDeep(transitions);
                      newTransitions[transitionIndex].cond = { type: "jsonLogic", jsonLogic };
                      onUpdate(newTransitions);
                    }}
                    schema={schema}
                    invokedSchema={invokedSchema}
                    state={states[stateName]}
                  />
                </div>
              )}
              {transition.cond == null && (
                <div key="transition.cond-doesnt-exist">
                  <button
                    key="add-cond-btn"
                    style={{ maxWidth: "24px", marginLeft: "4px" }}
                    onMouseDown={() => {
                      console.log("button: onMouseDown Add");
                      const newTransitions = cloneDeep(transitions);
                      newTransitions[transitionIndex].cond = { type: "jsonLogic", jsonLogic: {} };
                      onUpdate(newTransitions);
                    }}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
            {/* ACTIONS */}
            <div className="transition__details__actions">
              <small>{transitionIndex === 0 ? "Actions" : ""}</small>
              {transition.actions != null && (
                <div className="transition__details__actions__list">
                  {transition?.actions?.map((action, actionIndex) => (
                    <div key={actionIndex} className="transition__details__actions__list__item">
                      <ActionEditor
                        action={action}
                        allowActionTypes={allowActionTypes}
                        onDelete={() => {
                          const newTransitions = cloneDeep(transitions);
                          newTransitions[transitionIndex].actions = newTransitions[transitionIndex].actions.filter(
                            (a, ai) => ai !== actionIndex
                          );
                          onUpdate(newTransitions);
                        }}
                        onUpdate={(action) => {
                          const newTransitions = cloneDeep(transitions);
                          newTransitions[transitionIndex].actions[actionIndex] = action;
                          console.log(newTransitions);
                          onUpdate(newTransitions);
                        }}
                        schema={schema}
                        invokedSchema={invokedSchema}
                        serializations={serializations}
                        state={states[stateName]}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div>
                <button
                  style={{ maxWidth: "24px", marginLeft: "4px" }}
                  onMouseDown={() => {
                    console.log("button: onMouseDown Add");
                    const newTransitions = cloneDeep(transitions);
                    if (!Array.isArray(newTransitions[transitionIndex].actions)) {
                      newTransitions[transitionIndex].actions = [];
                    }
                    newTransitions[transitionIndex].actions.push(null);
                    onUpdate(newTransitions);
                  }}
                >
                  +
                </button>
              </div>
            </div>
            {/* TARGET */}
            {allowTarget !== false && (
              <div className="transition__details__target">
                <small>{transitionIndex === 0 ? "Go To State" : ""}</small>
                <select
                  value={transition.target}
                  onChange={(e) => {
                    const newTransitions = cloneDeep(transitions);
                    newTransitions[transitionIndex].target = e.target.value;
                    onUpdate(newTransitions);
                  }}
                >
                  <option value=""></option>
                  <optgroup label="General States">
                    {Object.keys(states ?? {})
                      .filter((stName) => stName !== stateName)
                      .map((stName) => (
                        <option key={stName} value={stName}>
                          {stName}
                        </option>
                      ))}
                  </optgroup>
                  {/* Include SAVE/CANCEL which are always present final states for machines */}
                  <optgroup label="Final States">
                    {[SAVE_STATE, CANCEL_STATE]
                      .filter((stName) => stName !== stateName)
                      .map((stName) => (
                        <option key={stName} value={stName}>
                          {stName}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>
            )}
          </div>
          <div className="transition__row-buttons">
            <div style={{ display: "flex", flexDirection: "column", maxWidth: "30px" }}>
              <button
                disabled={transitionIndex === 0}
                onClick={() => onUpdate(reorderArrayItem(transitionArr, transitionIndex, REORDER_DIRECTION.UP))}
                style={{ maxHeight: "13px" }}
              >
                ⬆︎
              </button>
              <button
                disabled={transitionIndex === transitionArr.length - 1}
                onClick={() => onUpdate(reorderArrayItem(transitionArr, transitionIndex, REORDER_DIRECTION.DOWN))}
                style={{ maxHeight: "13px" }}
              >
                ⬇︎
              </button>
            </div>
            <button onClick={() => onUpdate(removeArrayItem(transitions, transitionIndex))}>❌</button>
          </div>
        </div>
      ))}
    </StyledSpellStateEventTransitionEditor>
  );
};

const StyledSpellStateEventTransitionEditor = styled.div`
  display: flex;
  min-width: 100%;
  flex-direction: column;
  .transition {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    margin-bottom: 0.2em;
  }
  .transition__details {
    display: flex;
    flex-grow: 1;
    & > label {
      display: flex;
      flex-grow: 1;
      flex-direction: column;
      justify-content: center;
      select,
      input {
        // flex-grow: 1;
        // height: 100%;
      }
    }
    .transition__details__target {
      max-width: 110px;
      select {
        max-width: 100%;
      }
    }
    .transition__details__logic-holder {
      // min-width: 100%;
      // width: 100%;
    }
    .transition__details__logic-holder,
    .transition__details__actions,
    .transition__details__target {
      & > small {
        font-size: 10px;
        position: relative;
        bottom: -2px;
      }
    }
  }
  .transition__details__actions {
    margin: 0 4px;
  }
  .transition__details__actions__list {
    display: flex;
    flex-direction: column;
    width: 100%;
    .transition__details__actions__list__item {
      display: flex;
    }
  }
  .transition__row-buttons {
    display: flex;
    align-items: flex-end;
    button {
      max-height: 26px;
      font-size: 7px;
    }
  }
  .add-transition {
    width: 100%;
    display: flex;
    justify-content: flex-start;
  }
  .logic-holder {
    width: 100%;
    min-width: 100%;
  }
`;
