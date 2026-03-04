import { orderBy } from "lodash";
import React from "react";

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
    <div className="xw-sb__invoke-key">
      <div className="xw-sb__spell-state__content-nodes">
        <div className="xw-sb__select-label">
          <small>Spawn: </small>
        </div>
        <div>
          <button disabled={!state.key} onClick={openSubMachineClick}>
            [⬈]
          </button>
        </div>
        <div className="xw-sb__select-key">
          <select
            value={state.key}
            onChange={(e) => {
              onUpdate({ key: e.target.value });
            }}
          >
            <option value=""></option>
            <optgroup label="Spells Editable (aka State Machines)">
              {orderBy(
                Object.values(spells ?? {}).filter((s) => s.isActive),
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
    </div>
  );
};