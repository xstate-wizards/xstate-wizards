import { $TSFixMe, TWizardModelsMap } from "@xstate-wizards/spells";
import React, { useState } from "react";

import { useEditor } from "../stores/EditorStore";
import { LocalizedInput } from "./inputs/LocalizedInput";
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
  const editorStore = useEditor();
  const [isSchemaVisible, setIsSchemaVisible] = useState(false);
  const activeLocale = editorStore.activeEditingLocale || config?.locales?.[0] || "en";
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

        <label htmlFor="config-editor-title">Title:</label>
        <LocalizedInput
          activeLocale={activeLocale}
          value={config.title}
          placeholder="Spell Title"
          onChange={(title) => onConfigUpdate({ ...config, title })}
        />

        <label>Locales:</label>
        <div className="xw-sb__locale-editor">
          <select
            value={editorStore.activeEditingLocale || config?.locales?.[0] || ""}
            onChange={(e) => {
              if (e.target.value === "__add__") {
                const code = prompt("Language code (e.g. en, es, fr):");
                if (code && !(config?.locales ?? []).includes(code)) {
                  const newLocales = [...(config?.locales ?? []), code];
                  onConfigUpdate({ ...config, locales: newLocales });
                  editorStore.setActiveEditingLocale(code);
                }
              } else if (e.target.value !== "") {
                editorStore.setActiveEditingLocale(e.target.value);
              }
            }}
          >
            {!(config?.locales ?? []).length && <option value="">---</option>}
            {(config?.locales ?? []).map((loc: string) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
            <option value="__add__">+ Add Locale</option>
          </select>
        </div>
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
