import React from "react";
import styled from "styled-components";
import { ActionTypes } from "xstate";
import { $TSFixMe, TWizardSerializations } from "@xstate-wizards/spells";
import { SpellStateEventTransitionsEditor } from "./SpellStateEventTransitionsEditor";

type TSpellStateEntryChooseEditorProps = {
  onUpdate: (data: any) => void;
  serializations: TWizardSerializations;
  schema: $TSFixMe;
  state: $TSFixMe;
  stateName: string;
  states: $TSFixMe;
};

export const SpellStateEntryChooseEditor: React.FC<TSpellStateEntryChooseEditorProps> = ({
  onUpdate,
  schema,
  serializations,
  state,
  stateName,
  states,
}) => {
  return (
    <StyledSpellStateEntryChooseEditor>
      <div>
        <div className="on-event">
          <SpellStateEventTransitionsEditor
            allowTarget={false}
            onUpdate={(conds) => {
              const entryAction = { entry: { type: ActionTypes.Choose, conds } };
              console.log("SpellStateEntryChooseEditor: onUpdate", entryAction);
              onUpdate(entryAction);
            }}
            schema={schema}
            serializations={serializations}
            stateName={stateName}
            states={states}
            transitions={state.entry?.conds}
          />
        </div>
      </div>
      {!state.entry?.conds?.length && (
        <div className="entry__add">
          <div>
            <button
              onClick={() =>
                onUpdate({
                  entry: {
                    type: ActionTypes.Choose,
                    conds: (state.entry?.conds ?? []).concat({}),
                  },
                })
              }
            >
              + On entry...
            </button>
          </div>
        </div>
      )}
    </StyledSpellStateEntryChooseEditor>
  );
};

const StyledSpellStateEntryChooseEditor = styled.div`
  padding: 0 1em 0.5em;
  background: #f0f0f0;
  overflow-x: scroll;
  .on-event {
    display: flex;
    padding-bottom: 0.2em;
    margin-bottom: 0.2em;
    .on-event__name {
      min-width: 80px;
      overflow-x: hidden;
      text-overflow: ellipsis;
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
  .entry__add button {
    font-size: 12px;
  }
`;
