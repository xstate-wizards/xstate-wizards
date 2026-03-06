import { $TSFixMe } from "@xstate-wizards/spells";
import { omit } from "lodash";
import React, { useState } from "react";
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
    <div className="content-node__attrs-trigger">
      <button onClick={() => setIsDialogOpen(!isDialogOpen)} style={{ fontSize: "11px", letterSpacing: "-0.2px" }}>
        {"{...}"}
      </button>
      {isDialogOpen && (
        <div className="xw-sb__attrs-editor" onClick={() => setIsDialogOpen(false)}>
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
        </div>
      )}
    </div>
  );
};