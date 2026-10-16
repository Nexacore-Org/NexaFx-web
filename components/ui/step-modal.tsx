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
  initialStep?: number;
  onClose: () => void;
  /** Rendered on the final step in place of the default Next button. */
  finishLabel?: string;
  onFinish?: () => void;
  /** Disables Next/Finish while an async action is in flight. */
  busy?: boolean;
  /** Hides the step navigation when the flow is a single step. */
  hideSteps?: boolean;
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
  initialStep = 0,
  onClose,
  finishLabel = "Done",
  onFinish,
  busy = false,
  hideSteps = false,
}: StepModalProps) {
  // Return to the first step each time the modal is opened. Adjusting state
  // during render is React's supported alternative to resetting in an effect,
  // which would trigger an extra cascading render.
  const [index, setIndex] = useState(initialStep);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    setIndex(initialStep);
  }
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const isLast = index === steps.length - 1;

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

  const step = steps[index];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        {!hideSteps && steps.length > 1 && (
          <ol
            aria-label="Progress"
            className="mb-4 flex gap-1 text-xs text-zinc-500"
          >
            {steps.map((s, i) => (
              <li
                key={s.id}
                aria-current={i === index ? "step" : undefined}
                className={`flex-1 rounded px-2 py-1 ${
                  i === index
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : i < index
                      ? "bg-zinc-200 dark:bg-zinc-800"
                      : "bg-zinc-100 dark:bg-zinc-900"
                }`}
              >
                {i + 1}. {s.title}
              </li>
            ))}
          </ol>
        )}

        <div className="mb-6">{step?.content}</div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0 || busy}
            className="rounded border border-zinc-300 px-4 py-2 text-sm disabled:opacity-40 dark:border-zinc-700"
          >
            Back
          </button>

          {isLast && onFinish ? (
            <button
              type="button"
              onClick={onFinish}
              disabled={busy}
              className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {finishLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
              disabled={busy}
              className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
