import { API_ENDPOINTS } from "./config";
import axiosClient from "./axiosClient";
import { AdminOverviewData, AdminTransaction, TopCurrency, UserStats } from "@/hooks/useAdminDashboard";

const getOverview = async (): Promise<AdminOverviewData> => {
  const response = await axiosClient.get(API_ENDPOINTS.ADMIN.OVERVIEW);
  return response.data;
};

const getTransactions = async (limit?: number): Promise<AdminTransaction[]> => {
  const params = limit ? { limit } : {};
  const response = await axiosClient.get(API_ENDPOINTS.ADMIN.TRANSACTIONS, { params });
  return response.data;
};

const getTopCurrencies = async (): Promise<TopCurrency[]> => {
  const response = await axiosClient.get(API_ENDPOINTS.ADMIN.TOP_CURRENCIES);
  return response.data;
};

const getUserStats = async (): Promise<UserStats> => {
  const response = await axiosClient.get(API_ENDPOINTS.ADMIN.USERS);
  return response.data;
};

export const adminService = {
  getOverview,
  getTransactions,
  getTopCurrencies,
  getUserStats,
};