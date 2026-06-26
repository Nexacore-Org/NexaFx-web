"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { TableTransaction } from "@/components/admin/transaction/TableTransaction";
import { TransactionFilters } from "@/components/admin/transaction/TransactionFilters";
import { getAdminTransactions, type AdminTransaction } from "@/lib/api/admin";
import { getRequestErrorMessage, isOfflineError } from "@/lib/api-client";

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const cachedTransactionsRef = useRef<AdminTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminTransactions();
        cachedTransactionsRef.current = data;
        setOfflineNotice(null);
        setTransactions(data);
      } catch (err: unknown) {
        console.error("Error fetching transactions:", err);
        const hasCachedData = cachedTransactionsRef.current.length > 0;
        const message = getRequestErrorMessage(err, {
          fallback: "Failed to load transactions.",
          hasCachedData,
        });

        if (isOfflineError(err) && hasCachedData) {
          setOfflineNotice(message);
        } else {
          setOfflineNotice(null);
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search by username or txId
      const matchesSearch =
        !searchQuery.trim() ||
        tx.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.txId.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by active type (backend withdrawal maps to Withdraw)
      const matchesFilter =
        activeFilter === "All" ||
        tx.type.toLowerCase() === activeFilter.toLowerCase() ||
        (activeFilter === "Withdrawal" && tx.type === "Withdraw");

      return matchesSearch && matchesFilter;
    });
  }, [transactions, searchQuery, activeFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-lg mx-auto mt-8">
        <p className="font-semibold">Error Loading Transactions</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs font-semibold underline hover:text-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {offlineNotice && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {offlineNotice}
        </div>
      )}
      <TransactionFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        totalCount={filteredTransactions.length}
      />
      <TableTransaction transactions={filteredTransactions} />
    </div>
  );
}
