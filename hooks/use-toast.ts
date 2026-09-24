"use client";

import { create } from "zustand";

type ToastState = {
  message: string | null;
  open: boolean;
  showToast: (message: string, duration?: number) => void;
  hideToast: () => void;
};

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  open: false,
  showToast: (message, duration = 2500) => {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    set({ message, open: true });

    toastTimer = setTimeout(() => {
      set({ open: false });
      toastTimer = null;
    }, duration);
  },
  hideToast: () => {
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }

    set({ open: false, message: null });
  },
}));

export const showToast = (message: string, duration?: number) => {
  useToastStore.getState().showToast(message, duration);
};
