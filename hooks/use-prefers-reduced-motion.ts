"use client";

import { useCallback, useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

/**
 * Tracks the user's reduced-motion preference.
 *
 * Uses `useSyncExternalStore` so the value is read from the browser during
 * render rather than written into state from an effect, which avoids the
 * cascading re-render lint error and the first-paint flash of animation.
 */
export function usePrefersReducedMotion(): boolean {
  const getSnapshot = useCallback(() => window.matchMedia(QUERY).matches, []);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
