import { cloneDeep, keyBy } from "lodash";
import React, { useMemo, useState } from "react";

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
    <div className="xw-sb__preview-modal" onClick={() => preview.setIsPreviewModal(false)}>
      <div className="xw-sb__preview" onClick={(e) => e.stopPropagation()}>
        <div className="xw-sb__preview__close" onClick={() => preview.setIsPreviewModal(false)}>
          Close Preview
        </div>
        <div className="xw-sb__preview__wiz">
          <div className="xw-sb__preview__wiz__runner">
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
          <div className="xw-sb__preview__wiz__inspector">
            <div className="xw-sb__preview__wiz__inspector__header">
              <small>Events History</small>
            </div>
            {previewHistory.map((item: $TSFixMe, index) => (
              <PreviewHistoryItemInspector key={`${item.key ?? item.error}-${index}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
