"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) {
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Close on Escape, trap focus
  React.useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const dialog = closeButtonRef.current?.closest("dialog");
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      <dialog
        open
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "bottom-sheet-title" : undefined}
        className={cn(
          "relative z-10 fixed bottom-0 left-0 right-0 w-full rounded-t-2xl border-t border-border bg-background text-foreground shadow-xl p-6 focus:outline-none animate-in slide-in-from-bottom duration-300",
          className,
        )}
        style={{
          paddingBottom:
            "max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom)))",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 id="bottom-sheet-title" className="text-lg font-semibold">
              {title}
            </h2>
          )}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close bottom sheet"
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </dialog>
    </div>
  );
}
