"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function Skeleton({
  width = "100%",
  height = "16px",
  animation = true,
}: {
  width?: string | number;
  height?: string | number;
  animation?: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const animate = animation && !reducedMotion;

  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        backgroundColor: "#e5e7eb",
        borderRadius: "4px",
        animation: animate
          ? "skeleton-pulse 1.5s ease-in-out infinite"
          : undefined,
      }}
    />
  );
}
