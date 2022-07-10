import { orderBy } from "lodash";
import React from "react";
import styled from "styled-components";
import { $TSFixMe, TPrepparedSpellMapping, TSpellInstructions } from "@xstate-wizards/spells";
import { searchParamSet, SPELLBOOK_SEARCH_PARAMS } from "../../utils";

type TSpellInvokeStateKeySelectorProps = {
  onUpdate: (data: any) => void;
  spells: {
    [id: number]: TSpellInstructions;
  };
  spellsStatic: {
    [key: string]: TSpellInstructions | TPrepparedSpellMapping;
  };
  state: $TSFixMe;
};

export const SpellInvokeStateKeySelector: React.FC<TSpellInvokeStateKeySelectorProps> = ({
  onUpdate,
  spells,
  spellsStatic,
  state,
}) => {
  const openSubMachineClick = () => {
    // open this location in a new tab w/ replaced spellKey param to autoselect
    const url = searchParamSet(SPELLBOOK_SEARCH_PARAMS.SPELL_KEY, state.key);
    window.open(url.href, "_blank");
  };

  return (
    <StyledSpellInvokeStateKeySelector>
      <div className="spell-state__content-nodes">
        <div className="select-label">
          <small>Spawn: </small>
        </div>
        <div>
          <button disabled={!state.key} onClick={openSubMachineClick}>
            [⬈]
          </button>
        </div>
        <div className="select-key">
          <select
            value={state.key}
            onChange={(e) => {
              onUpdate({ key: e.target.value });
            }}
          >
            <option value=""></option>
            <optgroup label="Spells Editable (aka State Machines)">
              {orderBy(
                Object.values(spells).filter((s) => s.isActive),
                ["key"]
              ).map(({ key }) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </optgroup>
            <optgroup label="Spells Coded (aka State Machines)">
              {Object.keys(spellsStatic)
                .sort()
                .map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
            </optgroup>
          </select>
        </div>
      </div>
    </StyledSpellInvokeStateKeySelector>
  );
};

const StyledSpellInvokeStateKeySelector = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px sold gray;
  .spell-state__content-nodes {
    padding: 0.5em 1em;
    display: flex;
    .select-label {
      width: 80px;
      min-width: 80px;
      max-width: 80px;
    }
    .select-key {
      width: 100%;
      display: flex;
      & > div {
        width: 100%;
      }
    }
    select {
      width: 100%;
    }
  }
  .select-warning {
    font-size: 10px;
    width: 320px;
  }
`;
