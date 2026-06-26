import { create } from "zustand";
import { getBalances, WalletBalance } from "@/lib/api/wallet";

interface WalletStore {
  balances: WalletBalance[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchBalances: () => Promise<void>;
  refreshBalances: () => Promise<void>;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  balances: [],
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchBalances: async () => {
    const { isLoading, lastFetched } = get();
    
    if (isLoading) return;
    
    const now = Date.now();
    if (lastFetched && now - lastFetched < 60000) return;

    set({ isLoading: true, error: null });
    try {
      const balances = await getBalances();
      set({ balances, lastFetched: now, isLoading: false });
    } catch (err) {
      set({ error: "Failed to load balances", isLoading: false });
    }
  },

  refreshBalances: async () => {
    set({ isLoading: true, error: null });
    try {
      const balances = await getBalances();
      set({ balances, lastFetched: Date.now(), isLoading: false });
    } catch (err) {
      set({ error: "Failed to load balances", isLoading: false });
    }
  },
});
