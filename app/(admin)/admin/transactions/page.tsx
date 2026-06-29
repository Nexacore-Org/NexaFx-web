/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from "react";
import { Loader2, ListFilter } from "lucide-react";
import { TableTransaction } from "@/components/admin/transaction/TableTransaction";
import { TransactionFilters } from "@/components/admin/transaction/TransactionFilters";
import { getAdminTransactions, AdminTransaction } from "@/lib/api/admin";
import { EmptyState } from "@/components/shared/empty-state";

const ITEMS_PER_PAGE = 10;

export default function TransactionPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await getAdminTransactions({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
        type: activeFilter,
      });
      setTransactions(res.data);
      setTotalCount(res.total);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load admin transactions", err);
      setError(err?.message || "Failed to fetch transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [currentPage, debouncedSearch, activeFilter]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endEntry = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSeeAll = () => {
    setCurrentPage(1);
    setSearchQuery("");
    setActiveFilter("All");
  };

  return (
    <div className="space-y-6">
      <TransactionFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        totalCount={totalCount}
      />
      
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-600">
          <p className="font-semibold">{error}</p>
          <button 
            onClick={loadTransactions} 
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      ) : transactions.length === 0 && (searchQuery || activeFilter !== "All") ? (
        <EmptyState
          icon={<ListFilter className="h-16 w-16" />}
          title="No transactions found"
          description="No transactions match the current filters."
          action={{ label: "Clear filters", onClick: handleSeeAll }}
        />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<ListFilter className="h-16 w-16" />}
          title="No transactions yet"
          description="Transactions will appear here once users start making deposits and conversions."
        />
      ) : (
        <>
          <TableTransaction transactions={transactions} />
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Showing {startEntry} to {endEntry} of {totalCount} entries
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleSeeAll}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                See All
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || totalCount === 0}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
