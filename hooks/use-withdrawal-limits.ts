"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export interface WithdrawalLimits {
  dailyLimit: number;
  dailyUsed: number;
  monthlyLimit: number;
  monthlyUsed: number;
  currency: string;
}

const FALLBACK_LIMITS: WithdrawalLimits = {
  dailyLimit: 10000,
  dailyUsed: 0,
  monthlyLimit: 100000,
  monthlyUsed: 0,
  currency: "USD",
};

export function useWithdrawalLimits(currency?: string) {
  const [limits, setLimits] = useState<WithdrawalLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLimits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with real API endpoint once backend supports withdrawal limits
      const response = await apiClient.get("/withdrawal/limits", {
        params: { currency },
      });
      setLimits(response.data);
    } catch {
      // Graceful degradation: use fallback limits if backend unavailable
      setLimits(FALLBACK_LIMITS);
      setError("Withdrawal limits unavailable. Showing estimated limits.");
    } finally {
      setIsLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  const remainingDaily = limits
    ? Math.max(0, limits.dailyLimit - limits.dailyUsed)
    : null;
  const remainingMonthly = limits
    ? Math.max(0, limits.monthlyLimit - limits.monthlyUsed)
    : null;

  return {
    limits,
    remainingDaily,
    remainingMonthly,
    isLoading,
    error,
    refetch: fetchLimits,
  };
}
