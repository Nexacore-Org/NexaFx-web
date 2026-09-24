import { create } from "zustand";

/**
 * Sidebar store — simple UI toggle, no persistence.
 * See `docs/store-conventions.md` for persistence and optimistic-update conventions.
 */
interface SidebarStore {
    isOpen: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
    isOpen: false,
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
}));
