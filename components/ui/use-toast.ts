"use client";

import { useState, useEffect, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

// Module-level state shared across all hook instances
let listeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

function dispatch(updated: Toast[]) {
  toasts = updated;
  listeners.forEach((l) => l(toasts));
}

function addToast(message: string, type: ToastType = "info") {
  const id = Math.random().toString(36).slice(2);
  dispatch([...toasts, { id, type, message }]);
  setTimeout(() => {
    dispatch(toasts.filter((t) => t.id !== id));
  }, 4000);
}

function removeToast(id: string) {
  dispatch(toasts.filter((t) => t.id !== id));
}

export function useToast() {
  const [state, setState] = useState<Toast[]>(toasts);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter((l) => l !== setState);
    };
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => addToast(message, type),
    []
  );

  return { toasts: state, toast, removeToast };
}
