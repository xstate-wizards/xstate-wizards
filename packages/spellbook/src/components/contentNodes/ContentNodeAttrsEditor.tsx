import { $TSFixMe } from "@xstate-wizards/spells";
import { omit } from "lodash";
import React, { useState } from "react";
import styled from "styled-components";
import { VariableInput, VariableInputNew } from "../logic/VariableInput";
import { contentTypeAttrs } from "./consts";

type TContentNodeAttrsEditorProps = {
  attrs: Record<string, any>;
  type: string;
  onUpdate: (attrs: $TSFixMe) => void;
};

export const ContentNodeAttrsEditor: React.FC<TContentNodeAttrsEditorProps> = ({ attrs, type, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const options = contentTypeAttrs[type] ?? [];
  // console.log("ContentNodeAttrsEditor: ", { attrs, type, options });
  // RENDER
  return (
    <div>
      <button onClick={() => setIsDialogOpen(!isDialogOpen)} style={{ fontSize: "11px", letterSpacing: "-0.2px" }}>
        {"{...}"}
      </button>
      {isDialogOpen && (
        <StyledNodeAttrsEditor onClick={() => setIsDialogOpen(false)}>
          <div className="preview" onClick={(e) => e.stopPropagation()}>
            <div className="attrs">
              <table>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(attrs ?? {}).map(([key, value]) => (
                    <tr key={key}>
                      <td className="variable-input__object__key">
                        <div style={{ display: "flex" }}>
                          <button onClick={() => onUpdate(omit(attrs ?? {}, [key]))}>❌</button>
                          <input value={key} disabled />
                        </div>
                      </td>
                      <td>
                        <VariableInput
                          attrKey={key}
                          attrValue={value}
                          onUpdate={(value) => onUpdate({ ...attrs, [key]: value })}
                          options={options}
                        />
                      </td>
                      <td></td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <VariableInputNew
                        existingKeys={Object.keys(attrs ?? {})}
                        onUpdate={(key) => onUpdate({ ...attrs, [key]: null })}
                        options={options}
                      />
                    </td>
                    <td />
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </StyledNodeAttrsEditor>
      )}
    </div>
  );
};

const StyledNodeAttrsEditor = styled.div`
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2em;
  .preview {
    height: auto;
    width: 100%;
    min-width: 600px;
    max-width: 920px;
    margin: 0 auto;
    background: white;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: space-between;
  }
  .attrs {
    padding: 0.5em;
  }
  table {
    width: 100%;
    border: 1px solid #ccc;
  }
  th {
    text-align: left;
    font-size: 12px;
  }
  tr {
    border: 1px solid #ccc;
  }
  td {
    input,
    select {
      width: 100%;
    }
  }
  .attrs__add {
    padding: 0.25em 0.5em;
    display: flex;
    button {
      width: 100%;
    }
  }
  .variable-input__object__key {
    display: flex;
    flex-direction: column;
  }
`;
