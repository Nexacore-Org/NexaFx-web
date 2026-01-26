"use client";

import { useState, useMemo } from "react";
import { mockTransactions, Transaction } from "@/lib/mock-data";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionPagination } from "@/components/transactions/pagination";
import { TransactionEmptyState } from "@/components/transactions/empty-state";
import { TransactionDetails } from "@/components/transactions/transaction-details";

export default function TransactionsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const itemsPerPage = 10;

    const filteredTransactions = useMemo(() => {
        return mockTransactions.filter((tx) => {
            // Text Search
            const matchesSearch = 
                tx.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.amountString.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (tx.reference && tx.reference.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesFilter = 
                activeFilter === "All" || 
                (activeFilter === "Withdrawal" && tx.type === "Withdraw") ||
                tx.type === activeFilter;

            return matchesSearch && matchesFilter;
        });
    }, [searchQuery, activeFilter]);

    const totalItems = filteredTransactions.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const currentTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleTransactionClick = (tx: Transaction) => {
        setSelectedTransaction(tx);
        setDetailsOpen(true);
    };

    return (
        <div className="flex flex-col h-full space-y-4 md:space-y-6 max-w-7xl mx-auto w-full">
            <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border/50">
                <TransactionFilters 
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    totalCount={150} 
                />

                {currentTransactions.length > 0 ? (
                    <>
                        <TransactionTable 
                            transactions={currentTransactions} 
                            onSelectTransaction={handleTransactionClick}
                        />
                        <TransactionList 
                            transactions={currentTransactions} 
                            onSelectTransaction={handleTransactionClick}
                        />
                        <TransactionPagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
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
