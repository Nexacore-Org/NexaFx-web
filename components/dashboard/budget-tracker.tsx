"use client";

import { useState, useEffect } from "react";
import { Transaction } from "@/lib/api/transactions";
import { Budget, getBudget, getCurrentMonthSpend } from "@/lib/utils/budget";
import { BudgetSettingsModal } from "./budget-settings-modal";
import { cn } from "@/lib/utils";

interface BudgetTrackerProps {
  transactions: Transaction[];
}

const ProgressBar = ({ title, spent, limit, currency }) => {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const color =
    percentage > 90
      ? "bg-red-500"
      : percentage > 70
        ? "bg-yellow-500"
        : "bg-green-500";

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">
          {spent.toLocaleString()} / {limit.toLocaleString()} {currency}
        </p>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5">
        <div
          className={cn("h-2.5 rounded-full", color)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export function BudgetTracker({ transactions }: BudgetTrackerProps) {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [spend, setSpend] = useState({ converted: 0, withdrawn: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshBudget = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const budgetData = getBudget(currentMonth);
    setBudget(budgetData);

    if (budgetData) {
      const spendData = getCurrentMonthSpend(transactions);
      setSpend(spendData);
    }
  };

  useEffect(() => {
    refreshBudget();
  }, [transactions]);

  useEffect(() => {
    if (budget) {
      const conversionPercentage =
        budget.conversionLimit > 0
          ? (spend.converted / budget.conversionLimit) * 100
          : 0;
      const withdrawalPercentage =
        budget.withdrawalLimit > 0
          ? (spend.withdrawn / budget.withdrawalLimit) * 100
          : 0;

      const checkAndNotify = (percentage: number, type: string) => {
        const key = `budget_alert_${budget.month}_${type}`;
        if (percentage >= 100) {
          if (sessionStorage.getItem(key) !== "100") {
            alert(`You have reached your monthly ${type} budget limit.`);
            sessionStorage.setItem(key, "100");
          }
        } else if (percentage >= 90) {
          if (
            sessionStorage.getItem(key) !== "90" &&
            sessionStorage.getItem(key) !== "100"
          ) {
            alert(`You have used 90% of your monthly ${type} budget.`);
            sessionStorage.setItem(key, "90");
          }
        }
      };

      checkAndNotify(conversionPercentage, "conversion");
      checkAndNotify(withdrawalPercentage, "withdrawal");
    }
  }, [spend, budget]);

  if (
    !budget ||
    (budget.conversionLimit === 0 && budget.withdrawalLimit === 0)
  ) {
    return (
      <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm flex items-center justify-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Set Budget
        </button>
        <BudgetSettingsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={refreshBudget}
        />
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Monthly Budget</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-sm text-primary hover:underline"
        >
          Settings
        </button>
      </div>
      <div className="space-y-4">
        {budget.conversionLimit > 0 && (
          <ProgressBar
            title="Conversions"
            spent={spend.converted}
            limit={budget.conversionLimit}
            currency={budget.currency}
          />
        )}
        {budget.withdrawalLimit > 0 && (
          <ProgressBar
            title="Withdrawals"
            spent={spend.withdrawn}
            limit={budget.withdrawalLimit}
            currency={budget.currency}
          />
        )}
      </div>
      <BudgetSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={refreshBudget}
      />
    </div>
  );
}
