"use client";

import { useSyncExternalStore } from "react";

const listenersByKey = new Map<string, Set<() => void>>();
const values = new Map<string, boolean>();
const hydratedKeys = new Set<string>();

function getListeners(key: string): Set<() => void> {
  let listeners = listenersByKey.get(key);
  if (!listeners) {
    listeners = new Set();
    listenersByKey.set(key, listeners);
  }
  return listeners;
}

function readStored(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === "true";
  } catch {
    return fallback;
  }
}

function emit(key: string): void {
  listenersByKey.get(key)?.forEach((listener) => listener());
}

/**
 * A boolean flag persisted in localStorage and shared across every component
 * reading the same key. `useSyncExternalStore` keeps SSR and client render in
 * sync without a setState-in-effect hydration mismatch.
 */
export function usePersistedFlag(
  key: string,
  defaultValue = false,
): [boolean, (value: boolean) => void] {
  const value = useSyncExternalStore(
    (listener) => {
      const listeners = getListeners(key);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => {
      if (!hydratedKeys.has(key)) {
        values.set(key, readStored(key, defaultValue));
        hydratedKeys.add(key);
      }
      return values.get(key) ?? defaultValue;
    },
    () => defaultValue,
  );

  const set = (next: boolean) => {
    values.set(key, next);
    hydratedKeys.add(key);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, String(next));
      } catch {
        // Ignore storage failures (private mode, quota, etc.)
      }
    }
    emit(key);
  };

  return [value, set];
}
