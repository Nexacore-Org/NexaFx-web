'use client';

import { useCallback } from 'react';

type HapticPattern = number | number[];

const PATTERNS = {
  light: [10] as HapticPattern,
  medium: [20] as HapticPattern,
  heavy: [40] as HapticPattern,
  success: [10, 50, 20] as HapticPattern,
  error: [30, 50, 30, 50, 30] as HapticPattern,
  selection: [5] as HapticPattern,
} as const;

export function useHapticFeedback() {
  const isSupported =
    typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

  const vibrate = useCallback(
    (pattern: HapticPattern) => {
      if (!isSupported) return;
      navigator.vibrate(pattern);
    },
    [isSupported],
  );

  const light = useCallback(() => vibrate(PATTERNS.light), [vibrate]);
  const medium = useCallback(() => vibrate(PATTERNS.medium), [vibrate]);
  const heavy = useCallback(() => vibrate(PATTERNS.heavy), [vibrate]);
  const success = useCallback(() => vibrate(PATTERNS.success), [vibrate]);
  const error = useCallback(() => vibrate(PATTERNS.error), [vibrate]);
  const selection = useCallback(() => vibrate(PATTERNS.selection), [vibrate]);

  return {
    isSupported,
    light,
    medium,
    heavy,
    success,
    error,
    selection,
  };
}
