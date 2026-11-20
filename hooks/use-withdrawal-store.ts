"use client";

import { create } from "zustand";
import type { Wallet } from "@/lib/api/wallets";

export interface WithdrawalDraft {
  walletId: string;
  amount: string;
  currency: string;
  destination: string;
  note?: string;
}

export interface WithdrawalState {
  draft: WithdrawalDraft;
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  isSubmitting: boolean;
  error: string | null;
  setDraft: (patch: Partial<WithdrawalDraft>) => void;
  setWallets: (wallets: Wallet[]) => void;
  selectWallet: (wallet: Wallet | null) => void;
  setSubmitting: (value: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialDraft: WithdrawalDraft = {
  walletId: "",
  amount: "",
  currency: "",
  destination: "",
  note: "",
};

export const useWithdrawalStore = create<WithdrawalState>((set) => ({
  draft: { ...initialDraft },
  wallets: [],
  selectedWallet: null,
  isSubmitting: false,
  error: null,
  setDraft: (patch) =>
    set((state) => ({ draft: { ...state.draft, ...patch } })),
  setWallets: (wallets) => set({ wallets }),
  selectWallet: (wallet) =>
    set((state) => ({
      selectedWallet: wallet,
      draft: {
        ...state.draft,
        walletId: wallet?.id ?? "",
        currency: wallet?.currency ?? state.draft.currency,
      },
    })),
  setSubmitting: (value) => set({ isSubmitting: value }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      draft: { ...initialDraft },
      selectedWallet: null,
      isSubmitting: false,
      error: null,
    }),
}));

export default useWithdrawalStore;
