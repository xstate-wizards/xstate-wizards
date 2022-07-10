import React, { useState } from "react";
import styled from "styled-components";
import { SpellStateContentEditor } from "./stateEditors/SpellStateContentEditor";
import { SpellInvokeStateContextEditor } from "./stateEditors/SpellInvokeStateContextEditor";
import { SpellInvokeStateKeySelector } from "./stateEditors/SpellInvokeStateKeySelector";
import { SpellStateInvokeEditor } from "./stateEditors/SpellStateInvokeEditor";
import { SpellStateEventsEditor } from "./transitions/SpellStateEventsEditor";
import { SpellInvokeStateOnEditor } from "./transitions/SpellInvokeStateOnEditor";
import { SpellStateEntryChooseEditor } from "./transitions/SpellStateEntryChooseEditor";
import { SpellStateHistory } from "./stateEditors/SpellStateHistory";

export const SpellStateEditor = ({
  editor,
  models,
  modelsConfigs,
  schema,
  serializations,
  spells,
  spellsStatic,
  states,
  stateName,
  onEditorStateUpdate,
  onStateDelete,
  onStateUpdate,
}) => {
  const [isDoubleCheckingDelete, setIsDoubleCheckingDelete] = useState(false);
  const currentState = states[stateName];

  // RENDER
  return (
    <StyledSpellState id={stateName}>
      <div className="spell-state">
        <div className="spell-state__header">
          <span>
            <span className="spell-state__header__tag">{currentState?.key !== undefined ? "STATE ↔︎" : "STATE ◗"}</span>{" "}
            {stateName}
          </span>
          <div className="spell-state__header__buttons">
            <span>
              <button onClick={() => navigator.clipboard.writeText(JSON.stringify(currentState))}>📋 Copy</button>
            </span>
            <span>
              <button
                onClick={() => {
                  if (!isDoubleCheckingDelete) {
                    setIsDoubleCheckingDelete(true);
                  } else {
                    onStateDelete(stateName);
                  }
                }}
              >
                ❌ {isDoubleCheckingDelete ? "Are you sure?" : ""}
              </button>
            </span>
          </div>
        </div>
        <div className="spell-state__body">
          {/* ENTRY */}
          <SpellStateEntryChooseEditor
            onUpdate={(data) => onStateUpdate(stateName, data)}
            schema={schema}
            serializations={serializations}
            stateName={stateName}
            state={currentState}
            states={states}
          />
          {/* KEY/CONTENT */}
          {currentState?.key !== undefined ? (
            <>
              {/* key */}
              <SpellInvokeStateKeySelector
                onUpdate={(data) => onStateUpdate(stateName, data)}
                state={currentState}
                spells={spells}
                spellsStatic={spellsStatic}
              />
              {/* context */}
              <SpellInvokeStateContextEditor
                onUpdate={(data) => onStateUpdate(stateName, data)}
                schema={schema}
                serializations={serializations}
                spells={spells}
                spellsStatic={spellsStatic}
                state={currentState}
                states={states}
              />
            </>
          ) : (
            <>
              {/* content */}
              <SpellStateContentEditor
                models={models}
                modelsConfigs={modelsConfigs}
                onUpdate={(data) => onStateUpdate(stateName, data)}
                schema={schema}
                serializations={serializations}
                state={currentState}
                stateName={stateName}
              />
              {/* invoke (for async functions like data fetches) */}
              <SpellStateInvokeEditor
                onUpdate={(data) => onStateUpdate(stateName, data)}
                schema={schema}
                serializations={serializations}
                state={currentState}
                stateName={stateName}
              />
            </>
          )}
          {/* EVENTS */}
          <div className="spell-state__body__events">
            <small>💥 Event Listeners (aka Transitions)</small>
          </div>
          {/* onDone/onError */}
          {currentState?.key !== undefined ? (
            <SpellInvokeStateOnEditor
              onUpdate={(data) => onStateUpdate(stateName, data)}
              schema={schema}
              serializations={serializations}
              spells={spells}
              spellsStatic={spellsStatic}
              stateName={stateName}
              state={currentState}
              states={states}
            />
          ) : null}
          {/* on: ... */}
          <SpellStateEventsEditor
            onUpdate={(data) => onStateUpdate(stateName, data)}
            schema={schema}
            serializations={serializations}
            stateName={stateName}
            state={currentState}
            states={states}
          />
        </div>
      </div>
      <SpellStateHistory
        editor={editor}
        stateName={stateName}
        onUpdate={({ note }) => onEditorStateUpdate(stateName, { note })}
      />
    </StyledSpellState>
  );
};

const StyledSpellState = styled.div`
  display: flex;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  .spell-state {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: white;
    border-radius: 4px;
    overflow: hidden;
    margin: 1em 0 1.5em;
    box-shadow: 0 4px 16px 0 rgba(228, 228, 230, 1), 0 4px 16px 0 rgba(228, 228, 230, 1),
      0 4px 16px 0 rgba(228, 228, 230, 1), 0 2px 4px 0 rgba(228, 228, 230, 1);
    border: 1px solid #ccc;
  }
  .spell-state__header {
    font-size: 16px;
    font-weight: 900;
    padding: 0.25em 1em;
    background: #000;
    color: white;
    display: flex;
    justify-content: space-between;
    .spell-state__header__tag {
      opacity: 0.5;
    }
    .spell-state__header__buttons {
      button {
        margin-left: 6px;
      }
    }
  }
  .spell-state__body {
    overflow-y: scroll;
  }
  .spell-state__body__events {
    padding: 0 1em;
    background: #e5e5e5;
    overflow-x: scroll;
    small {
      font-size: 10px;
      font-weight: 900;
      color: #999;
    }
  }
`;
