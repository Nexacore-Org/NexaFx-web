"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export type Theme = "system" | "light" | "dark";

const STORAGE_KEY = "theme";
const listeners = new Set<() => void>();
let currentTheme: Theme = "system";
let hasInitialised = false;

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isTheme(stored) ? stored : "system";
}

function applyThemeClass(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    root.classList.add(prefersDark ? "dark" : "light");
  } else {
    root.classList.add(theme);
  }
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function getSnapshot(): Theme {
  if (!hasInitialised && typeof window !== "undefined") {
    currentTheme = readStoredTheme();
    hasInitialised = true;
  }
  return currentTheme;
}

function getServerSnapshot(): Theme {
  return "system";
}

export function setTheme(theme: Theme) {
  currentTheme = theme;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors (private mode, quota, etc.)
    }
  }
  applyThemeClass(theme);
  listeners.forEach((listener) => listener());
}

export function useTheme(): [Theme, (theme: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Synchronise the document with the current theme. This is a DOM side
  // effect (no setState), so it does not trip the set-state-in-effect rule.
  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  return [theme, setTheme];
}

export function ThemeToggle() {
  const [theme] = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "6px 12px",
          background: "transparent",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Theme: {theme === "system" ? "System" : theme}
      </button>

      {isOpen && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "8px",
            minWidth: "120px",
            zIndex: 100,
          }}
        >
          <button
            type="button"
            role="menuitemradio"
            aria-checked={theme === "light"}
            onClick={() => {
              setTheme("light");
              setIsOpen(false);
            }}
            style={menuItemStyle(theme === "light")}
          >
            Light
          </button>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={theme === "dark"}
            onClick={() => {
              setTheme("dark");
              setIsOpen(false);
            }}
            style={menuItemStyle(theme === "dark")}
          >
            Dark
          </button>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={theme === "system"}
            onClick={() => {
              setTheme("system");
              setIsOpen(false);
            }}
            style={menuItemStyle(theme === "system")}
          >
            System
          </button>
        </div>
      )}
    </div>
  );
}

function menuItemStyle(active: boolean): React.CSSProperties {
  return {
    width: "100%",
    padding: "8px",
    textAlign: "left",
    margin: "4px 0",
    border: "none",
    background: active ? "#e5e7eb" : "transparent",
    color: "#1f2937",
    borderRadius: "4px",
    cursor: "pointer",
  };
}
