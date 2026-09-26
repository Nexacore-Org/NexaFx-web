"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Client-side progressive backoff after repeated failed OTP *verification*
 * attempts (distinct from useOtpCooldown, which throttles *resend* clicks).
 * This is defense-in-depth alongside whatever the backend already enforces,
 * not a replacement for it -- a determined attacker can always bypass
 * client-side state, but this raises the practical cost of an automated
 * guessing attempt directly in the browser and gives a legitimate user a
 * clear, explained pause instead of unlimited instant retries.
 *
 * The first FREE_ATTEMPTS failures never trigger a delay, since a typo or
 * two is normal. After that, the delay grows exponentially up to a cap.
 * State persists in sessionStorage so a page refresh doesn't reset it.
 */

const FREE_ATTEMPTS = 2;
const BASE_DELAY_SECONDS = 5;
const MAX_DELAY_SECONDS = 60;

function delayForAttempt(failedAttempts: number): number {
  if (failedAttempts <= FREE_ATTEMPTS) return 0;
  const exponent = failedAttempts - FREE_ATTEMPTS - 1;
  return Math.min(BASE_DELAY_SECONDS * 2 ** exponent, MAX_DELAY_SECONDS);
}

interface OtpVerifyBackoffResult {
  /** True while the submit action should be blocked. */
  isBlocked: boolean;
  secondsRemaining: number;
  failedAttempts: number;
  /** Call after a failed verification attempt to start/extend the backoff. */
  registerFailure: () => void;
  /** Call after a successful verification (or when leaving the flow). */
  reset: () => void;
}

export function useOtpVerifyBackoff(
  storageKey: string,
): OtpVerifyBackoffResult {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(storageKey);
    if (!stored) return;
    try {
      const { expiresAt, failedAttempts: storedFailures } = JSON.parse(stored);
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setFailedAttempts(storedFailures ?? 0);
      if (remaining > 0) {
        setSecondsRemaining(remaining);
      } else {
        sessionStorage.removeItem(storageKey);
      }
    } catch {
      sessionStorage.removeItem(storageKey);
    }
    // Only read the persisted backoff once, on mount for this key.
  }, [storageKey]);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          sessionStorage.removeItem(storageKey);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsRemaining > 0]);

  const registerFailure = useCallback(() => {
    setFailedAttempts((prevFailures) => {
      const nextFailures = prevFailures + 1;
      const delay = delayForAttempt(nextFailures);

      if (delay > 0) {
        const expiresAt = Date.now() + delay * 1000;
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({ expiresAt, failedAttempts: nextFailures }),
        );
        setSecondsRemaining(delay);
      }

      return nextFailures;
    });
  }, [storageKey]);

  const reset = useCallback(() => {
    sessionStorage.removeItem(storageKey);
    setFailedAttempts(0);
    setSecondsRemaining(0);
  }, [storageKey]);

  return {
    isBlocked: secondsRemaining > 0,
    secondsRemaining,
    failedAttempts,
    registerFailure,
    reset,
  };
}
