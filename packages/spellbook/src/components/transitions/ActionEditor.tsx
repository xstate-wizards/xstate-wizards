import { cloneDeep, omit } from "lodash";
import React from "react";
import styled from "styled-components";
import { ActionTypes } from "xstate";
import { $TSFixMe } from "@xstate-wizards/spells";
import { JsonLogicBuilder } from "../logic/JsonLogicBuilder";
import { VariableSelector } from "../logic/VariableSelector";

type TActionEditor = {
  action?: string | $TSFixMe;
  allowActionTypes?: string[];
  onDelete: $TSFixMe;
  onUpdate: $TSFixMe;
  schema: $TSFixMe;
  invokedSchema: $TSFixMe;
  serializations?: $TSFixMe;
  state?: $TSFixMe;
};

export const ActionEditor: React.FC<TActionEditor> = ({
  action,
  allowActionTypes,
  onUpdate,
  onDelete,
  schema,
  invokedSchema,
  serializations,
  state,
}) => {
  return (
    <StyledActionEditor>
      {/* DELETE */}
      <button
        // interestingly onClick causes the add btn to also fire onClick, so i had to add a key
        key="delete-action-btn"
        style={{ maxWidth: "24px", marginLeft: "4px" }}
        onMouseDown={onDelete}
      >
        ❌
      </button>
      {/* TYPE */}
      <div>
        <select
          value={(() => {
            if (typeof action === "string") return "serialized";
            if (action?.type === ActionTypes.Send) return "send";
            if (action?.type === ActionTypes.Assign) return "assign";
            return "";
          })()}
          onChange={(e) => {
            if (e.target.value === "serialized") {
              onUpdate("");
            } else if (e.target.value === "send") {
              onUpdate({
                type: ActionTypes.Send,
                event: { type: "" },
                id: "",
              });
            } else if (e.target.value === "assign") {
              onUpdate({
                type: ActionTypes.Assign,
                // assignment: {}, // XState (ctx, ev) => ... function
                // HACK: we're adding this obj here so at runtime we prep actual assingment methods
                assignmentSerialization: {
                  assignKey: "",
                  jsonLogic: {},
                },
              });
            } else if (e.target.value === "choose") {
              // TODO: I don't think we really need this. It's only needed for the entry[] really
            }
          }}
        >
          <option value=""></option>
          <optgroup label="Base">
            <option value="assign">assign</option>
            {/* <option value="choose">choose</option> */}
            <option value="send">send</option>
          </optgroup>
          <optgroup label="Other">
            <option value="serialized">serialized</option>
          </optgroup>
        </select>
      </div>

      {/* IF OBJ --- SEND */}
      {action && typeof action === "object" && action?.type === ActionTypes.Send && (
        <select
          value={action?.event?.type}
          onChange={(e) => {
            onUpdate({
              type: ActionTypes.Send,
              event: { type: e.target.value },
              id: e.target.value,
            });
          }}
        >
          <option value=""></option>
          {Object.keys(state.on ?? {})
            .sort()
            .map((transitionName) => (
              <option key={transitionName} value={transitionName}>
                {transitionName}
              </option>
            ))}
        </select>
      )}

      {/* IF OBJ --- ASSIGN */}
      {action && typeof action === "object" && action?.type === ActionTypes.Assign && (
        <>
          <div className="assign-key">
            <div>
              <VariableSelector
                isAssignSelector
                onChange={(assign) => {
                  onUpdate({
                    type: ActionTypes.Assign,
                    assignmentSerialization: {
                      assignKey: assign,
                      jsonLogic: action?.assignmentSerialization?.jsonLogic,
                    },
                  });
                }}
                schema={schema}
                invokedSchema={invokedSchema}
                state={state}
                value={action?.assignmentSerialization?.assignKey}
              />
            </div>
          </div>
          <JsonLogicBuilder
            functions={serializations?.functions ?? {}}
            jsonLogic={action?.assignmentSerialization?.jsonLogic}
            onUpdate={(jsonLogic) => {
              console.log("JsonLogicBuilder: onUpdate", jsonLogic);
              onUpdate({
                type: ActionTypes.Assign,
                assignmentSerialization: {
                  assignKey: action?.assignmentSerialization?.assignKey,
                  jsonLogic,
                },
              });
            }}
            schema={schema}
            invokedSchema={invokedSchema}
            state={state}
          />
        </>
      )}

      {/* IF STRING --- REFERENCE */}
      {typeof action === "string" && (
        <select value={action} onChange={(e) => onUpdate(e.target.value)}>
          <option value=""></option>
          <optgroup label="Serialized">
            {Object.keys(omit(serializations.actions ?? {}, ["mergeEventDataResources", "initializeResourceEditor"])) //TODO: come up with a way to doing this
              .filter((actionName) => !actionName.startsWith("Models."))
              .sort()
              .map((actionName) => (
                <option key={actionName} value={actionName}>
                  {actionName}
                </option>
              ))}
          </optgroup>
          <optgroup label="Common">
            <option value="mergeEventDataResources">mergeEventDataResources</option>
            <option value="initializeResourceEditor">initializeResourceEditor</option>
          </optgroup>
          <optgroup label="Models">
            {Object.keys(omit(serializations.actions ?? {}, ["mergeEventDataResources", "initializeResourceEditor"])) //TODO: come up with a way to avoid doing this
              .filter((actionName) => actionName.startsWith("Models."))
              .sort()
              .map((actionName) => (
                <option key={actionName} value={actionName}>
                  {actionName}
                </option>
              ))}
          </optgroup>
        </select>
      )}
    </StyledActionEditor>
  );
};

const StyledActionEditor = styled.div`
  display: flex;
`;
