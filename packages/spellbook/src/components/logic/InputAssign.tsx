import { $TSFixMe } from "@xstate-wizards/spells";
import React from "react";
import styled from "styled-components";
import { JsonLogicBuilder } from "./JsonLogicBuilder";
import { VariableSelector } from "./VariableSelector";

export const InputAssign = ({ contentNodeStack, functions, models, modelsConfigs, onChange, schema, state, value }) => {
  // RENDER
  return (
    <StyledInputAssign>
      <div className="input-assign__type">
        <button style={typeof value !== "string" && value ? { opacity: 0.3 } : {}} onClick={() => onChange("")}>
          Ctx
        </button>
        <button
          style={typeof value === "string" || !value ? { opacity: 0.3 } : {}}
          onClick={() => onChange({ modelName: "", id: "", path: "" })}
        >
          Model
        </button>
      </div>
      <div className="input-assign__editor">
        {typeof value === "string" || !value ? (
          <VariableSelector
            isAssignSelector
            onChange={(assign) => {
              console.debug("InputAssign.VariableSelector", { assign });
              onChange(assign);
            }}
            models={models}
            schema={schema}
            state={state}
            value={value}
          />
        ) : (
          <>
            {/* <label>Model</label> */}
            <select
              value={value.modelName}
              onChange={(e) => {
                console.debug("InputAssign.select", { event: e });
                onChange({ modelName: e.target.value });
              }}
            >
              <option value="">-Model-</option>
              {Object.keys(models).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            <label>
              <b>ID</b>
            </label>
            <JsonLogicBuilder
              contentNodeStack={contentNodeStack}
              functions={functions ?? {}}
              jsonLogic={value?.id}
              models={models}
              schema={schema}
              state={state}
              onUpdate={(jsonLogic) => {
                console.debug("InputAssign.JsonLogicBuilder", { ...value, id: jsonLogic });
                onChange({ ...value, id: jsonLogic });
              }}
            />
            {/* <label>Property</label> */}
            <select
              value={value.path}
              onChange={(e) => {
                console.debug("InputAssign.select", { ...value, path: e.target.value });
                onChange({ ...value, path: e.target.value });
              }}
            >
              <option value="">-Property-</option>
              {Object.keys(
                (Object.entries(modelsConfigs).find(([name]) => name === value?.modelName)?.[1] as $TSFixMe)?.schema
                  ?.properties ?? {}
              ).map((prop) => (
                <option key={prop} value={prop}>
                  {prop}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
    </StyledInputAssign>
  );
};

const StyledInputAssign = styled.div`
  display: flex;
  .input-assign__type {
    display: flex;
    flex-wrap: nowrap;
    button {
      // max-width: 24px;
      font-size: 11px;
    }
  }
  .input-assign__editor {
    display: flex;
    align-items: center;
    margin-left: 8px;
    width: 100%;
    label {
      font-size: 10px;
      font-weight: 700;
      margin-left: 6px;
    }
    & > div,
    & > input,
    & > select {
      flex-grow: 1;
      max-width: 120px;
      margin: 0 4px;
    }
  }
`;
