import { omit } from "lodash";
import React from "react";

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
    <div className="xw-sb__events-editor">
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
    </div>
  );
};