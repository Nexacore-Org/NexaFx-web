"use client";

import { useCallback, useRef, useState } from "react";
import { generateIdempotencyKey } from "@/lib/idempotency";

export interface UseSubmitOnceOptions {
  /**
   * When true (default) a new idempotency key is generated on each fresh
   * submission. Automatic retries should reuse the same key — the caller is
   * responsible for that by not re-calling the handler for retries.
   */
  generateKey?: boolean;
}

export interface UseSubmitOnceResult<TArgs extends unknown[], TResult> {
  /** Wrapped handler — ignores calls made while a submission is in flight. */
  handleSubmit: (...args: TArgs) => Promise<TResult | undefined>;
  /** True while the wrapped handler is executing. */
  isSubmitting: boolean;
  /** The idempotency key for the current (or last) submission. */
  idempotencyKey: string | null;
  /** Reset submitting state, e.g. after an error that the user wants to retry. */
  reset: () => void;
}

/**
 * Wraps an async submit handler so that:
 * 1. Calls made while one is already in flight are silently ignored.
 * 2. Each new user-initiated submission gets a fresh idempotency key.
 * 3. `isSubmitting` is set to `true` for the duration of the call.
 *
 * @example
 * const { handleSubmit, isSubmitting } = useSubmitOnce(async (data) => {
 *   await createWithdrawal(data);
 * });
 */
export function useSubmitOnce<TArgs extends unknown[], TResult>(
  handler: (...args: TArgs) => Promise<TResult>,
  options: UseSubmitOnceOptions = {},
): UseSubmitOnceResult<TArgs, TResult> {
  const { generateKey = true } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const handleSubmit = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      // Ignore calls while a submission is already in flight.
      if (inFlightRef.current) return undefined;

      const key = generateKey ? generateIdempotencyKey() : (idempotencyKey ?? generateIdempotencyKey());

      inFlightRef.current = true;
      setIsSubmitting(true);
      setIdempotencyKey(key);

      try {
        return await handler(...args);
      } finally {
        inFlightRef.current = false;
        setIsSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handler, generateKey],
  );

  const reset = useCallback(() => {
    inFlightRef.current = false;
    setIsSubmitting(false);
  }, []);

  return { handleSubmit, isSubmitting, idempotencyKey, reset };
}
