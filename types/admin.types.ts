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
  status: "Pending" | "Success" | "Failed";
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
