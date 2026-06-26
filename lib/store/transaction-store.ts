import { create } from "zustand";
import { getTransactions, Transaction, TransactionQueryDto, PaginatedTransactions } from "@/lib/api/transactions";

interface TransactionStore {
  transactions: Transaction[];
  total: number;
  isLoading: boolean;
  error: string | null;
  filters: TransactionQueryDto;
  fetchTransactions: (filters?: TransactionQueryDto) => Promise<void>;
  setFilters: (filters: TransactionQueryDto) => void;
  appendTransaction: (tx: Transaction) => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  total: 0,
  isLoading: false,
  error: null,
  filters: {},

  fetchTransactions: async (filters) => {
    const currentFilters = filters || get().filters;
    set({ isLoading: true, error: null, filters: currentFilters });
    try {
      const result: PaginatedTransactions = await getTransactions(currentFilters);
      set({
        transactions: result.data,
        total: result.total,
        isLoading: false,
      });
    } catch (err) {
      set({ error: "Failed to load transactions", isLoading: false });
    }
  },

  setFilters: (filters) => {
    set({ filters });
  },

  appendTransaction: (tx) => {
    set((state) => ({
      transactions: [tx, ...state.transactions],
      total: state.total + 1,
    }));
  },
}));
