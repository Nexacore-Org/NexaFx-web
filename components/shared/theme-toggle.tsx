"use client";

import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"system" | "light" | "dark">(() => {
    if (typeof window === "undefined") return "system";
    const stored = window.localStorage.getItem("theme");
    return stored === "light" || stored === "dark" ? stored : "system";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "system") {
      root.classList.remove("light", "dark");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      root.classList.add(prefersDark ? "dark" : "light");
    } else {
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  return [theme, setTheme];
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [isOpen, setIsOpen] = useState(false);

  const toggleTheme = (t: "system" | "light" | "dark") => {
    setTheme(t);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
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
            onClick={() => toggleTheme("light")}
            style={{
              width: "100%",
              padding: "8px",
              textAlign: "left",
              margin: "4px 0",
              border: "none",
              background: theme === "light" ? "#e5e7eb" : "transparent",
              color: theme === "light" ? "#1f2937" : "#f9fafb",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Light
          </button>
          <button
            onClick={() => toggleTheme("dark")}
            style={{
              width: "100%",
              padding: "8px",
              textAlign: "left",
              margin: "4px 0",
              border: "none",
              background: theme === "dark" ? "#1f2937" : "transparent",
              color: theme === "dark" ? "#f9fafb" : "#1f2937",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Dark
          </button>
          <button
            onClick={() => toggleTheme("system")}
            style={{
              width: "100%",
              padding: "8px",
              textAlign: "left",
              margin: "4px 0",
              border: "none",
              background: theme === "system" ? "#e5e7eb" : "transparent",
              color: theme === "system" ? "#1f2937" : "#f9fafb",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            System
          </button>
        </div>
      )}
    </div>
  );
}
