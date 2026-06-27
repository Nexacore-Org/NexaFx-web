import { create } from "zustand";

export type TransferFrequency = "daily" | "weekly" | "monthly";
export type TransferStatus = "active" | "paused" | "completed";

export interface RecurringTransfer {
  id: string;
  amount: number;
  currency: string;
  recipient: string;
  frequency: TransferFrequency;
  startDate: string;
  endDate: string;
  status: TransferStatus;
  nextExecutionDate: string;
  totalExecuted: number;
  createdAt: string;
}

interface RecurringTransfersState {
  transfers: RecurringTransfer[];
  isLoading: boolean;
  error: string | null;
  fetchTransfers: () => Promise<void>;
  createTransfer: (data: Omit<RecurringTransfer, "id" | "status" | "nextExecutionDate" | "totalExecuted" | "createdAt">) => Promise<void>;
  pauseTransfer: (id: string) => void;
  cancelTransfer: (id: string) => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

const MOCK_TRANSFERS: RecurringTransfer[] = [
  {
    id: "rt1",
    amount: 500,
    currency: "USD",
    recipient: "alice@example.com",
    frequency: "weekly",
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    status: "active",
    nextExecutionDate: "2026-07-04",
    totalExecuted: 4,
    createdAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "rt2",
    amount: 200,
    currency: "EUR",
    recipient: "bob@example.com",
    frequency: "monthly",
    startDate: "2026-03-15",
    endDate: "2026-09-15",
    status: "paused",
    nextExecutionDate: "2026-07-15",
    totalExecuted: 3,
    createdAt: "2026-03-15T00:00:00Z",
  },
  {
    id: "rt3",
    amount: 1000,
    currency: "NGN",
    recipient: "charlie@example.com",
    frequency: "daily",
    startDate: "2026-06-01",
    endDate: "2026-06-15",
    status: "completed",
    nextExecutionDate: "2026-06-15",
    totalExecuted: 15,
    createdAt: "2026-06-01T00:00:00Z",
  },
];

export const useRecurringTransfersStore = create<RecurringTransfersState>()(
  (set, get) => ({
    transfers: [],
    isLoading: false,
    error: null,

    fetchTransfers: async () => {
      set({ isLoading: true, error: null });
      try {
        await new Promise((r) => setTimeout(r, 600));
        set({ transfers: MOCK_TRANSFERS, isLoading: false });
      } catch {
        set({ error: "Failed to load recurring transfers.", isLoading: false });
      }
    },

    createTransfer: async (data) => {
      set({ isLoading: true, error: null });
      try {
        await new Promise((r) => setTimeout(r, 400));
        const newTransfer: RecurringTransfer = {
          ...data,
          id: `rt${generateId()}`,
          status: "active",
          nextExecutionDate: data.startDate,
          totalExecuted: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          transfers: [newTransfer, ...state.transfers],
          isLoading: false,
        }));
      } catch {
        set({ error: "Failed to create recurring transfer.", isLoading: false });
      }
    },

    pauseTransfer: (id) => {
      set((state) => ({
        transfers: state.transfers.map((t) =>
          t.id === id ? { ...t, status: t.status === "active" ? "paused" as const : "active" as const } : t,
        ),
      }));
    },

    cancelTransfer: (id) => {
      set((state) => ({
        transfers: state.transfers.filter((t) => t.id !== id),
      }));
    },
  }),
);
