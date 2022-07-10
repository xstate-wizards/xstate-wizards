import createVanilla from "zustand/vanilla";
import create from "zustand";
import { searchParamGet, SPELLBOOK_SEARCH_PARAMS, searchParamSet } from "../utils";

type TEditorStore = {
  focusedSpellId?: string | number;
  focusedSpellKey?: string;
  focusedSpellVersion?: string;
  setFocusedSpellId: (focusedSpellId?: string | number) => void;
  setFocusedSpellKey: (focusedSpellKey?: string) => void;
  setFocusedSpellVersion: (focusedSpellVersion?: string) => void;
};

export const editorStore = createVanilla<TEditorStore>((set, get) => ({
  // gets
  focusedSpellId: undefined,
  focusedSpellKey: searchParamGet(SPELLBOOK_SEARCH_PARAMS.SPELL_KEY) ?? undefined,
  focusedSpellVersion: searchParamGet(SPELLBOOK_SEARCH_PARAMS.SPELL_VERSION) ?? undefined,
  // setters
  setFocusedSpellId: (focusedSpellId) => set({ focusedSpellId }),
  setFocusedSpellKey: (focusedSpellKey) => {
    set({ focusedSpellKey });
    searchParamSet(SPELLBOOK_SEARCH_PARAMS.SPELL_KEY, focusedSpellKey);
  },
  setFocusedSpellVersion: (focusedSpellVersion) => {
    set({ focusedSpellVersion });
    searchParamSet(SPELLBOOK_SEARCH_PARAMS.SPELL_VERSION, focusedSpellVersion);
  },
}));

export const useEditor = create(editorStore);
