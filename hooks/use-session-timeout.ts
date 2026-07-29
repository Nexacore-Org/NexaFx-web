"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseSessionTimeoutProps {
  warningBeforeMs?: number;
  onWarn: () => void;
  onTimeout: () => void;
}

export function useSessionTimeout({
  warningBeforeMs = 2 * 60 * 1000, // Default: 2 minutes
  onWarn,
  onTimeout,
}: UseSessionTimeoutProps) {
  const sessionDurationMs = Number(
    process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MS || 30 * 60 * 1000, // Default: 30 minutes
  );
  
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isWarningShownRef = useRef(false);

  const resetTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    isWarningShownRef.current = false;
    lastActivityRef.current = Date.now();
  }, []);

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // If warning was shown, reset timers on activity
    if (isWarningShownRef.current) {
      resetTimers();
      startTimers();
    }
  }, [resetTimers]);

  const startTimers = useCallback(() => {
    const warningTime = sessionDurationMs - warningBeforeMs;
    
    // Set warning timer
    warningTimerRef.current = setTimeout(() => {
      isWarningShownRef.current = true;
      onWarn();
    }, warningTime);

    // Set timeout timer
    inactivityTimerRef.current = setTimeout(() => {
      onTimeout();
    }, sessionDurationMs);
  }, [sessionDurationMs, warningBeforeMs, onWarn, onTimeout]);

  useEffect(() => {
    // Start timers on mount
    startTimers();

    // Track user activity events
    const events = ["mousemove", "keydown", "click", "scroll"];
    
    const activityHandler = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      // Only reset if enough time has passed (debounce)
      if (timeSinceLastActivity > 1000) {
        handleActivity();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, activityHandler);
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, activityHandler);
      });
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, [startTimers, handleActivity]);

  const resetSession = useCallback(() => {
    resetTimers();
    startTimers();
  }, [resetTimers, startTimers]);

  return { resetSession };
}
