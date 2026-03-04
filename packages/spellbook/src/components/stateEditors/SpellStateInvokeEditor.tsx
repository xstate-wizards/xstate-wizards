import React from "react";

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
    <div className="xw-sb__state-invoke">
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
    </div>
  );
};