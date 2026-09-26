"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/hooks/use-toast-store";

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-bottom-2 fade-in",
            t.variant === "success" &&
              "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200",
            t.variant === "error" &&
              "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200",
            t.variant === "info" &&
              "bg-card border-border text-foreground",
          )}
        >
          {t.variant === "success" && (
            <CheckCircle2 className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          {t.variant === "error" && (
            <XCircle className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          {t.variant === "info" && (
            <Info className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <p className="text-sm font-medium flex-1">{t.message}</p>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="shrink-0 rounded p-0.5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
