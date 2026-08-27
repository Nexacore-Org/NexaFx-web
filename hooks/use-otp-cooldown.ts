"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface OtpCooldownOptions {
  cooldownSeconds?: number;
  maxResends?: number;
}

interface OtpCooldownResult {
  canResend: boolean;
  secondsRemaining: number;
  resendCount: number;
  maxReached: boolean;
  startCooldown: () => void;
}

export function useOtpCooldown(
  options: OtpCooldownOptions = {}
): OtpCooldownResult {
  const { cooldownSeconds = 60, maxResends = 3 } = options;

  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("otp-cooldown");
    if (stored) {
      try {
        const { expiresAt, count } = JSON.parse(stored);
        const remaining = Math.max(
          0,
          Math.ceil((expiresAt - Date.now()) / 1000)
        );
        if (remaining > 0) {
          setSecondsRemaining(remaining);
          setResendCount(count ?? 0);
        } else {
          setResendCount(count ?? 0);
          sessionStorage.removeItem("otp-cooldown");
        }
      } catch {
        sessionStorage.removeItem("otp-cooldown");
      }
    }
  }, []);

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
  }, [secondsRemaining > 0]);

  const startCooldown = useCallback(() => {
    const newCount = resendCount + 1;
    setResendCount(newCount);

    if (newCount >= maxResends) {
      setSecondsRemaining(0);
      sessionStorage.removeItem("otp-cooldown");
      return;
    }

    const expiresAt = Date.now() + cooldownSeconds * 1000;
    sessionStorage.setItem(
      "otp-cooldown",
      JSON.stringify({ expiresAt, count: newCount })
    );
    setSecondsRemaining(cooldownSeconds);
  }, [cooldownSeconds, maxResends, resendCount]);

  const maxReached = resendCount >= maxResends;
  const canResend = secondsRemaining === 0 && !maxReached;

  return {
    canResend,
    secondsRemaining,
    resendCount,
    maxReached,
    startCooldown,
  };
}
