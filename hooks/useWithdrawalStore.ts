import { create } from "zustand";

export type WithdrawalStep = 'select' | 'form' | 'review' | 'processing' | 'success' | 'error';
export type TransactionStatus = 'pending' | 'success' | 'failed' | null;

interface WithdrawalFormData {
    currency: string;
    amount: string;
    walletAddress: string;
}

interface WithdrawalState {
    // Modal state
    isOpen: boolean;
    step: WithdrawalStep;

    // Form data
    currency: string;
    amount: string;
    walletAddress: string;

    // Transaction result
    transactionId: string | null;
    transactionStatus: TransactionStatus;
    errorMessage: string | null;

    // Actions
    open: () => void;
    close: () => void;
    setStep: (step: WithdrawalStep) => void;
    setFormData: (data: Partial<WithdrawalFormData>) => void;
    setTransactionResult: (id: string | null, status: TransactionStatus, error?: string) => void;
    reset: () => void;
}

const initialState = {
    isOpen: false,
    step: 'select' as WithdrawalStep,
    currency: 'USDC',
    amount: '',
    walletAddress: '',
    transactionId: null,
    transactionStatus: null as TransactionStatus,
    errorMessage: null as string | null,
};

export const useWithdrawalStore = create<WithdrawalState>((set) => ({
    ...initialState,

    open: () => set({ isOpen: true, step: 'select' }),

    close: () => set({ isOpen: false }),

    setStep: (step) => set({ step }),

    setFormData: (data) => set((state) => ({
        ...state,
        ...data,
    })),

    setTransactionResult: (id, status, error) => set({
        transactionId: id,
        transactionStatus: status,
        errorMessage: error ?? null,
    }),

    reset: () => set(initialState),
}));
