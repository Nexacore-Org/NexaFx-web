"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getRates,
  type RateQuote,
  type RatesResponse,
} from "@/lib/api/exchange-rates";
import { queryKeys } from "@/lib/query-keys";

/**
 * Polls the rates endpoint roughly once a minute. Polling pauses when the tab
 * is hidden and resumes (with an immediate refetch) when it becomes visible
 * again.
 */
export function useRates(pairs?: string[]) {
  const [visible, setVisible] = useState(true);
  const key = pairs ? pairs.join(",") : "default";

  useEffect(() => {
    const handleVisibility = () => {
      setVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return useQuery<RatesResponse>({
    queryKey: queryKeys.rates(key),
    queryFn: () => getRates(pairs),
    refetchInterval: visible ? 60_000 : false,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
}

export type { RateQuote };
