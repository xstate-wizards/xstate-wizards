import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import { searchParamGet, SPELLBOOK_SEARCH_PARAMS, searchParamSet } from "../utils";

type TEditorStore = {
  focusedSpellId?: string | number;
  focusedSpellKey?: string;
  focusedSpellVersion?: string;
  activeEditingLocale?: string;
  setFocusedSpellId: (focusedSpellId?: string | number) => void;
  setFocusedSpellKey: (focusedSpellKey?: string) => void;
  setFocusedSpellVersion: (focusedSpellVersion?: string) => void;
  setActiveEditingLocale: (locale?: string) => void;
};

export const editorStore = createStore<TEditorStore>((set, get) => ({
  // gets
  focusedSpellId: undefined,
  focusedSpellKey: searchParamGet(SPELLBOOK_SEARCH_PARAMS.SPELL_KEY) ?? undefined,
  focusedSpellVersion: searchParamGet(SPELLBOOK_SEARCH_PARAMS.SPELL_VERSION) ?? undefined,
  activeEditingLocale: undefined,
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
  setActiveEditingLocale: (activeEditingLocale) => set({ activeEditingLocale }),
}));

export const useEditor = () => useStore(editorStore);
