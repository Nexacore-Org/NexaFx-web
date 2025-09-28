import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/api/adminService";

// Types for admin dashboard data
export interface AdminOverviewData {
  totalUsers: number;
  totalRevenue: number;
  totalDeposits: number;
  totalWithdrawals: number;
  revenueGrowth: number;
  userGrowth: number;
  depositsGrowth: number;
  withdrawalsGrowth: number;
}

export interface AdminTransaction {
  id: string;
  userId: string;
  userEmail: string;
  type: "Deposit" | "Withdraw" | "Convert";
  amount: number;
  currency: string;
  status: "Success" | "Failed" | "Pending";
  date: string;
  reference: string;
}

export interface TopCurrency {
  currency: string;
  volume: number;
  percentage: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  growthRate: number;
}

// Hook to get admin overview metrics
export const useAdminOverview = () => {
  return useQuery<AdminOverviewData>({
    queryKey: ["admin", "overview"],
    queryFn: adminService.getOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Hook to get admin transactions
export const useAdminTransactions = (limit?: number) => {
  return useQuery<AdminTransaction[]>({
    queryKey: ["admin", "transactions", limit],
    queryFn: () => adminService.getTransactions(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to get top currencies
export const useTopCurrencies = () => {
  return useQuery<TopCurrency[]>({
    queryKey: ["admin", "top-currencies"],
    queryFn: adminService.getTopCurrencies,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get user statistics
export const useUserStats = () => {
  return useQuery<UserStats>({
    queryKey: ["admin", "users"],
    queryFn: adminService.getUserStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};