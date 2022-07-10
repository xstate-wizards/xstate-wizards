import createVanilla from "zustand/vanilla";
import create from "zustand";

type TSidebarStore = {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
};

export const sidebarStore = createVanilla<TSidebarStore>((set, get) => ({
  isCollapsed: false,
  setIsCollapsed: (isCollapsed) => set({ isCollapsed }),
}));

export const useSidebar = create(sidebarStore);
