import {
  $TSFixMe,
  TPrepparedSpellMapping,
  TSpellInstructions,
  TWizardModelsMap,
  TWizardSerializations,
} from "@xstate-wizards/spells";
import { format } from "date-fns";
import React, { useState } from "react";
import styled from "styled-components";
import { useEditor } from "../stores/EditorStore";
import { usePreview } from "../stores/PreviewStore";
import { useSidebar } from "../stores/SidebarStore";
import { castStatesToList, castStatesToMap, getPreviewUrl } from "../utils";
import { SpellMetaEditor } from "./SpellMetaEditor";
import { SpellStatesEditor } from "./SpellStatesEditor";

type TSpellEditorProps = {
  models: TWizardModelsMap;
  onActive: $TSFixMe;
  onPublish: $TSFixMe;
  serializations: TWizardSerializations;
  spell: TSpellInstructions;
  spells: {
    [id: number]: TSpellInstructions;
  };
  spellsStatic: {
    [key: string]: TSpellInstructions | TPrepparedSpellMapping;
  };
  user?: $TSFixMe;
};

export const SpellEditor: React.FC<TSpellEditorProps> = (props) => {
  const editorStore = useEditor();
  const sidebarStore = useSidebar();
  const previewStore = usePreview();
  const [isDirty, setIsDirty] = useState(false);
  const [config, setConfig] = useState(props.spell.config ?? {});
  const [editor, setEditor] = useState(props.spell.editor ?? {});
  const [models, setModels] = useState(props.spell.models ?? {});
  const [schema, setSchema] = useState(props.spell.schema ?? {});
  const [states, setStates] = useState(props.spell.states);
  const publishHandler = ({ increment }) => {
    props?.onPublish(
      {
        key: props.spell.key,
        version: props.spell.version,
        config,
        editor: {
          ...editor,
          publishedBy: {
            id: props?.user?.id,
            name: props?.user?.name,
            email: props?.user?.email,
            at: new Date(),
          },
          versionForked: props.spell.version,
        },
        models,
        schema,
        states,
        isActive: false,
      },
      increment
    );
    setIsDirty(false);
  };

  // --- states prep
  const statesList = castStatesToList(states);
  const statesObj = castStatesToMap(states);

  // RENDER
  return (
    <StyledSpellEditor>
      <div className="spell-editor__header">
        <div className="spell-editor__header__lead">
          {sidebarStore.isCollapsed && (
            <div
              className="spell-editor__header__logo"
              onClick={() => sidebarStore.setIsCollapsed(!sidebarStore.isCollapsed)}
            >
              <h4>✨🔮✨</h4>
            </div>
          )}
          <div className="spell-editor__header__title">
            <h4>
              {props.spell.key} v{props.spell.version}
            </h4>
            <div>
              <small
                className="spell-editor__header__directory"
                onClick={() => {
                  const inputNewSpellDirectory = prompt("What directory? Separate levels via commas");
                  if (inputNewSpellDirectory) {
                    setEditor({ ...editor, directory: (inputNewSpellDirectory || "").split(",") ?? [] });
                    setIsDirty(true);
                  }
                }}
              >
                /{editor?.directory?.join("/")}
              </small>
              <small>--</small>
              {editor?.versionForked ? <small>Updated from: v{editor?.versionForked}, </small> : null}
              {editor?.publishedBy ? (
                <small>
                  published by {editor?.publishedBy?.name ?? ""} @{" "}
                  {props.spell?.createdAt ? format(new Date(props.spell?.createdAt), "yyyy-MM-dd") : null}
                </small>
              ) : null}
            </div>
          </div>
        </div>
        {/* ACTIONS */}
        <div className="spell-editor__header__actions">
          <button disabled={!isDirty} onClick={() => publishHandler({ increment: "major" })}>
            Save Breaking Update
          </button>
          <button disabled={!isDirty} onClick={() => publishHandler({ increment: "minor" })}>
            Save Minor Update
          </button>
          <span className="divider"> | </span>
          <button
            disabled={isDirty}
            onClick={() => props?.onActive(props.spell.id, props.spell.isActive != null ? !props.spell.isActive : true)}
          >
            {props.spell.isActive ? "Set Deactive" : "Set Active"}
          </button>
          <span className="divider"> | </span>
          <button
            disabled={isDirty}
            onClick={() => {
              editorStore.setFocusedSpellKey(props.spell.key);
              editorStore.setFocusedSpellVersion(props.spell.version);
              previewStore.setIsPreviewModal(true);
            }}
          >
            Preview
          </button>
          <button
            disabled={isDirty}
            onClick={() => {
              const key = props.spell.key;
              const version = props.spell.version;
              editorStore.setFocusedSpellKey(key);
              editorStore.setFocusedSpellVersion(version);
              window.open(getPreviewUrl({ key, version }), "_blank");
            }}
          >
            Open Preview Page 🖼
          </button>
        </div>
      </div>
      <div style={{ width: "100%" }}>
        {/* CONFIG */}
        <SpellMetaEditor
          config={config}
          editor={editor}
          models={models}
          modelsConfigs={props.models}
          schema={schema}
          spell={props.spell}
          statesList={statesList}
          onConfigUpdate={(config) => {
            console.log("SpellMetaEditor: onConfigUpdate", config);
            setConfig(config);
            setIsDirty(true);
          }}
          onEditorUpdate={(editor) => {
            console.log("SpellMetaEditor: onEditorUpdate", editor);
            setEditor(editor);
            setIsDirty(true);
          }}
          onModelsUpdate={(models) => {
            console.log("SpellMetaEditor: onModelsUpdate", models);
            setModels(models);
            setIsDirty(true);
          }}
          onSchemaUpdate={(schema) => {
            console.log("SpellMetaEditor: onSchemaUpdate", schema);
            setSchema(schema);
            setIsDirty(true);
          }}
        />
        {/* STATES */}
        <SpellStatesEditor
          config={config}
          editor={editor}
          models={models}
          modelsConfigs={props.models}
          schema={schema}
          serializations={props.serializations}
          spells={props.spells}
          spellsStatic={props.spellsStatic}
          states={statesObj}
          statesList={statesList}
          onConfigUpdate={(config) => {
            console.log("SpellStatesEditor: onConfigUpdate", config);
            setConfig(config);
            setIsDirty(true);
          }}
          onEditorUpdate={(editor) => {
            console.log("SpellStatesEditor: onEditorUpdate", editor);
            setEditor(editor);
            setIsDirty(true);
          }}
          onStatesUpdate={(states) => {
            console.log("SpellStatesEditor: onStatesUpdate", states);
            setStates(states);
            setIsDirty(true);
          }}
          user={props.user}
        />
      </div>
    </StyledSpellEditor>
  );
};

const StyledSpellEditor = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  .spell-editor__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0;
    background: #fcfcfc;
    border-bottom: 2px solid #f0f0f0;
    .spell-editor__header__lead {
      display: flex;
    }
    .spell-editor__header__logo {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 0 1em;
      background-color: #000;
      // background-color: #fde74c;
      // background-image: linear-gradient(319deg, #fde74c 0%, #32ff7a 37%, #2fcbe0 100%);
    }
    .spell-editor__header__title {
      display: flex;
      flex-direction: column;
      margin-left: 1em;
      h4 {
        position: relative;
        bottom: -3px;
      }
      & > div {
        display: flex;
        small {
          margin-right: 0.5em;
          font-size: 10px;
        }
      }
    }
    .spell-editor__header__directory {
      font-weight: 900;
      text-decoration: underline;
      cursor: pointer;
    }
    .spell-editor__header__actions {
      margin-right: 1em;
      button {
        margin-left: 0.25em;
      }
      .divider {
        margin: 0 4px;
        color: #ccc;
      }
    }
  }
`;
