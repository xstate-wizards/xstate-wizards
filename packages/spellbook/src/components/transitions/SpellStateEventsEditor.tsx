import { omit } from "lodash";
import React from "react";
import styled from "styled-components";
import { $TSFixMe, TWizardSerializations } from "@xstate-wizards/spells";
import { SpellStateEventTransitionsEditor } from "./SpellStateEventTransitionsEditor";

type TSpellStateEventsEditorProps = {
  onUpdate: (data: any) => void;
  schema: $TSFixMe;
  serializations: TWizardSerializations;
  state: $TSFixMe;
  stateName: string;
  states: $TSFixMe;
};

export const SpellStateEventsEditor: React.FC<TSpellStateEventsEditorProps> = ({
  onUpdate,
  schema,
  serializations,
  state,
  stateName,
  states,
}) => {
  return (
    <StyledSpellStateEventsEditor>
      <div>
        {Object.keys(state.on ?? {})
          .sort()
          .map((eventName) => (
            <div key={eventName} className="on-event">
              <div className="on-event__name">
                <div title={eventName}>{eventName}</div>
                <div>
                  <button
                    onClick={() =>
                      onUpdate({ on: { ...state.on, [eventName]: state.on[eventName].concat({ target: "" }) } })
                    }
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="on-event__transitions">
                <SpellStateEventTransitionsEditor
                  onUpdate={(transitions) => {
                    console.log("SpellStateEventsEditor: onUpdate", { transitions });
                    onUpdate({ on: { ...state.on, [eventName]: transitions ?? [] } });
                  }}
                  schema={schema}
                  serializations={serializations}
                  stateName={stateName}
                  states={states}
                  transitions={state.on[eventName]}
                />
              </div>
              {Object.keys(state.on[eventName] ?? {}).length === 0 ? (
                <div>
                  <button onClick={() => onUpdate({ on: omit(state.on, [eventName]) })}>❌</button>
                </div>
              ) : null}
            </div>
          ))}
      </div>
      <div>
        <button
          onClick={() => {
            const newEventName = prompt("Whats the event name?");
            if (newEventName) onUpdate({ on: { ...state.on, [newEventName]: [] } });
          }}
        >
          + Event Listener
        </button>
      </div>
    </StyledSpellStateEventsEditor>
  );
};

const StyledSpellStateEventsEditor = styled.div`
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
`;
