import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

type TSidebarStore = {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
};

export const sidebarStore = createStore<TSidebarStore>((set, get) => ({
  isCollapsed: false,
  setIsCollapsed: (isCollapsed) => set({ isCollapsed }),
}));

export const useSidebar = () => useStore(sidebarStore);
