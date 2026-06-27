"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ShortcutEntry {
  keys: string;
  description: string;
}

const DEFAULT_SHORTCUTS: ShortcutEntry[] = [
  { keys: "g + d", description: "Go to Dashboard" },
  { keys: "g + t", description: "Go to Transactions" },
  { keys: "g + s", description: "Go to Settings" },
  { keys: "g + h", description: "Go to Home" },
  { keys: "?", description: "Toggle this modal" },
  { keys: "Esc", description: "Close any open modal" },
];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: ShortcutEntry[];
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
  shortcuts,
}: KeyboardShortcutsModalProps) {
  const items = shortcuts ?? DEFAULT_SHORTCUTS;

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.keys}
              className="flex items-center justify-between py-2"
            >
              <span className="text-sm text-gray-600">{item.description}</span>
              <kbd className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
                {item.keys}
              </kbd>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-200 rounded">?</kbd> to toggle this modal at any time
          </p>
        </div>
      </div>
    </>
  );
}
