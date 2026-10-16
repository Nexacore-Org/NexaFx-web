"use client";

import { usePrefersReducedMotion } from "../../hooks/use-prefers-reduced-motion";

const SIZES: Record<"sm" | "md" | "lg", string> = {
  sm: "8px",
  md: "16px",
  lg: "24px",
};

export function Spinner({
  size = "md",
  label,
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const sizeValue = SIZES[size] ?? SIZES.md;

  return (
    <div
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{
        width: sizeValue,
        height: sizeValue,
        border: "3px solid #e5e7eb",
        borderTopColor: "#3b82f6",
        borderRadius: "50%",
        animation: reducedMotion
          ? undefined
          : "spinner-spin 1s linear infinite",
      }}
    />
  );
}
