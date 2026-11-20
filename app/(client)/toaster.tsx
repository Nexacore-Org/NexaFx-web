"use client";

import { useEffect, useState } from "react";
import {
  dismissToast,
  NOTIFY_DISMISS_EVENT,
  NOTIFY_SHOW_EVENT,
  type ToastMessage,
  type ToastType,
} from "@/lib/notify";

const TOAST_STYLES: Record<ToastType, string> = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  error:
    "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100",
  info: "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
};

/** Single renderer for every notification, stacked bottom-right. */
export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleShow = (event: Event) => {
      const detail = (event as CustomEvent<ToastMessage>).detail;
      if (!detail || typeof detail.id !== "number") return;
      setToasts((previous) => [...previous, detail]);
    };

    const handleDismiss = (event: Event) => {
      const detail = (event as CustomEvent<{ id: number }>).detail;
      if (!detail || typeof detail.id !== "number") return;
      setToasts((previous) => previous.filter((toast) => toast.id !== detail.id));
    };

    window.addEventListener(NOTIFY_SHOW_EVENT, handleShow);
    window.addEventListener(NOTIFY_DISMISS_EVENT, handleDismiss);
    return () => {
      window.removeEventListener(NOTIFY_SHOW_EVENT, handleShow);
      window.removeEventListener(NOTIFY_DISMISS_EVENT, handleDismiss);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed right-0 bottom-0 z-50 flex max-h-screen w-full flex-col items-end gap-2 overflow-y-auto p-4 sm:w-auto"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.type === "error" ? "alert" : undefined}
          className={`pointer-events-auto flex w-full max-w-sm items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${TOAST_STYLES[toast.type]}`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 rounded px-1 leading-none opacity-60 hover:opacity-100"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      ))}
    </div>
  );
}
