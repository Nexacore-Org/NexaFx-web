"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Transaction, getTransactions } from "@/lib/api/transactions";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionPagination } from "@/components/transactions/pagination";
import { TransactionEmptyState } from "@/components/transactions/empty-state";
import { TransactionDetails } from "@/components/transactions/transaction-details";
import { exportTransactionsToCSV, generateCSVFilename } from "@/app/lib/utils/csv-export";
import { getRequestErrorMessage, isOfflineError } from "@/lib/api-client";
import { TransactionTableSkeleton } from "@/components/shared/page-skeletons";

const ITEMS_PER_PAGE = 10;

function TransactionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const searchQuery = searchParams.get("search") || "";
  const activeFilter = searchParams.get("type") || "All";
  const currentPage = Number(searchParams.get("page")) || 1;
  const dateFrom = searchParams.get("from") || "";
  const dateTo = searchParams.get("to") || "";

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cachedTransactionsRef = useRef<Transaction[]>([]);

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const handleSearchChange = (q: string) => {
    updateQueryParams({ search: q, page: "1" });
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(q);
    }, 400);
  };

  const handleFilterChange = (f: string) => {
    updateQueryParams({ type: f === "All" ? null : f, page: "1" });
  };

  const handleDateFromChange = (date: string) => {
    updateQueryParams({ from: date, page: "1" });
  };

  const handleDateToChange = (date: string) => {
    updateQueryParams({ to: date, page: "1" });
  };

  const handleClearDateRange = () => {
    updateQueryParams({ from: null, to: null, page: "1" });
  };

  const handleExportCSV = () => {
    if (transactions.length > 0) {
      const filename = generateCSVFilename(dateFrom, dateTo);
      exportTransactionsToCSV(transactions, filename);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchTransactions = async () => {
      setIsLoading(true);
      const typeParam =
        activeFilter === "Withdrawal"
          ? "Withdraw"
          : activeFilter !== "All"
          ? activeFilter
          : undefined;

      try {
        const result = await getTransactions({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: debouncedSearch || undefined,
          type: typeParam,
          from: dateFrom || undefined,
          to: dateTo || undefined,
        });
        if (!cancelled) {
          cachedTransactionsRef.current = result.data;
          setTransactions(result.data);
          setTotalItems(result.total);
          setError(null);
          setOfflineNotice(null);
        }
      } catch (err) {
        if (!cancelled) {
          const hasCachedData = cachedTransactionsRef.current.length > 0;
          if (isOfflineError(err)) {
            setOfflineNotice(
              "You are offline. Showing cached transaction data."
            );
            setTransactions(cachedTransactionsRef.current);
            setError(null);
          } else {
            setError(
              getRequestErrorMessage(err, {
                fallback: "Failed to load transactions",
              })
            );
            if (hasCachedData) {
              setOfflineNotice(
                "Failed to load latest data. Showing cached transactions."
              );
              setTransactions(cachedTransactionsRef.current);
            }
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchTransactions();

    return () => {
      cancelled = true;
    };
  }, [currentPage, debouncedSearch, activeFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  const handleTransactionClick = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setDetailsOpen(true);
  };

  return (
    <div className="flex flex-col h-full space-y-4 md:space-y-6 max-w-7xl mx-auto w-full p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Transaction History</h1>
      </div>

      <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border/50">
        <TransactionFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          totalCount={totalItems}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
          onClearDateRange={handleClearDateRange}
          onExportCSV={handleExportCSV}
        />

        {offlineNotice && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
            {offlineNotice}
          </div>
        )}

        {isLoading ? (
          <TransactionTableSkeleton rows={5} />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setDebouncedSearch(searchQuery);
              }}
              className="text-sm font-medium text-primary hover:underline px-4 py-2 border rounded-md"
            >
              Retry
            </button>
          </div>
        ) : transactions.length > 0 ? (
          <>
            <TransactionTable
              transactions={transactions}
              onSelectTransaction={handleTransactionClick}
            />
            <TransactionList
              transactions={transactions}
              onSelectTransaction={handleTransactionClick}
            />
            <TransactionPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => updateQueryParams({ page: String(p) })}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </>
        ) : (
          <TransactionEmptyState />
        )}
      </div>

      <TransactionDetails
        transaction={selectedTransaction}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-full space-y-6 max-w-7xl mx-auto w-full p-4 md:p-6 items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <TransactionsContent />
    </Suspense>
  );
}
