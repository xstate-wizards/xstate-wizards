import React, { useState } from "react";

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
    <div className="xw-sb__state" id={stateName}>
      <div className="xw-sb__spell-state">
        <div className="xw-sb__spell-state__header">
          <span>
            <span className="xw-sb__spell-state__header__tag">{currentState?.key !== undefined ? "STATE ↔︎" : "STATE ◗"}</span>{" "}
            {stateName}
          </span>
          <div className="xw-sb__spell-state__header__buttons">
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
        <div className="xw-sb__spell-state__body">
          {/* ENTRY */}
          <SpellStateEntryChooseEditor
            onUpdate={(data) => {
              console.debug("SpellStateEditor.onUpdate: SpellStateEntryChooseEditor", data);
              onStateUpdate(stateName, data);
            }}
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
                onUpdate={(data) => {
                  console.debug("SpellStateEditor.onUpdate: SpellInvokeStateKeySelector", data);
                  onStateUpdate(stateName, data);
                }}
                state={currentState}
                spells={spells}
                spellsStatic={spellsStatic}
              />
              {/* context */}
              <SpellInvokeStateContextEditor
                onUpdate={(data) => {
                  console.debug("SpellStateEditor.onUpdate: SpellInvokeStateContextEditor", data);
                  onStateUpdate(stateName, data);
                }}
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
                onUpdate={(data) => {
                  console.debug("SpellStateEditor.onUpdate: SpellStateContentEditor", data);
                  onStateUpdate(stateName, data);
                }}
                schema={schema}
                serializations={serializations}
                state={currentState}
                stateName={stateName}
              />
              {/* invoke (for async functions like data fetches) */}
              <SpellStateInvokeEditor
                onUpdate={(data) => {
                  console.debug("SpellStateEditor.onUpdate: SpellStateInvokeEditor", data);
                  onStateUpdate(stateName, data);
                }}
                schema={schema}
                serializations={serializations}
                state={currentState}
                stateName={stateName}
              />
            </>
          )}
          {/* EVENTS */}
          <div className="xw-sb__spell-state__body__events">
            <small>💥 Event Listeners (aka Transitions)</small>
          </div>
          {/* onDone/onError */}
          {currentState?.key !== undefined ? (
            <SpellInvokeStateOnEditor
              onUpdate={(data) => {
                console.debug("SpellStateEditor.onUpdate: SpellInvokeStateOnEditor", data);
                onStateUpdate(stateName, data);
              }}
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
            onUpdate={(data) => {
              console.debug("SpellStateEditor.onUpdate: SpellStateEventsEditor", data);
              onStateUpdate(stateName, data);
            }}
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
    </div>
  );
};
