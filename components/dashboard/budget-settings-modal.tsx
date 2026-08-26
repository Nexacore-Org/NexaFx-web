"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Budget, getBudget, setBudget } from "@/lib/utils/budget";

interface BudgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function BudgetSettingsModal({
  isOpen,
  onClose,
  onSave,
}: BudgetSettingsModalProps) {
  const [conversionLimit, setConversionLimit] = useState("");
  const [withdrawalLimit, setWithdrawalLimit] = useState("");
  const [currency, setCurrency] = useState("NGN");

  useEffect(() => {
    if (isOpen) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const budget = getBudget(currentMonth);
      if (budget) {
        setConversionLimit(String(budget.conversionLimit));
        setWithdrawalLimit(String(budget.withdrawalLimit));
        setCurrency(budget.currency);
      } else {
        setConversionLimit("");
        setWithdrawalLimit("");
        setCurrency("NGN");
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const budget: Budget = {
      month: currentMonth,
      conversionLimit: Number(conversionLimit) || 0,
      withdrawalLimit: Number(withdrawalLimit) || 0,
      currency,
    };
    setBudget(budget);
    onSave();
    onClose();
  };

  const handleReset = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const budget: Budget = {
      month: currentMonth,
      conversionLimit: 0,
      withdrawalLimit: 0,
      currency: "NGN",
    };
    setBudget(budget);
    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card text-card-foreground rounded-xl p-6 shadow-2xl border border-border/50 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Budget Settings</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Monthly Conversion Limit
              </label>
              <input
                type="number"
                value={conversionLimit}
                onChange={(e) => setConversionLimit(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="e.g., 500000"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Monthly Withdrawal Limit
              </label>
              <input
                type="number"
                value={withdrawalLimit}
                onChange={(e) => setWithdrawalLimit(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="e.g., 1000000"
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-muted hover:bg-muted/80 rounded-lg"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
