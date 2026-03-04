import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import { searchParamGet, searchParamSet, SPELLBOOK_SEARCH_PARAMS } from "../utils";

type TPreviewStore = {
  isPreviewDedicated: boolean;
  isPreviewModal: boolean;
  setIsPreviewDedicated: (isPreviewDedicated: boolean) => void;
  setIsPreviewModal: (isPreviewModal: boolean) => void;
};

export const previewStore = createStore<TPreviewStore>((set, get) => ({
  isPreviewDedicated: searchParamGet(SPELLBOOK_SEARCH_PARAMS.PREVIEW) === "true",
  isPreviewModal: false,
  setIsPreviewDedicated: (isPreviewDedicated) => {
    set({ isPreviewDedicated });
    searchParamSet(SPELLBOOK_SEARCH_PARAMS.PREVIEW, isPreviewDedicated === true ? "true" : undefined);
  },
  setIsPreviewModal: (isPreviewModal) => set({ isPreviewModal }),
}));

export const usePreview = () => useStore(previewStore);
