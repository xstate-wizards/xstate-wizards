import { format, isBefore, subSeconds } from "date-fns";
import { cloneDeep, keyBy } from "lodash";
import React, { useMemo, useState } from "react";
import styled from "styled-components";
import {
  $TSFixMe,
  createSpell,
  TPrepparedSpellMapping,
  TSpellInstructions,
  TWizardSerializations,
} from "@xstate-wizards/spells";
import { WizardRunner } from "@xstate-wizards/wizards-of-react";

import { useEditor } from "../../stores/EditorStore";
import { usePreview } from "../../stores/PreviewStore";
import { PreviewHistoryItemInspector, TPreviewHistoryError, TPreviewHistoryItem } from "./PreviewHistoryItemInspector";
import { PreviewWizardErrorBoundary } from "./PreviewWizardModal";

type TPreviewWizardPage = {
  models: $TSFixMe;
  serializations: TWizardSerializations;
  spells: {
    [id: number]: TSpellInstructions;
  };
  spellsStatic: {
    [key: string]: TSpellInstructions | TPrepparedSpellMapping;
  };
  onSpellRefetch: () => void;
};

export const PreviewWizardPage: React.FC<TPreviewWizardPage> = (props) => {
  // SETUP
  const editor = useEditor();
  const preview = usePreview();
  const [lastFetchedAt, setLastFetchedAt] = useState(Date.now());
  const [previewHistory, setPreviewHistory] = useState<(TPreviewHistoryItem | TPreviewHistoryError)[]>([]);
  const [isPreviewHistoryVisible, setIsPreviewHistoryVisible] = useState(false);
  // --- versions
  const versions = Object.values(props.spells ?? {})
    .filter((s) => s.key === editor.focusedSpellKey)
    .reverse();
  // --- mappings/spell
  // TODO: Need to fix typings for what we pass into WizardRunner
  const { foundSpell, foundSpellInstruction, preppedSpellMap }: $TSFixMe = useMemo(() => {
    const preppedSpellMap = keyBy(
      Object.values(props.spells ?? {})
        .filter((s) => s.isActive === true)
        .map(createSpell),
      "key"
    );
    // ... with requested spell id
    const foundSpellInstruction = Object.values(props.spells ?? {}).find(
      (s) =>
        s.key === editor.focusedSpellKey &&
        (editor.focusedSpellVersion ? s.version === editor.focusedSpellVersion : s.isActive === true)
    );
    const foundSpell = createSpell(foundSpellInstruction);
    // TODO: Allow selection of multiple spells to run
    return {
      foundSpell,
      foundSpellInstruction,
      preppedSpellMap: {
        ...props.spellsStatic,
        ...preppedSpellMap,
        [foundSpell.key]: foundSpell,
      },
    };
  }, [props.spells, editor.focusedSpellKey, editor.focusedSpellVersion]);
  // --- selector for latest or active version
  const refetchHelper = async () => {
    await props?.onSpellRefetch?.();
    setLastFetchedAt(Date.now());
  };
  const selectNewVersion = async (selection?: string) => {
    if (selection === "latest") {
      editor.setFocusedSpellVersion(versions?.[0]?.version);
    } else {
      editor.setFocusedSpellVersion(undefined);
    }
    setPreviewHistory(() => []);
  };

  // RENDER
  return !foundSpell ? null : (
    <StyledPreviewWizardPage key={`${editor.focusedSpellKey}-${editor.focusedSpellVersion}`}>
      <div className="spell-editor__header">
        <div className="spell-editor__header__lead">
          <div className="spell-editor__header__logo">
            <h4 onClick={() => preview.setIsPreviewDedicated(false)}>✨🔮✨</h4>
          </div>
          <div className="spell-editor__header__title">
            <h4>{foundSpell?.key} </h4>
            <div>
              <select value={foundSpell?.version} onChange={(e) => selectNewVersion(e.target.value)}>
                <option value="">---</option>
                <optgroup label="Versions">
                  {versions.map(({ version }) => (
                    <option key={version} value={version}>
                      v{version}
                    </option>
                  ))}
                </optgroup>
              </select>
              {/* Refetch or go to latest (30 sec timer) */}
              {isBefore(lastFetchedAt, subSeconds(Date.now(), 30)) ? (
                <button onClick={() => refetchHelper()}>Refresh</button>
              ) : (
                <>
                  <button onClick={() => selectNewVersion("latest")}>Go to Latest</button>
                  <button onClick={() => selectNewVersion()}>Go to Active</button>
                </>
              )}
            </div>
            <div>
              <small className="spell-editor__header__directory">
                /{foundSpellInstruction?.editor?.directory?.join("/")}
              </small>
              <small>--</small>
              {foundSpellInstruction?.editor?.versionForked ? (
                <small>Updated from: v{foundSpellInstruction?.editor?.versionForked}, </small>
              ) : null}
              {foundSpellInstruction?.editor?.publishedBy ? (
                <small>
                  published by {foundSpellInstruction?.editor?.publishedBy?.name ?? ""} @{" "}
                  {foundSpellInstruction?.createdAt
                    ? format(new Date(foundSpellInstruction?.createdAt), "yyyy-MM-dd")
                    : null}
                </small>
              ) : null}
            </div>
          </div>
        </div>
        {/* ACTIONS */}
        <div className="spell-editor__header__actions">
          <button onClick={() => setIsPreviewHistoryVisible(!isPreviewHistoryVisible)}>
            {isPreviewHistoryVisible ? "Hide" : "Show"} History Inspector
          </button>
        </div>
      </div>
      <div className="preview__wiz">
        <div className="preview__wiz__runner">
          <PreviewWizardErrorBoundary>
            <WizardRunner
              configInitial={foundSpell.config.initial}
              debugConfig={{
                logging: true,
                skipSaves: true,
              }}
              models={props.models}
              navigate={console.log}
              onWizardChange={(state) => {
                setPreviewHistory((hist) =>
                  cloneDeep(
                    hist.concat({
                      context: state.context,
                      event: state.event,
                      key: state.machine.key,
                      value: state.value,
                    })
                  )
                );
              }}
              onWizardError={(err) => {
                setPreviewHistory((hist) =>
                  cloneDeep(
                    hist.concat({
                      error: err.message,
                    })
                  )
                );
              }}
              onWizardFinal={(final) => {
                // clear preview id
                preview.setIsPreviewModal(false);
              }}
              serializations={props.serializations}
              sessionEnabled={false}
              spellKey={editor.focusedSpellKey}
              spellMap={preppedSpellMap}
            />
          </PreviewWizardErrorBoundary>
        </div>
        {isPreviewHistoryVisible && (
          <div className="preview__wiz__inspector">
            <div className="preview__wiz__inspector__header">
              <small>Events History</small>
            </div>
            {previewHistory.map((item: $TSFixMe, index) => (
              <PreviewHistoryItemInspector key={`${item.key ?? item.error}-${index}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </StyledPreviewWizardPage>
  );
};

const StyledPreviewWizardPage = styled.div`
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
    background: #111;
    color: white;
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
      border-left: 2px solid white;
      padding-left: 1em;
      align-items: center;
      height: 48px;
      h4 {
        display: flex;
        select {
          margin-left: 4px;
        }
      }
      & > div {
        display: flex;
        margin-left: 1em;
        small {
          margin-left: 0.5em;
          font-size: 10px;
        }
      }
      button {
        margin-left: 4px;
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

  .preview__wiz {
    width: 100%;
    height: 100%;
    overflow: scroll;
    display: flex;
    .preview__wiz__runner {
      width: 100%;
      flex-grow: 1;
      overflow-y: scroll;
    }
    .preview__wiz__inspector {
      background: #e5e5e5;
      min-width: 480px;
      max-width: 480px;
      width: 480px;
      padding: 1em;
      overflow: scroll;
    }
    .preview__wiz__inspector__header {
      margin-bottom: 0.5em;
      font-size: 12px;
      font-weight: 900;
      color: #999;
    }
  }
`;
