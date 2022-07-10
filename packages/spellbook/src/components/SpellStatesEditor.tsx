import { cloneDeep, omit } from "lodash";
import React from "react";
import styled from "styled-components";
import { SpellStateEditor } from "./SpellStateEditor";
import { isAfter, subMinutes } from "date-fns";
import { SpellStatesEditorMiniMap } from "./miniMap/SpellStatesEditorMiniMap";
import { castStatesToMap } from "../utils";

const HISTORY_DEBOUNCE_MINUTES = 15;

// Helper method to debounce updates to a state history based on time passing
const addStateUpdateBy = (states, stateName, user) => {
  const stateUpdatesBy = cloneDeep(states?.[stateName]?.updatesBy ?? []);
  const newHistoryRecord = {
    id: user?.id,
    name: user?.name,
    email: user?.email,
    at: new Date(),
  };
  // --- if last edit has been within debounce min, replace
  if (
    user &&
    (stateUpdatesBy[0]?.id === user.id || stateUpdatesBy[0]?.email === user.email) &&
    isAfter(new Date(stateUpdatesBy[0]?.at), subMinutes(new Date(), HISTORY_DEBOUNCE_MINUTES))
  ) {
    stateUpdatesBy[0] = newHistoryRecord;
  } else if (user) {
    // --- otherwise prepend
    stateUpdatesBy.unshift(newHistoryRecord);
  }
  // RETURN
  return {
    ...(states ?? {}),
    [stateName]: {
      updatesBy: stateUpdatesBy,
    },
  };
};

export const SpellStatesEditor = ({
  config,
  editor,
  models,
  modelsConfigs,
  serializations,
  schema,
  spells,
  spellsStatic,
  states,
  statesList,
  onConfigUpdate,
  onEditorUpdate,
  onStatesUpdate,
  user,
}) => {
  // SETUP
  const statesObj = castStatesToMap(states);
  // --- handlers: add + invoke
  const addInvokeSpellStateHandler = () => {
    const stateName = prompt("Whats the state name?");
    if (stateName) {
      onStatesUpdate(statesList.concat({ stateName, state: { key: null, onDone: [] } }));
      onEditorUpdate({
        ...editor,
        states: addStateUpdateBy(editor.states, stateName, user),
      });
    }
  };
  // --- handlers: add + general
  const addGeneralStateHandler = () => {
    const stateName = prompt("Whats the state name?");
    if (stateName) {
      onStatesUpdate(statesList.concat({ stateName, state: { content: [], on: {} } }));
      onEditorUpdate({
        ...editor,
        states: addStateUpdateBy(editor.states, stateName, user),
      });
    }
  };
  // --- handlers: update
  const updateStateHandler = (stateName, data) => {
    onStatesUpdate(
      statesList.map((st) => {
        if (st.stateName === stateName) {
          return {
            stateName,
            state: {
              ...st.state,
              ...data,
            },
          };
        }
        return st;
      })
    );
    onEditorUpdate({
      ...editor,
      states: addStateUpdateBy(editor.states, stateName, user),
    });
  };
  const updateEditorStateHandler = (stateName, data) => {
    onEditorUpdate({
      ...editor,
      states: {
        ...editor.states,
        [stateName]: {
          ...editor.states[stateName],
          ...data,
        },
      },
    });
  };
  // --- handlers: delete
  const deleteStateHandler = (stateName: string) => {
    onStatesUpdate(statesList.filter((st) => st.stateName !== stateName));
    onEditorUpdate({
      ...editor,
      states: addStateUpdateBy(editor.states, stateName, user),
    });
  };
  // --- handlers: copy
  const addCopiedStateHandler = () => {
    const stateName = prompt("Whats the state name?");
    const body = prompt("What's the content?");
    if (stateName && body) {
      onStatesUpdate(statesList.concat({ stateName, state: JSON.parse(body) }));
      onEditorUpdate({
        ...editor,
        states: addStateUpdateBy(editor.states, stateName, user),
      });
    }
  };
  // --- handlers: duplicate
  const cloneStateHandler = (copyingStateName) => {
    const stateName = prompt("Whats the state name?");
    if (stateName) {
      onStatesUpdate(statesList.concat({ stateName, state: statesObj[copyingStateName] }));
    }
  };

  // RENDER
  return (
    <StyledSpellStates>
      <SpellStatesEditorMiniMap
        config={config}
        statesList={statesList}
        onConfigUpdate={onConfigUpdate}
        onStatesUpdate={onStatesUpdate}
      />
      <div className="spell-states__view">
        <div className="spell-states__view__list">
          {statesList.map(({ stateName }) => (
            <SpellStateEditor
              key={stateName}
              models={models}
              modelsConfigs={modelsConfigs}
              schema={schema}
              serializations={serializations}
              spells={spells}
              spellsStatic={spellsStatic}
              states={statesObj}
              stateName={stateName}
              onEditorStateUpdate={updateEditorStateHandler}
              onStateUpdate={updateStateHandler}
              onStateDelete={deleteStateHandler}
              editor={editor}
            />
          ))}
        </div>
        <div className="spell-states__view__add">
          <button onClick={addGeneralStateHandler}>+Add State</button>
          <button onClick={addInvokeSpellStateHandler}>+Add Spawning State</button>
          <button onClick={addCopiedStateHandler}>+Add State (Copied JSON 📋)</button>
        </div>
      </div>
    </StyledSpellStates>
  );
};

const StyledSpellStates = styled.div`
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  width: 100%;
  .spell-states__view {
    scroll-behavior: smooth;
    width: 100%;
    height: 100%;
    max-height: calc(100vh - 105px);
    overflow-y: scroll;
  }
  .spell-states__view__list {
    display: flex;
    flex-direction: column;
  }
  .spell-states__view__add {
    position: relative;
    left: -60px;
    padding: 1em 0 4em;
    margin: 0 auto;
    text-align: center;
    max-width: 960px;
    button {
      margin: 0 4px;
    }
  }
  .spell-states__mini-map {
  }
  .content-node--reorder-handle {
    display: flex;
    flex-direction: row;
  }
`;
