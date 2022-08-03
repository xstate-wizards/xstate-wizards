import React, { useState } from "react";
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

type TSpellBookPropsSpells = {
  [id: number]: TSpellInstructions;
};

type TSpellBookProps = {
  models: TWizardModelsMap;
  spells: TSpellBookPropsSpells;
  spellsStatic: {
    [key: string]: TSpellInstructions | TPrepparedSpellMapping;
  };
  serializations: TWizardSerializations;
  onSpellCreate: (params: $TSFixMe) => $TSFixMe;
  onSpellSetActive: (params: $TSFixMe) => $TSFixMe;
  onSpellPublish: (params: $TSFixMe) => $TSFixMe;
  fetchSpells: () => TSpellBookPropsSpells;
  fetchSpellVersions: (params: { key: string; page?: number }) => TSpellBookPropsSpells;
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
  fetchSpells,
  fetchSpellVersions,
  serializations,
  spellsStatic = {},
  ...props
}) => {
  const preppedSerializations: TWizardSerializations = {
    ...serializations,
    components: {
      ...serializations.components,
      // @ts-ignore
      WizardWrap: SpellBookWizardWrap,
    },
  };
  const editor = useEditor();
  const preview = usePreview();
  const [spells, setSpells] = useState<TSpellBookPropsSpells>(props.spells);
  const refetchSpells = async () => {
    const refetchedSpells = await fetchSpells();
    setSpells((spellsById) => ({ ...spellsById, ...refetchedSpells }));
  };
  const refetchSpellVersions = async ({ key, page }: { key: string; page?: number }) => {
    const refetchedSpellVersions = await fetchSpellVersions({ key, page });
    setSpells((spellsById) => ({ ...spellsById, ...refetchedSpellVersions }));
  };

  // RENDER --- Preview Dedicated
  if (preview.isPreviewDedicated) {
    return (
      <PreviewWizardPage
        models={models}
        serializations={preppedSerializations}
        spells={spells}
        spellsStatic={spellsStatic}
        onSpellsRefetch={async () => refetchSpells()}
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
        <SpellsSidebar
          onSpellCreate={async (spell) => {
            // --- create
            await onSpellCreate(spell);
            // --- refetch
            await refetchSpellVersions({ key: spell.key });
          }}
          spells={spells}
        />
        {/* EDITOR -- SPELL */}
        <main className="spell-editor">
          {editor.focusedSpellId && spells[editor.focusedSpellId] && (
            <SpellEditor
              key={`${editor.focusedSpellKey}-${editor.focusedSpellVersion}-${spells[editor.focusedSpellId]?.isActive}`}
              serializations={preppedSerializations}
              models={models}
              onActive={async (id, isActive) => {
                // --- active
                await onSpellSetActive({ id, isActive });
                // --- refetch
                await refetchSpellVersions({ key: spells[id].key });
              }}
              onPublish={async (spellPayload, increment) => {
                // --- publish
                const newSpell = await onSpellPublish({
                  increment,
                  spell: { ...spells[editor.focusedSpellId!], ...spellPayload },
                });
                editor.setFocusedSpellId(newSpell.id);
                // --- refetch
                await refetchSpellVersions({ key: newSpell.key });
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
