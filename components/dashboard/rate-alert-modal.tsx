"use client";

import { useState, useEffect, useMemo } from "react";
import { Bell, BellOff, Trash2, Plus, X } from "lucide-react";
import {
  getRateAlerts,
  addRateAlert,
  removeRateAlert,
  RateAlert,
} from "@/lib/utils/rate-alerts";

interface RateAlertModalProps {
  pair: string;
  currentRate: number;
}

export function RateAlertModal({ pair, currentRate }: RateAlertModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [targetRate, setTargetRate] = useState("");
  const [alerts, setAlerts] = useState<RateAlert[]>([]);

  useEffect(() => {
    setAlerts(getRateAlerts());
    const handler = () => setAlerts(getRateAlerts());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const pairAlerts = useMemo(
    () => alerts.filter((a) => a.pair === pair),
    [alerts, pair],
  );

  const handleAdd = () => {
    const rate = parseFloat(targetRate);
    if (isNaN(rate) || rate <= 0) return;
    addRateAlert({ pair, condition, targetRate: rate });
    setAlerts(getRateAlerts());
    setTargetRate("");
  };

  const handleRemove = (id: string) => {
    removeRateAlert(id);
    setAlerts(getRateAlerts());
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1 text-muted-foreground hover:text-primary transition-colors rounded-full -m-1 ml-1"
        aria-label={`Set rate alert for ${pair}`}
      >
        <Bell className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-background rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-foreground">
                  Rate Alert — {pair}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4">
                <div className="text-sm text-muted-foreground">
                  Current rate:{" "}
                  <span className="font-semibold text-foreground">
                    ₦{currentRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCondition("above")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      condition === "above"
                        ? "bg-green-500/10 text-green-600 border border-green-500/30"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    Goes above
                  </button>
                  <button
                    onClick={() => setCondition("below")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      condition === "below"
                        ? "bg-red-500/10 text-red-600 border border-red-500/30"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    Goes below
                  </button>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Target rate (₦)
                  </label>
                  <input
                    type="number"
                    value={targetRate}
                    onChange={(e) => setTargetRate(e.target.value)}
                    placeholder="e.g. 1500.00"
                    className="w-full mt-1 px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  onClick={handleAdd}
                  disabled={!targetRate || parseFloat(targetRate) <= 0}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                  Create Alert
                </button>
              </div>

              {pairAlerts.length > 0 && (
                <div className="px-5 py-4 border-t border-border space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Active alerts for {pair}
                  </p>
                  {pairAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg"
                    >
                      <span className="text-sm text-foreground">
                        {alert.condition === "above" ? "↑" : "↓"} ₦
                        {alert.targetRate.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <button
                        onClick={() => handleRemove(alert.id)}
                        className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                        aria-label="Remove alert"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
