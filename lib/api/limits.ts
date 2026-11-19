import { apiClient } from "./client";

export interface WithdrawalLimits {
  min: number;
  max: number;
  dailyLimit: number;
  dailyUsed: number;
  remaining: number;
  currency: string;
}

export async function getWithdrawalLimits(
  currency: string,
): Promise<WithdrawalLimits> {
  const { data } = await apiClient.get<WithdrawalLimits>("/limits/withdrawal", {
    params: { currency },
  });
  return data;
}
