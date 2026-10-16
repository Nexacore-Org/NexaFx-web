"use client";

import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  fetchTransactions,
  type TransactionsQuery,
  type TransactionsResponse,
} from "@/lib/api/transactions";
import { queryKeys } from "@/lib/query-keys";

export function useTransactions(query: TransactionsQuery = {}) {
  return useQuery<TransactionsResponse, Error>({
    queryKey: [...queryKeys.transactions, query],
    queryFn: () => fetchTransactions(query),
    staleTime: 30_000,
  });
}

/**
 * Invalidates the transactions query cache so fresh data is fetched after a
 * conversion or withdrawal.
 */
export function invalidateTransactions(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.transactions,
  });
}

export function useInvalidateTransactions() {
  const queryClient = useQueryClient();
  return () => invalidateTransactions(queryClient);
}
