// Single source of truth for a transaction's status. Re-exported from the API
// layer so admin transaction types share the exact same vocabulary rather than
// re-declaring a divergent inline union.
import type { TransactionStatus } from "@/lib/api/transactions";
export type { TransactionStatus };

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "active" | "inactive";
  createdAt: string;
}

export interface AdminTransaction {
  id: string;
  userId: string;
  userName: string;
  type: "Deposit" | "Withdraw" | "Convert";
  currency: string;
  amount: number;
  status: TransactionStatus;
  date: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  target: "all" | "selected_users";
  count: number;
  status: "sent" | "scheduled";
  createdAt: string;
}

export interface AdminMetrics {
  totalUsers: number;
  totalTransactions: number;
  totalVolume: number;
  activeUsers: number;
}
