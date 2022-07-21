import { cloneDeep, keyBy } from "lodash";
import React, { useMemo, useState } from "react";
import styled from "styled-components";
import {
  $TSFixMe,
  createSpell,
  logger,
  TPrepparedSpellMapping,
  TSpellInstructions,
  TWizardSerializations,
} from "@xstate-wizards/spells";
import { WizardRunner } from "@xstate-wizards/wizards-of-react";
import { useEditor } from "../../stores/EditorStore";
import { usePreview } from "../../stores/PreviewStore";
import { PreviewHistoryItemInspector, TPreviewHistoryError, TPreviewHistoryItem } from "./PreviewHistoryItemInspector";

// Wrap machine to ensure errors don't blow up UI
export class PreviewWizardErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error("PreviewWizardErrorBoudnary: ", error, errorInfo);
  }
  render() {
    // @ts-ignore
    return this.props.children;
  }
}

type TPreviewWizardModalProps = {
  models: $TSFixMe;
  serializations: TWizardSerializations;
  spells: {
    [id: number]: TSpellInstructions;
  };
  spellsStatic: {
    [key: string]: TSpellInstructions | TPrepparedSpellMapping;
  };
};

export const PreviewWizardModal: React.FC<TPreviewWizardModalProps> = ({
  models,
  serializations,
  spells,
  spellsStatic,
}) => {
  const editor = useEditor();
  const preview = usePreview();
  const [previewHistory, setPreviewHistory] = useState<(TPreviewHistoryItem | TPreviewHistoryError)[]>([]);
  // TODO: Need to fix typings for what we pass into WizardRunner
  const { foundSpell, preppedSpellMap }: $TSFixMe = useMemo(() => {
    const preppedSpellMap = keyBy(
      Object.values(spells ?? {})
        .filter((s) => s.isActive === true)
        .map(createSpell),
      "key"
    );
    // ... with requested spell id
    const foundSpell = createSpell(
      Object.values(spells ?? {}).find(
        (s) => s.key === editor.focusedSpellKey && s.version === editor.focusedSpellVersion
      )
    );
    // TODO: Allow selection of multiple spells to run
    return {
      foundSpell,
      preppedSpellMap: {
        ...spellsStatic,
        ...preppedSpellMap,
        [foundSpell.key]: foundSpell,
      },
    };
  }, [spells]);

  // SETUP PREVIEW MAP

  // RENDER
  return !foundSpell || !preppedSpellMap ? null : (
    <StyledPreviewWizardModal onClick={() => preview.setIsPreviewModal(false)}>
      <div className="preview" onClick={(e) => e.stopPropagation()}>
        <div className="preview__close" onClick={() => preview.setIsPreviewModal(false)}>
          Close Preview
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
                models={models}
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
                  setPreviewHistory((hist) => cloneDeep(hist.concat({ error: err.message })));
                }}
                onWizardFinal={(final) => {
                  // clear preview id
                  preview.setIsPreviewModal(false);
                }}
                serializations={serializations}
                sessionEnabled={false}
                spellKey={editor.focusedSpellKey}
                spellMap={preppedSpellMap}
              />
            </PreviewWizardErrorBoundary>
          </div>
          <div className="preview__wiz__inspector">
            <div className="preview__wiz__inspector__header">
              <small>Events History</small>
            </div>
            {previewHistory.map((item: $TSFixMe, index) => (
              <PreviewHistoryItemInspector key={`${item.key ?? item.error}-${index}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </StyledPreviewWizardModal>
  );
};

const StyledPreviewWizardModal = styled.div`
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  padding: 2em;
  .preview {
    height: 100%;
    width: 100%;
    margin: 0 auto;
    background: white;
    border-radius: 4px;
    max-width: 1080px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .preview__close {
    width: 100%;
    padding: 0.2em;
    text-align: center;
    cursor: pointer;
    background: #eee;
    border-bottom: 2px solid #ccc;
    font-size: 12px;
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
