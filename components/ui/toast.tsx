"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { useToastStore } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function ToastViewport() {
  const { open, message, hideToast } = useToastStore();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        hideToast();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hideToast]);

  if (!open || !message) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-[100] w-[min(92vw,22rem)] -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/95 px-4 py-3",
          "text-sm font-medium text-white shadow-2xl backdrop-blur",
        )}
      >
        <span>{message}</span>
        <button
          type="button"
          onClick={hideToast}
          className="rounded-full p-1 transition-colors hover:bg-white/15"
          aria-label="Dismiss toast"
        >
          <X className="size-4" />
        </button>
      </div>
import * as React from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast, type ToastType } from "./use-toast";

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="size-4 text-green-500 shrink-0" />,
  error: <XCircle className="size-4 text-destructive shrink-0" />,
  info: <Info className="size-4 text-blue-500 shrink-0" />,
  warning: <AlertTriangle className="size-4 text-yellow-500 shrink-0" />,
};

const styles: Record<ToastType, string> = {
  success: "border-green-200 dark:border-green-800",
  error: "border-destructive/30",
  info: "border-blue-200 dark:border-blue-800",
  warning: "border-yellow-200 dark:border-yellow-800",
};

export function Toaster() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "flex items-start gap-3 rounded-lg border bg-card px-4 py-3 shadow-lg text-card-foreground text-sm min-w-64 max-w-sm",
            styles[t.type]
          )}
        >
          {icons[t.type]}
          <p className="flex-1">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss notification"
            className="text-muted-foreground hover:text-foreground transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
