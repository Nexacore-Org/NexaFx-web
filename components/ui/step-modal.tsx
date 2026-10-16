"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface StepModalStep {
  id: string;
  title: string;
  content: ReactNode;
}

export interface StepModalProps {
  open: boolean;
  title: string;
  steps: StepModalStep[];
  currentStepIndex?: number;
  onStepChange?: (index: number) => void;
  initialStep?: number;
  onClose: () => void;
  finishLabel?: string;
  onFinish?: () => void;
  busy?: boolean;
  hideSteps?: boolean;
  hideFooter?: boolean;
}

/**
 * Modal container for multi-step flows (KYC wizard, 2FA setup).
 *
 * Handles focus trapping, Escape to close, backdrop click, and restoring
 * focus to the trigger on close. Callers own the sensitive state and are
 * responsible for clearing it in `onClose`.
 */
export default function StepModal({
  open,
  title,
  steps,
  currentStepIndex,
  onStepChange,
  initialStep = 0,
  onClose,
  finishLabel = "Done",
  onFinish,
  busy = false,
  hideSteps = false,
  hideFooter = false,
}: StepModalProps) {
  const [internalIndex, setInternalIndex] = useState(initialStep);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    setInternalIndex(initialStep);
  }

  const activeIndex =
    currentStepIndex !== undefined ? currentStepIndex : internalIndex;
  const setIndex = (idx: number | ((prev: number) => number)) => {
    const nextIdx = typeof idx === "function" ? idx(activeIndex) : idx;
    setInternalIndex(nextIdx);
    onStepChange?.(nextIdx);
  };

  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const isLast = activeIndex === steps.length - 1;

  const focusables = useCallback(() => {
    const root = dialogRef.current;
    if (!root) return [] as HTMLElement[];
    return Array.from(
      root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
  }, []);

  // Escape closes, Tab is trapped inside the dialog.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, focusables]);

  // Move focus into the dialog on open and restore it on close.
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => {
      const items = focusables();
      (items[0] ?? dialogRef.current)?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      previouslyFocused.current?.focus?.();
    };
  }, [open, focusables]);

  // Lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const step = steps[activeIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900 dark:text-zinc-100"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2
            id={titleId}
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {!hideSteps && steps.length > 1 && (
          <ol
            aria-label="Progress"
            className="mb-6 flex gap-1.5 text-xs text-zinc-500 dark:text-zinc-400"
          >
            {steps.map((s, i) => (
              <li
                key={s.id}
                aria-current={i === activeIndex ? "step" : undefined}
                className={`flex-1 rounded-md px-2.5 py-1.5 text-center transition ${
                  i === activeIndex
                    ? "bg-zinc-900 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : i < activeIndex
                      ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                      : "bg-zinc-100 dark:bg-zinc-800/50"
                }`}
              >
                <span className="sr-only">Step </span>
                {i + 1}. {s.title}
              </li>
            ))}
          </ol>
        )}

        <div className="mb-6">{step?.content}</div>

        {!hideFooter && (
          <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={activeIndex === 0 || busy}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Back
            </button>

            {isLast && onFinish ? (
              <button
                type="button"
                onClick={onFinish}
                disabled={busy}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {finishLabel}
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setIndex((i) => Math.min(steps.length - 1, i + 1))
                }
                disabled={busy}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export { StepModal };
