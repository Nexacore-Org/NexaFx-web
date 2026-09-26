import type { AdminTransaction } from "@/lib/api/admin";

export type AnomalySeverity = "low" | "medium" | "high";

export interface Anomaly {
  transactionId: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  date: string;
  reason: string;
  severity: AnomalySeverity;
}

const severityRank: Record<AnomalySeverity, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function getTransactionTime(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function detectAnomalies(transactions: AdminTransaction[]): Anomaly[] {
  const totalsByUserCurrency = new Map<string, { total: number; count: number }>();

  transactions.forEach((transaction) => {
    const key = `${transaction.username}:${transaction.currency}`;
    const current = totalsByUserCurrency.get(key) ?? { total: 0, count: 0 };
    totalsByUserCurrency.set(key, {
      total: current.total + transaction.amount,
      count: current.count + 1,
    });
  });

  const anomalies: Anomaly[] = [];

  transactions.forEach((transaction) => {
    const key = `${transaction.username}:${transaction.currency}`;
    const average = totalsByUserCurrency.get(key);
    const baselineAverage =
      average && average.count > 1 ? (average.total - transaction.amount) / (average.count - 1) : average?.total ?? 0;
    const detected: Anomaly[] = [];
    const anomalyDate = transaction.createdAt || transaction.date;
    const parsedDate = getTransactionTime(anomalyDate);

    if (baselineAverage > 0 && transaction.amount >= baselineAverage * 3 && transaction.amount >= 1000) {
      detected.push({
        transactionId: transaction.txId || transaction.id,
        userId: transaction.userId || transaction.username,
        userEmail: transaction.username,
        amount: transaction.amount,
        currency: transaction.currency,
        date: anomalyDate,
        reason: `${Math.round(transaction.amount / baselineAverage)}x above user average`,
        severity: transaction.amount >= baselineAverage * 5 ? "high" : "medium",
      });
    }

    if (parsedDate && parsedDate.getHours() >= 2 && parsedDate.getHours() <= 5 && transaction.amount >= 5000) {
      detected.push({
        transactionId: transaction.txId || transaction.id,
        userId: transaction.userId || transaction.username,
        userEmail: transaction.username,
        amount: transaction.amount,
        currency: transaction.currency,
        date: anomalyDate,
        reason: "High-value transaction during unusual hours",
        severity: "medium",
      });
    }

    detected.forEach((anomaly) => anomalies.push(anomaly));
  });

  return anomalies.sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);
}

export function getAnomaliesThisWeek(anomalies: Anomaly[]) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  return anomalies.filter((anomaly) => {
    const date = getTransactionTime(anomaly.date);
    return date ? date >= weekStart && date <= now : false;
  }).length;
}
