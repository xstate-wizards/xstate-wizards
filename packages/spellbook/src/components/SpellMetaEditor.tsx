import { $TSFixMe, TWizardModelsMap } from "@xstate-wizards/spells";
import React, { useState } from "react";

import { SpellModelsEditor } from "./metaEditors/SpellModelsEditor";
import { SpellSchemaEditor } from "./metaEditors/SpellSchemaEditor";
import { Dialog } from "./overlays/Dialog";

type TSpellMetaEditor = {
  config?: $TSFixMe;
  editor?: $TSFixMe;
  models?: $TSFixMe;
  modelsConfigs: TWizardModelsMap;
  schema?: $TSFixMe;
  spell: $TSFixMe;
  statesList: $TSFixMe[];
  onConfigUpdate?: $TSFixMe;
  onEditorUpdate?: $TSFixMe;
  onModelsUpdate?: $TSFixMe;
  onSchemaUpdate?: $TSFixMe;
};

export const SpellMetaEditor: React.FC<TSpellMetaEditor> = ({
  config,
  editor,
  models,
  modelsConfigs,
  onConfigUpdate,
  onEditorUpdate,
  onModelsUpdate,
  onSchemaUpdate,
  schema,
  spell,
  statesList,
}) => {
  const [isSchemaVisible, setIsSchemaVisible] = useState(false);
  // RENDER
  return (
    <>
      {/* CONFIG */}
      <div className="xw-sb__config-editor">
        <label htmlFor="config-editor-initial">Initial State:</label>
        <select
          id="config-editor-initial"
          value={config.initial}
          onChange={(e) => onConfigUpdate({ ...config, initial: e.target.value })}
        >
          <option value=""></option>
          {/* Include SAVE/CANCEL which are always present final states for machines */}
          {statesList
            .map((st) => st.stateName)
            .sort()
            .map((stateName) => (
              <option key={stateName} value={stateName}>
                {stateName}
              </option>
            ))}
        </select>

        <label htmlFor="config-editor-state">Title:</label>
        <input
          id="config-editor-state"
          type="text"
          value={config.title}
          onChange={(e) => onConfigUpdate({ ...config, title: e.target.value })}
        />
        {/* TODO: allowStartOver */}
        {/* TODO: exitTo */}
        <label>Models & Context Variables: </label>
        <button onClick={() => setIsSchemaVisible(!isSchemaVisible)}>{!isSchemaVisible ? "View" : "Hide"}</button>
        <label>Notes: </label>
        <Dialog trigger={<button>View</button>}>
          <div className="dialog-notes">
            <p>
              <b>Notes for spell "{spell.key}"</b>:
            </p>
            <textarea
              rows={7}
              value={editor.note}
              onChange={(e) => onEditorUpdate({ ...editor, note: e.target.value })}
            />
          </div>
        </Dialog>
      </div>

      {/* MODELS + SCHEMA */}
      {isSchemaVisible && (
        <div className="xw-sb__schema-editor">
          <SpellModelsEditor models={models} modelsConfigs={modelsConfigs} onModelsUpdate={onModelsUpdate} />
          <SpellSchemaEditor schema={schema} onUpdate={onSchemaUpdate} />
        </div>
      )}
    </>
  );
};
