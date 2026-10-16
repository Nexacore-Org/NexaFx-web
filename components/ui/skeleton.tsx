"use client";

import { usePrefersReducedMotion } from "../../hooks/use-prefers-reduced-motion";

export function Skeleton({
  width = "100%",
  height = "16px",
  animation = true,
}: {
  width?: string;
  height?: string;
  animation?: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        backgroundColor: "#e5e7eb",
        borderRadius: "4px",
        animation:
          animation && !reducedMotion
            ? "skeleton-pulse 1.5s ease-in-out infinite"
            : undefined,
      }}
    />
  );
}
