"use client";

import {
  createContext,
  useContext,
  type KeyboardEvent,
  type ReactNode,
} from "react";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tabs parts must be used inside <Tabs>");
  return context;
}

export function Tabs({
  value,
  onValueChange,
  children,
}: TabsContextValue & { children: ReactNode }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      {children}
    </TabsContext.Provider>
  );
}

/** Left/right/home/end move between tabs and select them, as in the ARIA tabs pattern. */
export function TabsList({
  children,
  ...rest
}: {
  children: ReactNode;
  "aria-label"?: string;
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (index === -1) return;
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  }

  return (
    <div
      role="tablist"
      onKeyDown={handleKeyDown}
      className="inline-flex gap-1 rounded-md border p-1"
      {...rest}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const { value: selectedValue, onValueChange } = useTabs();
  const selected = selectedValue === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={() => onValueChange(value)}
      className={`rounded px-3 py-1 text-sm ${
        selected ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}
