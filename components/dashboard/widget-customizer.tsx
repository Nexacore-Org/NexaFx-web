"use client";

import { useState, useEffect } from "react";
import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WidgetPreferences {
  showAccountOverview: boolean;
  showQuickActions: boolean;
  showMarketOverview: boolean;
  showRecentTransactions: boolean;
}

const DEFAULT_PREFERENCES: WidgetPreferences = {
  showAccountOverview: true,
  showQuickActions: true,
  showMarketOverview: true,
  showRecentTransactions: true,
};

export function useWidgetPreferences() {
  const [preferences, setPreferences] = useState<WidgetPreferences>(DEFAULT_PREFERENCES);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("dashboard-widgets");
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse widget preferences", e);
      }
    }
  }, []);

  const updatePreference = (key: keyof WidgetPreferences, value: boolean) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    localStorage.setItem("dashboard-widgets", JSON.stringify(next));
  };

  return { preferences, updatePreference, mounted };
}

export function WidgetCustomizer({
  preferences,
  updatePreference,
}: {
  preferences: WidgetPreferences;
  updatePreference: (key: keyof WidgetPreferences, value: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
      >
        <Settings2 className="w-4 h-4" />
        Customize Dashboard
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border shadow-xl rounded-xl p-4 space-y-4">
          <h4 className="font-semibold text-sm">Visible Widgets</h4>
          <div className="space-y-3">
            {[
              { id: "showAccountOverview", label: "Account Overview" },
              { id: "showQuickActions", label: "Quick Actions" },
              { id: "showMarketOverview", label: "Market Overview" },
              { id: "showRecentTransactions", label: "Recent Transactions" },
            ].map((widget) => (
              <label key={widget.id} className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {widget.label}
                </span>
                <input
                  type="checkbox"
                  checked={preferences[widget.id as keyof WidgetPreferences]}
                  onChange={(e) => updatePreference(widget.id as keyof WidgetPreferences, e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-background bg-background"
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
