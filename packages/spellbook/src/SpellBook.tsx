import { cloneDeep } from "lodash";
import React from "react";
import styled from "styled-components";
import {
  $TSFixMe,
  TPrepparedSpellMapping,
  TSpellInstructions,
  TWizardModelsMap,
  TWizardSerializations,
} from "@xstate-wizards/spells";
import { SpellEditor } from "./components/SpellEditor";
import { SpellsSidebar } from "./components/SpellsSidebar";
import { usePreview } from "./stores/PreviewStore";
import { PreviewWizardModal } from "./components/previews/PreviewWizardModal";
import { useEditor } from "./stores/EditorStore";
import { PreviewWizardPage } from "./components/previews/PreviewWizardPage";
import { SpellBookWizardWrap } from "./placeholders/SpellbookWizardWrap";

type TSpellBookProps = {
  models: TWizardModelsMap;
  spells: {
    [id: number]: TSpellInstructions;
  };
  spellsStatic: {
    [key: string]: TSpellInstructions | TPrepparedSpellMapping;
  };
  serializations: TWizardSerializations;
  onSpellCreate: (params: $TSFixMe) => $TSFixMe;
  onSpellSetActive: (params: $TSFixMe) => $TSFixMe;
  onSpellPublish: (params: $TSFixMe) => $TSFixMe;
  onSpellRefetch: () => void;
  user: null | {
    id?: string | number;
    name?: string;
    email?: string;
  };
};

export const SpellBook: React.FC<TSpellBookProps> = ({
  models = {},
  onSpellCreate,
  onSpellSetActive,
  onSpellPublish,
  onSpellRefetch,
  serializations,
  spellsStatic = {},
  ...props
}) => {
  const editor = useEditor();
  const preview = usePreview();
  const spells = cloneDeep(props.spells); // cloning so break refs and prevent mutating app data from external application
  const preppedSerializations: TWizardSerializations = {
    ...serializations,
    components: {
      ...serializations.components,
      // @ts-ignore
      WizardWrap: SpellBookWizardWrap,
    },
  };

  // RENDER --- Preview Dedicated
  if (preview.isPreviewDedicated) {
    return (
      <PreviewWizardPage
        models={models}
        serializations={preppedSerializations}
        spells={spells}
        spellsStatic={spellsStatic}
        onSpellRefetch={onSpellRefetch}
      />
    );
  }

  // RENDER --- Editor
  return (
    <>
      {/* PREVIEW MODAL */}
      {preview.isPreviewModal ? (
        <PreviewWizardModal
          models={models}
          serializations={preppedSerializations}
          spells={spells}
          spellsStatic={spellsStatic}
        />
      ) : null}

      {/* EDITOR */}
      <StyledSpellBook>
        {/* EDITOR -- SIDEBAR */}
        <SpellsSidebar onSpellCreate={(spell) => onSpellCreate(spell)} spells={spells} />
        {/* EDITOR -- SPELL */}
        <main className="spell-editor">
          {editor.focusedSpellId && spells[editor.focusedSpellId] && (
            <SpellEditor
              key={`${editor.focusedSpellKey}-${editor.focusedSpellVersion}-${spells[editor.focusedSpellId]?.isActive}`}
              serializations={preppedSerializations}
              models={models}
              onActive={(id, isActive) => onSpellSetActive({ id, isActive })}
              onPublish={async (spellPayload, increment) => {
                const newSpell = await onSpellPublish({
                  increment,
                  spell: { ...spells[editor.focusedSpellId!], ...spellPayload },
                });
                editor.setFocusedSpellId(newSpell.id);
              }}
              spell={spells[editor.focusedSpellId]}
              spells={spells}
              spellsStatic={spellsStatic}
              user={props.user}
            />
          )}
        </main>
      </StyledSpellBook>
    </>
  );
};

const StyledSpellBook = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  // overflow: hidden;

  .spell-editor {
    width: 100%;
    max-width: 100vw;
    .editor__main {
      display: flex;
      justify-content: space-between;
    }
    .editor__flow {
      width: 100%;
    }
  }
`;
