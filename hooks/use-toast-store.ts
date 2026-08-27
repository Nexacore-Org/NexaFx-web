import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message, variant = "info") => {
    const id = `toast-${++toastCounter}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

function showToast(message: string, variant: ToastVariant = "info") {
  useToastStore.getState().show(message, variant);
}

/**
 * Toast utility. Callable as `toast(message, variant)` (existing usage) and also
 * exposes `toast.success/error/info/dismiss` convenience helpers so callers don't
 * have to pass a variant string. The <Toaster /> is already mounted in the root
 * layout, so these never throw for lack of a provider.
 */
export const toast = Object.assign(showToast, {
  success: (message: string) => useToastStore.getState().show(message, "success"),
  error: (message: string) => useToastStore.getState().show(message, "error"),
  info: (message: string) => useToastStore.getState().show(message, "info"),
  dismiss: (id?: string) => {
    const state = useToastStore.getState();
    if (id) {
      state.dismiss(id);
    } else {
      state.toasts.forEach((t) => state.dismiss(t.id));
    }
  },
});
