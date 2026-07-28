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
    </div>
  );
}
