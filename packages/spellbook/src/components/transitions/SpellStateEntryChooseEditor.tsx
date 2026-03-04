import React from "react";

import { $TSFixMe, TWizardSerializations } from "@xstate-wizards/spells";

// v5: ActionTypes removed from xstate. Define locally for spellbook editor UI.
const ActionTypes = {
  Choose: "xstate.choose" as const,
};
import { SpellStateEventTransitionsEditor } from "./SpellStateEventTransitionsEditor";

type TSpellStateEntryChooseEditorProps = {
  onUpdate: (data: any) => void;
  serializations: TWizardSerializations;
  schema: $TSFixMe;
  state: $TSFixMe;
  stateName: string;
  states: $TSFixMe;
};

export const SpellStateEntryChooseEditor: React.FC<TSpellStateEntryChooseEditorProps> = ({
  onUpdate,
  schema,
  serializations,
  state,
  stateName,
  states,
}) => {
  return (
    <div className="xw-sb__entry-choose">
      <div>
        <div className="on-event">
          <SpellStateEventTransitionsEditor
            allowTarget={false}
            onUpdate={(conds) => {
              const entryAction = { entry: { type: ActionTypes.Choose, conds } };
              console.log("SpellStateEntryChooseEditor: onUpdate", entryAction);
              onUpdate(entryAction);
            }}
            schema={schema}
            serializations={serializations}
            stateName={stateName}
            states={states}
            transitions={state.entry?.conds}
          />
        </div>
      </div>
      {!state.entry?.conds?.length && (
        <div className="entry__add">
          <div>
            <button
              onClick={() =>
                onUpdate({
                  entry: {
                    type: ActionTypes.Choose,
                    conds: (state.entry?.conds ?? []).concat({}),
                  },
                })
              }
            >
              + On entry...
            </button>
          </div>
        </div>
      )}
    </div>
  );
};