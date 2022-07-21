import { omit } from "lodash";
import React from "react";
import styled from "styled-components";
import { VariableInput, VariableInputNew } from "../logic/VariableInput";
import { Dialog } from "../overlays/Dialog";
import { JsonLogicBuilder } from "../logic/JsonLogicBuilder";
import { $TSFixMe } from "@xstate-wizards/spells";

export const ContentNodeEventEditor = ({
  contentNodeStack,
  event,
  models,
  schema,
  serializations,
  state,
  onChange,
}) => {
  return (
    <Dialog trigger={<button onClick={console.log}>💥 Event: {event?.type}</button>}>
      <StyledContentNodeEventEditor>
        <table>
          <tbody>
            <tr>
              <td className="event-label">
                <div>
                  <small>Event:</small>
                </div>
              </td>
              <td>
                <select
                  value={event?.type}
                  onChange={(e) => onChange({ type: e.target.value })}
                  style={{ display: "flex", maxWidth: "120px" }}
                >
                  <option value=""></option>
                  {Object.keys(state.on).map((on) => (
                    <option key={on} value={on}>
                      {on}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td className="event-label">
                <div>
                  <small>Attach Data:</small>
                </div>
              </td>
              <td className="event-data__editor">
                <div>
                  {Object.entries(event?.data ?? {}).map(([key, value]: $TSFixMe) => (
                    <div key={key} style={{ display: "flex" }}>
                      <button onClick={() => onChange({ ...event, data: omit(event?.data ?? {}, [key]) })}>❌</button>
                      <div>
                        <input value={key} disabled />
                      </div>
                      {value?.type === "jsonLogic" ? (
                        <JsonLogicBuilder
                          contentNodeStack={contentNodeStack}
                          functions={serializations?.functions ?? {}}
                          jsonLogic={value.jsonLogic}
                          models={models}
                          onUpdate={(jsonLogic) =>
                            onChange({
                              ...event,
                              data: { ...(event?.data ?? {}), [key]: { type: "jsonLogic", jsonLogic } },
                            })
                          }
                          schema={schema}
                          state={state}
                        />
                      ) : (
                        <VariableInput
                          attrKey={key}
                          attrValue={value}
                          options={[]}
                          onUpdate={(value) => onChange({ ...event, data: { ...(event?.data ?? {}), [key]: value } })}
                        />
                      )}
                    </div>
                  ))}
                  <hr />
                  <div className="event-data__editor__buttons">
                    <VariableInputNew
                      allowLogic
                      existingKeys={Object.keys(event?.data ?? {})}
                      options={[]}
                      onUpdate={(key, value) => onChange({ ...event, data: { ...(event?.data ?? {}), [key]: value } })}
                    />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </StyledContentNodeEventEditor>
    </Dialog>
  );
};

const StyledContentNodeEventEditor = styled.div`
  padding: 0.5em;
  .event-label {
    min-width: 120px;
    max-width: 120px;
    width: 120px;
  }
  table {
    width: 100%;
  }
  tr {
    display: flex;
    padding-bottom: 6px;
    margin-bottom: 6px;
    border-bottom: 2px solid #ccc;
    td:first-of-type {
      display: flex;
      justify-content: flex-start;
    }
  }
  .event-data__editor {
    flex-grow: 1;
    div {
      width: 100%;
    }
    input {
      width: 100%;
    }
    hr {
      margin: 4px 0;
    }
    .event-data__editor__buttons {
      display: flex;
    }
  }
`;
