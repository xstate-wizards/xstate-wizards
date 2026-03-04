import { $TSFixMe } from "@xstate-wizards/spells";
import { cloneDeep, set } from "lodash";
import React from "react";
import { useEditor } from "../../stores/EditorStore";
import { LocalizedInput } from "../inputs/LocalizedInput";


type TSpellSectionsEditor = {
  sectionsBar: $TSFixMe[];
  states: $TSFixMe;
  onClose: $TSFixMe;
  onUpdate: $TSFixMe;
};

export const SpellSectionsEditor: React.FC<TSpellSectionsEditor> = ({ sectionsBar, states, onClose, onUpdate }) => {
  const editorStore = useEditor();
  const activeLocale = editorStore.activeEditingLocale || "en";
  // RENDER
  return (
    <div className="xw-sb__sections-editor" onClick={() => onClose()}>
      <div className="preview" onClick={(e) => e.stopPropagation()}>
        <div className="attrs">
          <table>
            <thead>
              <tr>
                <th>Section</th>
                <th>State Trigger</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sectionsBar.map(({ name, trigger }, index) => (
                <tr key={trigger}>
                  <td>
                    <LocalizedInput
                      activeLocale={activeLocale}
                      value={name}
                      onChange={(localizedName) => {
                        const updated = cloneDeep(sectionsBar);
                        updated[index] = { ...updated[index], name: localizedName };
                        onUpdate(updated);
                      }}
                    />
                  </td>
                  <td>
                    <select
                      value={trigger}
                      onChange={(e) => onUpdate(set(sectionsBar, `[${index}].trigger`, e.target.value))}
                    >
                      <option value="">---</option>
                      {states.map(({ stateName }) => (
                        <option
                          key={stateName}
                          value={stateName}
                          disabled={sectionsBar.some((sb) => sb.trigger === stateName)}
                        >
                          {stateName}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button onClick={() => onUpdate(sectionsBar.filter((sb) => sb.trigger !== trigger))}>-</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <button
                    onClick={() => {
                      const name = prompt("Section Name");
                      if (name) {
                        onUpdate(sectionsBar.concat({ name: { [activeLocale]: name } }));
                      }
                    }}
                  >
                    + Add Section
                  </button>
                </td>
                <td />
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
