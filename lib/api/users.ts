import { apiClient } from "@/lib/api-client";

export interface UserSession {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  location?: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export const getSessions = (): Promise<UserSession[]> => {
  return apiClient("/users/sessions");
};

export const terminateSession = (id: string): Promise<void> => {
  return apiClient(`/users/sessions/${id}`, {
    method: "DELETE",
  });
};

export const terminateAllOtherSessions = (): Promise<void> => {
  return apiClient("/users/sessions", {
    method: "DELETE",
  });
};

// ─── Account Tier & Limits ────────────────────────────────────────────────

export type AccountTier = 'Basic' | 'Verified' | 'Premium';

export interface AccountLimits {
  tier: AccountTier;
  dailyConversionLimit: number;
  monthlyConversionLimit: number;
  dailyWithdrawalLimit: number;
  monthlyWithdrawalLimit: number;
  currency: string;
  nextTier?: AccountTier;
  nextTierRequirements?: string[];
}

export const getAccountLimits = (): Promise<AccountLimits> =>
  apiClient('/users/tier', { useProxy: false });
