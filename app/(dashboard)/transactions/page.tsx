"use client";

import Link from "next/link";
import { useTransactions } from "@/hooks/use-transactions";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { ExportButton } from "@/components/transactions/export-button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function TransactionsPage() {
  const { data, isLoading, isError, refetch } = useTransactions();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Complete transaction history and currency activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton />
          <Link
            href="/dashboard"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {isLoading && (
          <div className="space-y-3" aria-label="Loading transactions">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 rounded-lg border border-zinc-100 p-4 dark:border-zinc-800/60"
              >
                <div className="flex items-center gap-3">
                  <Skeleton width="40px" height="40px" />
                  <div className="space-y-2">
                    <Skeleton width="160px" height="16px" />
                    <Skeleton width="100px" height="12px" />
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
            title="Failed to load transaction history"
            description="We were unable to load your transactions. Please try again."
            retry={() => refetch()}
          />
        )}

        {!isLoading &&
          !isError &&
          (!data?.transactions || data.transactions.length === 0) && (
            <EmptyState
              variant="empty"
              title="No transactions yet"
              description="Your activity will appear here once you make a deposit, transfer, or conversion."
            />
          )}

        {!isLoading &&
          !isError &&
          data?.transactions &&
          data.transactions.length > 0 && (
            <div
              className="space-y-3"
              role="feed"
              aria-label="Transactions list"
            >
              {data.transactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
