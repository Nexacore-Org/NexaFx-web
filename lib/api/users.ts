import { apiClient } from "@/lib/api-client";

// ─── Profile ──────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  walletAddress?: string;
  isVerified?: boolean;
  avatarUrl?: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export const getProfile = (): Promise<UserProfile> =>
  apiClient('/users/profile', { useProxy: false });

export const updateProfile = (data: UpdateProfileDto): Promise<UserProfile> =>
  apiClient('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
    useProxy: false,
  });

// ─── Sessions ─────────────────────────────────────────────────────────────

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
