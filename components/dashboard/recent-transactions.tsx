"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransactions } from "@/hooks/use-transactions";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export interface RecentTransactionsProps {
  limit?: number;
}

export function RecentTransactions({ limit = 5 }: RecentTransactionsProps) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useTransactions({ limit });

  return (
    <section
      aria-labelledby="recent-transactions-heading"
      className="w-full rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="recent-transactions-heading"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Recent Transactions
        </h2>
        <Link
          href="/transactions"
          className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400"
        >
          View all
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3" aria-label="Loading recent transactions">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 rounded-lg border border-zinc-100 p-4 dark:border-zinc-800/60"
            >
              <div className="flex items-center gap-3">
                <Skeleton width="40px" height="40px" />
                <div className="space-y-2">
                  <Skeleton width="140px" height="16px" />
                  <Skeleton width="90px" height="12px" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton width="80px" height="16px" />
                <Skeleton width="60px" height="12px" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          variant="error"
          title="Failed to load transactions"
          description="We couldn't fetch your latest transactions. Please try again."
          retry={() => refetch()}
        />
      )}

      {!isLoading &&
        !isError &&
        (!data?.transactions || data.transactions.length === 0) && (
          <EmptyState
            variant="empty"
            title="No recent transactions"
            description="Make your first conversion to get started with NexaFx."
            action={{
              label: "Convert now",
              onClick: () => {
                router.push("/convert");
              },
            }}
          />
        )}

      {!isLoading &&
        !isError &&
        data?.transactions &&
        data.transactions.length > 0 && (
          <div
            className="space-y-3"
            role="feed"
            aria-label="Recent transactions list"
          >
            {data.transactions.slice(0, limit).map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
    </section>
  );
}
