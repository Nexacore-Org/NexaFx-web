import { Transaction } from "@/lib/api/transactions";

export interface Budget {
  month: string; // e.g. "2025-07"
  conversionLimit: number;
  withdrawalLimit: number;
  currency: string; // e.g. "NGN"
}

export const getBudget = (month: string): Budget | null => {
  const budgets = JSON.parse(localStorage.getItem("budgets") || "{}");
  return budgets[month] || null;
};

export const setBudget = (budget: Budget): void => {
  const budgets = JSON.parse(localStorage.getItem("budgets") || "{}");
  budgets[budget.month] = budget;
  localStorage.setItem("budgets", JSON.stringify(budgets));
};

export const getCurrentMonthSpend = (
  transactions: Transaction[],
): {
  converted: number;
  withdrawn: number;
} => {
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  return transactions.reduce(
    (acc, tx) => {
      const txMonth = tx.date.slice(0, 7);

      if (txMonth === currentMonth) {
        if (tx.type === "Convert" && tx.status === "Success") {
          acc.converted += tx.amount;
        } else if (tx.type === "Withdraw" && tx.status === "Success") {
          acc.withdrawn += tx.amount;
        }
      }
      return acc;
    },
    { converted: 0, withdrawn: 0 },
  );
};
