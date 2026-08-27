import { v4 as uuidv4 } from "uuid";

export interface SavingsGoal {
  id: string;
  name: string; // e.g. "Travel fund"
  targetAmount: number;
  targetCurrency: string;
  targetDate: string; // ISO date
  createdAt: string;
}

export const getSavingsGoals = (): SavingsGoal[] => {
  const goals = localStorage.getItem("savingsGoals");
  return goals ? JSON.parse(goals) : [];
};

export const addSavingsGoal = (
  goal: Omit<SavingsGoal, "id" | "createdAt">,
): SavingsGoal => {
  const goals = getSavingsGoals();
  const newGoal: SavingsGoal = {
    ...goal,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem("savingsGoals", JSON.stringify([...goals, newGoal]));
  return newGoal;
};

export const deleteSavingsGoal = (id: string): void => {
  const goals = getSavingsGoals();
  const updatedGoals = goals.filter((goal) => goal.id !== id);
  localStorage.setItem("savingsGoals", JSON.stringify(updatedGoals));
};
