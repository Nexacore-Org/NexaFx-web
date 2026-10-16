"use client";

import { useState } from "react";

type EmptyStateVariant = "empty" | "error" | "no-results";

interface EmptyStateProps {
  variant: EmptyStateVariant;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  retry?: () => void;
}

export function EmptyState({
  variant,
  title,
  description,
  action,
  retry,
}: EmptyStateProps) {
  const [showRetry, setShowRetry] = useState(false);

  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      {variant === "error" && (
        <div style={{ marginBottom: "16px" }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            style={{ margin: "0 auto 12px" }}
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          <p style={{ color: "#ef4444", fontSize: "14px" }}>
            Error loading data
          </p>
        </div>
      )}

      <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>{title}</h3>

      {description && (
        <p style={{ color: "#6b7280", marginBottom: "24px" }}>{description}</p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          style={{
            background: "#3b82f6",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          {action.label}
        </button>
      )}

      {variant === "error" && retry && showRetry && (
        <button
          onClick={retry}
          style={{
            marginTop: "12px",
            background: "#f59e0b",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
