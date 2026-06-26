"use client";

import { useState, useEffect, useRef } from "react";
import { Transaction } from "@/lib/api/transactions";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionPagination } from "@/components/transactions/pagination";
import { TransactionEmptyState } from "@/components/transactions/empty-state";
import { TransactionDetails } from "@/components/transactions/transaction-details";
import { exportTransactionsToCSV, generateCSVFilename } from "@/app/lib/utils/csv-export";
import { useTransactionStore } from "@/lib/store/transaction-store";

const ITEMS_PER_PAGE = 10;

export default function TransactionsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");

    const { transactions, total, isLoading, error, fetchTransactions } = useTransactionStore();

    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearchChange = (q: string) => {
        setSearchQuery(q);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearch(q);
            setCurrentPage(1);
        }, 400);
    };

    const handleFilterChange = (f: string) => {
        setActiveFilter(f);
        setCurrentPage(1);
    };

    const handleDateFromChange = (date: string) => {
        setDateFrom(date);
        setCurrentPage(1);
    };

    const handleDateToChange = (date: string) => {
        setDateTo(date);
        setCurrentPage(1);
    };

    const handleClearDateRange = () => {
        setDateFrom("");
        setDateTo("");
        setCurrentPage(1);
    };

    const handleExportCSV = () => {
        if (transactions.length > 0) {
            const filename = generateCSVFilename(dateFrom, dateTo);
            exportTransactionsToCSV(transactions, filename);
        }
    };

    useEffect(() => {
        const typeParam =
            activeFilter === 'Withdrawal'
                ? 'Withdraw'
                : activeFilter !== 'All'
                ? activeFilter
                : undefined;

        fetchTransactions({
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            search: debouncedSearch || undefined,
            type: typeParam,
            from: dateFrom || undefined,
            to: dateTo || undefined,
        });
    }, [currentPage, debouncedSearch, activeFilter, dateFrom, dateTo, fetchTransactions]);

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const handleTransactionClick = (tx: Transaction) => {
        setSelectedTransaction(tx);
        setDetailsOpen(true);
    };

    return (
        <div className="flex flex-col h-full space-y-4 md:space-y-6 max-w-7xl mx-auto w-full">
            <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border/50">
                <TransactionFilters
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    activeFilter={activeFilter}
                    onFilterChange={handleFilterChange}
                    totalCount={total}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    onDateFromChange={handleDateFromChange}
                    onDateToChange={handleDateToChange}
                    onClearDateRange={handleClearDateRange}
                    onExportCSV={handleExportCSV}
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <p className="text-sm text-muted-foreground">{error}</p>
                        <button
                            onClick={() => {
                                const typeParam =
                                    activeFilter === 'Withdrawal'
                                        ? 'Withdraw'
                                        : activeFilter !== 'All'
                                        ? activeFilter
                                        : undefined;

                                fetchTransactions({
                                    page: currentPage,
                                    limit: ITEMS_PER_PAGE,
                                    search: debouncedSearch || undefined,
                                    type: typeParam,
                                    from: dateFrom || undefined,
                                    to: dateTo || undefined,
                                });
                            }}
                            className="text-sm font-medium text-primary hover:underline"
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
                            onPageChange={setCurrentPage}
                            totalItems={total}
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
