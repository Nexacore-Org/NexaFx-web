import { create } from "zustand";

interface WithdrawalState {
  isMobileWithdrawOptionsOpen: boolean;
  isWithdrawModalOpen: boolean;
  isSuccessModalOpen: boolean;
  openWithdrawModal: () => void;
  closeWithdrawModal: () => void;
  openMobileWithdrawOptions: () => void;
  closeMobileWithdrawOptions: () => void;
  openSuccessModal: () => void;
  closeSuccessModal: () => void;
  toggleWithdrawModal: () => void;
}

export const useWithdrawalStore = create<WithdrawalState>((set) => ({
  isMobileWithdrawOptionsOpen: false,
  isWithdrawModalOpen: false,
  isSuccessModalOpen: false,
  openWithdrawModal: () => set({ isWithdrawModalOpen: true }),
  closeWithdrawModal: () => set({ isWithdrawModalOpen: false }),
  openMobileWithdrawOptions: () => set({ isMobileWithdrawOptionsOpen: true }),
  closeMobileWithdrawOptions: () => set({ isMobileWithdrawOptionsOpen: false }),
  openSuccessModal: () => set({ isSuccessModalOpen: true }),
  closeSuccessModal: () => set({ isSuccessModalOpen: false }),
  toggleWithdrawModal: () =>
    set((state) => ({ isWithdrawModalOpen: !state.isWithdrawModalOpen })),
}));
