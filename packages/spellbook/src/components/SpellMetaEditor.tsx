import { $TSFixMe, TWizardModelsMap } from "@xstate-wizards/spells";
import React, { useState } from "react";
import styled from "styled-components";
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
      <StyledSpellConfigEditor>
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
      </StyledSpellConfigEditor>

      {/* MODELS + SCHEMA */}
      {isSchemaVisible && (
        <StyledSpellSchemaEditor>
          <SpellModelsEditor models={models} modelsConfigs={modelsConfigs} onModelsUpdate={onModelsUpdate} />
          <SpellSchemaEditor schema={schema} onUpdate={onSchemaUpdate} />
        </StyledSpellSchemaEditor>
      )}
    </>
  );
};

const StyledSpellSchemaEditor = styled.div`
  position: fixed;
  z-index: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-bottom: 2px solid #f0f0f0;
  padding: 0;
  margin-bottom: 0;
  width: 100vw;
  .schema-section {
    display: flex;
    border-bottom: 2px solid #ccc;
    .schema-section__keys {
      font-size: 14px;
      font-weight: 900;
      margin-right: 4px;
      width: 132px;
      min-width: 132px;
      max-width: 132px;
      height: auto;
      padding: 12px;
      background: #eee;
      .custom-property {
        display: flex;
        justify-content: space-between;
        cursor: pointer;
      }
    }
    label {
      font-size: 13px;
    }
    .schema-section__models-list {
      display: flex;
      width: 100%;
      padding: 8px;
      & > div {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        label {
          display: flex;
        }
      }
    }
    .schema-section__states-editor {
      display: flex;
      width: 100%;
      padding: 12px;
      .schema-section__states-editor__type {
        margin-right: 8px;
      }
      .schema-section__states-editor__default {
        margin-left: 8px;
        input {
          margin-left: 8px;
        }
      }
    }
  }
  .add-property-button {
    cursor: pointer;
  }
`;

const StyledSpellConfigEditor = styled.div`
  display: flex;
  background: white;
  border-bottom: 2px solid #f0f0f0;
  padding: 0.75em 1em;
  margin-bottom: 0;
  label {
    margin: 0 6px;
    font-size: 13px;
    font-weight: 900;
    &:first-of-type {
      margin: 0 6px 0 0;
    }
  }
  input {
    flex-grow: 1;
  }
  .dialog-notes {
    background: white;
    padding: 1em;
    color: #000;
    p {
      margin: 0 0 0.5em;
    }
    textarea {
      width: 100%;
    }
  }
`;
