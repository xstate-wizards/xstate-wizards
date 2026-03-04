import { $TSFixMe } from "@xstate-wizards/spells";
import { set } from "lodash";
import React from "react";


type TSpellSectionsEditor = {
  sectionsBar: $TSFixMe[];
  states: $TSFixMe;
  onClose: $TSFixMe;
  onUpdate: $TSFixMe;
};

export const SpellSectionsEditor: React.FC<TSpellSectionsEditor> = ({ sectionsBar, states, onClose, onUpdate }) => {
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
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => onUpdate(set(sectionsBar, `[${index}].name`, e.target.value))}
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
                      if (name && !sectionsBar.some((sb) => sb.name === name)) {
                        onUpdate(sectionsBar.concat({ name }));
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
