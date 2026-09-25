"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Shows the shared loading spinner + label and disables the button. */
  loading?: boolean;
  /** Text rendered next to the spinner while `loading` is true. */
  loadingLabel?: string;
}

/**
 * Shared form submit button (Issue #863).
 *
 * Standardises the loading state across every form: while `loading` is true
 * the button is disabled, marked `aria-busy`, and renders a spinner + label
 * instead of the normal children. Each call site still fully controls its
 * appearance through `className`, so the migrated forms keep their existing
 * look while gaining one consistent loading affordance.
 */
export function SubmitButton({
  loading = false,
  loadingLabel,
  children,
  disabled,
  className,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      aria-busy={loading}
      className={className}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          {loadingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
