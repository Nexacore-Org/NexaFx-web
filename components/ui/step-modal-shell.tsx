"use client";

import { useRef } from "react";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface StepModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  ariaLabel: string;
  closeDisabled?: boolean;
  children: React.ReactNode;
}

export function StepModalShell({
  isOpen,
  onClose,
  ariaLabel,
  closeDisabled = false,
  children,
}: StepModalShellProps) {
  const desktopModalRef = useRef<HTMLDivElement>(null);
  const mobileModalRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (closeDisabled) return;
    onClose();
  };

  // Use focus trap for desktop modal
  useFocusTrap(isOpen, handleClose, desktopModalRef);

  // Use focus trap for mobile modal
  useFocusTrap(isOpen, handleClose, mobileModalRef);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeDisabled) return;
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal - Desktop */}
      <div
        ref={desktopModalRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={cn(
          "fixed z-50 animate-in fade-in slide-in-from-bottom-4 duration-300",
          // Desktop: centered modal
          "hidden md:flex md:items-center md:justify-center md:inset-0 md:p-4",
        )}
        onClick={handleBackdropClick}
      >
        <div className="relative w-full max-w-md bg-card rounded-xl shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={closeDisabled}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
            aria-label={`Close ${ariaLabel.toLowerCase()}`}
          >
            <X className="size-5 text-muted-foreground" />
          </button>
          {children}
        </div>
      </div>

      {/* Modal - Mobile (Full Screen) */}
      <div
        ref={mobileModalRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          "bg-card animate-in slide-in-from-bottom duration-300",
        )}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={closeDisabled}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
          aria-label={`Close ${ariaLabel.toLowerCase()}`}
        >
          <X className="size-5 text-muted-foreground" />
        </button>
        <div className="h-full overflow-y-auto">{children}</div>
      </div>
    </>
  );
}