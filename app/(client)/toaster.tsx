"use client";

import { useEffect, useState } from "react";

export function Toaster() {
  const [toasts, setToasts] = useState<
    {
      id: number;
      type: "success" | "error" | "info";
      message: string;
    }[]
  >([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { id } = customEvent.detail;
      setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    window.addEventListener("notify", handler);
    return () => window.removeEventListener("notify", handler);
  }, []);

  return (
    <div>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "white",
            padding: "16px 24px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            color: toast.type === "error" ? "#ef4444" : "#1f2937",
            animation: "slide-in 0.3s ease-out",
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
