import { $TSFixMe } from "@xstate-wizards/spells";
import { set } from "lodash";
import React from "react";
import styled from "styled-components";

type TSpellSectionsEditor = {
  sectionsBar: $TSFixMe[];
  states: $TSFixMe;
  onClose: $TSFixMe;
  onUpdate: $TSFixMe;
};

export const SpellSectionsEditor: React.FC<TSpellSectionsEditor> = ({ sectionsBar, states, onClose, onUpdate }) => {
  // RENDER
  return (
    <StyledNodeAttrsEditor onClick={() => onClose()}>
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
    </StyledNodeAttrsEditor>
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
    max-width: 400px;
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
`;
