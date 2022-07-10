import { difference, omit } from "lodash";
import React from "react";
import styled from "styled-components";
import { $TSFixMe } from "@xstate-wizards/spells";
import { removeArrayItem, updateArrayItem } from "../../utils";

type TVariableInputNewProps = {
  allowLogic?: boolean;
  existingKeys: $TSFixMe;
  options: $TSFixMe;
  onUpdate: $TSFixMe;
};

export const VariableInputNew: React.FC<TVariableInputNewProps> = ({ allowLogic, existingKeys, options, onUpdate }) => {
  return (
    <select
      onChange={(e) => {
        if (e.target.value === "--- Create New Property ---") {
          const newKey = prompt("Property Name: ");
          if (newKey) onUpdate(newKey, null);
          e.target.value = "";
        } else if (e.target.value === "--- Create New Logic ---") {
          const newKey = prompt("Property Name for Logic: ");
          if (newKey) onUpdate(newKey, { type: "jsonLogic", jsonLogic: { "": [] } });
          e.target.value = "";
        } else {
          onUpdate(e.target.value);
        }
      }}
    >
      <option value="">---</option>
      {difference(
        options?.map((attr) => attr.key),
        existingKeys ?? []
      )
        .sort()
        .map((key: string) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      <option value="--- Create New Property ---">--- Create New Property ---</option>
      {allowLogic && <option value="--- Create New Logic ---">--- Create New Logic ---</option>}
    </select>
  );
};

export const VariableInput = ({ attrKey, attrValue, onUpdate, options }) => {
  // console.log("VariableInput: ", { attrKey, attrValue, onUpdate, options });
  const option = options?.find((config) => config.key === attrKey);
  return (
    <StyledVariableInput>
      {/* IF DEFINED */}
      {typeof attrValue === "string" || option?.type === "text" ? (
        <input type="text" value={attrValue} onChange={(e) => onUpdate(e.target.value)} />
      ) : null}
      {typeof attrValue === "number" || option?.type === "number" ? (
        <input type="number" value={attrValue} onChange={(e) => onUpdate(Number(e.target.value))} />
      ) : null}
      {typeof attrValue === "boolean" || option?.type === "boolean" ? (
        <input type="checkbox" checked={attrValue} onChange={(e) => onUpdate(e.target.checked)} />
      ) : null}
      {attrValue && typeof attrValue === "object" && !Array.isArray(attrValue) ? (
        <div className="variable-input__object">
          {Object.keys(attrValue)
            .sort()
            .map((attrValueObjKey) => (
              <div key={attrValueObjKey} className="variable-input__object__key-value">
                <div className="variable-input__object__key-value__key">
                  <button onClick={() => onUpdate(omit(attrValue ?? {}, [attrValueObjKey]))}>❌</button>
                  <input value={attrValueObjKey} disabled />
                </div>
                <VariableInput
                  attrKey={attrValueObjKey}
                  attrValue={attrValue[attrValueObjKey]}
                  onUpdate={(value) => onUpdate({ ...attrValue, [attrValueObjKey]: value })}
                  options={[]}
                />
              </div>
            ))}
          <VariableInputNew
            existingKeys={Object.keys(attrValue ?? {})}
            onUpdate={(key) => onUpdate({ ...attrValue, [key]: null })}
            options={options}
          />
        </div>
      ) : null}
      {attrValue && typeof attrValue === "object" && Array.isArray(attrValue) ? (
        <div className="variable-input__array">
          {attrValue.map((item, itemIndex) => (
            <div key={itemIndex} className="variable-input__array__item">
              <div className="variable-input__array__item__actions">
                <button onClick={() => onUpdate(removeArrayItem(attrValue, itemIndex))}>❌</button>
                <button onClick={() => onUpdate(attrValue.concat(item))}>↩️</button>
              </div>
              <div>
                <VariableInput
                  attrKey={itemIndex}
                  attrValue={item}
                  onUpdate={(value) => onUpdate(updateArrayItem(attrValue, value, itemIndex))}
                  options={[]}
                />
              </div>
            </div>
          ))}
          <button onClick={() => onUpdate(attrValue.concat(null))}>+</button>
        </div>
      ) : null}

      {/* IF NOT DEFINED */}
      {attrValue == null && !option && (
        <>
          <small onClick={() => onUpdate("")}>+ Str</small>
          <small onClick={() => onUpdate(0)}>+ Num</small>
          <small onClick={() => onUpdate(false)}>+ Bool</small>
          <small onClick={() => onUpdate({})}>+ Obj</small>
          <small onClick={() => onUpdate([])}>+ Arr</small>
        </>
      )}
    </StyledVariableInput>
  );
};

const StyledVariableInput = styled.div`
  .variable-input__object {
    display: flex;
    flex-direction: column;
  }
  .variable-input__object__key-value {
    display: flex;
    width: 100%;
    & > div.variable-input__object__key-value__key {
      display: flex;
      width: 80px;
      min-width: 80px;
      max-width: 80px;
    }
    & > *:not(div.variable-input__object__key-value__key) {
      width: 100%;
      input {
        width: 100%;
      }
    }
  }
  .variable-input__array__item {
    display: flex;
    margin-bottom: 8px;
    padding: 4px;
    border-left: 2px solid #ccc;
    & > div:not(.variable-input__array__item__actions) {
      flex-grow: 1;
    }
    .variable-input__array__item__actions {
      width: 32px;
      margin-right: 4px;
      display: flex;
      flex-direction: column;
    }
  }
`;
