"use client";

import { useEffect, useState } from "react";

/** Milliseconds until `expiresAt`, ticking once a second and never below 0. */
export function useRemainingMs(expiresAt: string): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return Math.max(0, new Date(expiresAt).getTime() - now);
}
