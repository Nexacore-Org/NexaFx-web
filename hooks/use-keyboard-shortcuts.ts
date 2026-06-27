"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface Shortcut {
  keys: string[];
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(
  shortcuts: Shortcut[],
  onToggleModal?: () => void,
  onCloseModal?: () => void,
) {
  const router = useRouter();
  const bufferRef = useRef<string[]>([]);
  const bufferTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isInputFocused = useCallback(() => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    const role = document.activeElement?.getAttribute("role");
    return (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      role === "textbox"
    );
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isInputFocused()) return;

      if (e.key === "?") {
        e.preventDefault();
        onToggleModal?.();
        return;
      }

      if (e.key === "Escape") {
        onCloseModal?.();
        return;
      }

      if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        bufferRef.current = ["g"];
        if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
        bufferTimeoutRef.current = setTimeout(() => {
          bufferRef.current = [];
        }, 500);
        return;
      }

      if (bufferRef.current.length === 1 && bufferRef.current[0] === "g") {
        const combo = `g+${e.key}`;
        const match = shortcuts.find((s) =>
          s.keys.some((k) => k === combo),
        );
        if (match) {
          e.preventDefault();
          bufferRef.current = [];
          if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
          match.action();
          return;
        }
        bufferRef.current = [];
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts, router, isInputFocused, onToggleModal, onCloseModal]);
}
