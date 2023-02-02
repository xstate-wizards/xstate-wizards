import createVanilla from "zustand/vanilla";
import create from "zustand";

type TOutlineHighlight = {
  sourceId: string | null;
  targetIds: string[];
};

export enum OutlineCondVisibility {
  all = "all",
  hide = "hide",
}

type TOutlineStore = {
  initConditionalVisibility: OutlineCondVisibility;
  setInitConditionalVisibility: (vis: OutlineCondVisibility) => void;
  nodeHighlights: TOutlineHighlight;
  setNodeHighlights: (nodeHighlights: TOutlineHighlight) => void;
};

export const outlineStore = createVanilla<TOutlineStore>((set, get) => ({
  initConditionalVisibility: OutlineCondVisibility.all,
  setInitConditionalVisibility: (initConditionalVisibility) => set({ initConditionalVisibility }),
  nodeHighlights: { sourceId: null, targetIds: [] },
  setNodeHighlights: (nodeHighlights) => set({ nodeHighlights }),
}));

export const useOutline = create(outlineStore);
