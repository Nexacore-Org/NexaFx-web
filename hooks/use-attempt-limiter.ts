"use client";

import { useState, useEffect, useCallback } from "react";

const DELAY_MAP = [0, 15000, 30000, 60000];

type AttemptLimiterHook = {
  failedAttempts: number;
  isLocked: boolean;
  timeRemaining: number | null;
  increment: () => void;
  reset: () => void;
  getDelay: (attempt: number) => number;
};

export function useAttemptLimiter(): AttemptLimiterHook {
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const getDelay = useCallback((attempt: number) => {
    return DELAY_MAP[attempt] ?? 60000;
  }, []);

  const increment = useCallback(() => {
    setFailedAttempts((prev) => {
      const next = prev + 1;
      setIsLocked(next >= 3);
      setTimeRemaining(DELAY_MAP[next] ?? 60000);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setFailedAttempts(0);
    setIsLocked(false);
    setTimeRemaining(null);
  }, []);

  useEffect(() => {
    if (isLocked && timeRemaining !== null) {
      const timer = setTimeout(() => {
        reset();
      }, timeRemaining);
      return () => clearTimeout(timer);
    }
  }, [isLocked, timeRemaining, reset]);

  return {
    failedAttempts,
    isLocked,
    timeRemaining,
    increment,
    reset,
    getDelay,
  };
}
