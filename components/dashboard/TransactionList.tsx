"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, RefreshCw, Check, X } from "lucide-react";
import { Transaction, TransactionFilter, TransactionType } from "@/types/transaction";
import { EmptyTransaction } from "./EmptyTransaction";

interface TransactionListProps {
  transactions: Transaction[];
}

function getTransactionIcon(type: TransactionType) {
  switch (type) {
    case "Deposit":
      return <ArrowDown className="h-4 w-4 text-green-600" />;
    case "Withdraw":
      return <ArrowUp className="h-4 w-4 text-red-600" />;
    case "Convert":
      return <RefreshCw className="h-4 w-4 text-orange-600" />;
    default:
      return <ArrowDown className="h-4 w-4 text-gray-600" />;
  }
}

function StatusBadge({ status }: { status: "Success" | "Failed" }) {
  if (status === "Success") {
    return (
      <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
        <Check className="h-3 w-3" />
        Success
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
      <X className="h-3 w-3" />
      Failed
    </div>
  );
}

function FilterButton({ 
  filter, 
  activeFilter, 
  onClick, 
  count 
}: { 
  filter: TransactionFilter; 
  activeFilter: TransactionFilter; 
  onClick: () => void;
  count?: number;
}) {
  const isActive = filter === activeFilter;
  
  return (

    <button
      onClick={onClick}
      className={`py-3 px-4 rounded-xl  text-sm font-medium transition-colors ${
        isActive
          ? "bg-white text-black/70"
          : "text-black/60"
      }`}
    >
      {filter} {count !== undefined && count > 0 && <span className="ml-1">{count}</span>}
    </button>
  );
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>("All");

  // Filter transactions based on active filter
  const filteredTransactions = transactions.filter((transaction) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Withdrawal") return transaction.type === "Withdraw";
    return transaction.type === activeFilter;
  });

  // Count transactions for each filter
  const counts = {
    All: transactions.length,
    Deposit: transactions.filter(t => t.type === "Deposit").length,
    Withdrawal: transactions.filter(t => t.type === "Withdraw").length,
    Convert: transactions.filter(t => t.type === "Convert").length,
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        
        <div className="flex items-center bg-[#D0D8DE80]/50   rounded-[10px] gap-2  shadow">
          <FilterButton
            filter="All"
            activeFilter={activeFilter}
            onClick={() => setActiveFilter("All")}
            count={counts.All}
          />
          <FilterButton
            filter="Deposit"
            activeFilter={activeFilter}
            onClick={() => setActiveFilter("Deposit")}
          />
          <FilterButton
            filter="Withdrawal"
            activeFilter={activeFilter}
            onClick={() => setActiveFilter("Withdrawal")}
          />
          <FilterButton
            filter="Convert"
            activeFilter={activeFilter}
            onClick={() => setActiveFilter("Convert")}
          />
        </div>
      </div>

      {/* Transactions Table or Empty State */}
      {filteredTransactions.length === 0 ? (
        <EmptyTransaction />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Table Header */}
          <div className="border-b border-gray-100 bg-white/60">
            <div className="grid grid-cols-5 gap-4 py-4 px-6">
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                TYPE
              </div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                CURRENCY
              </div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                DATE
              </div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                STATUS
              </div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider text-right">
                AMOUNT
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-50">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="grid grid-cols-5 gap-4 py-4 px-6 hover:bg-gray-50/50">
                {/* Type */}
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type)}
                  <span className="font-medium text-gray-900">
                    {transaction.type}
                  </span>
                </div>

                {/* Currency */}
                <div className="flex items-center text-gray-600">
                  {transaction.toCurrency ? (
                    <div className="flex items-center gap-2">
                      <span>{transaction.fromCurrency}</span>
                      <span>→</span>
                      <span>{transaction.toCurrency}</span>
                    </div>
                  ) : (
                    <span>{transaction.fromCurrency}</span>
                  )}
                </div>

                {/* Date */}
                <div className="flex items-center text-gray-600">
                  {transaction.date}
                </div>

                {/* Status */}
                <div className="flex items-center">
                  <StatusBadge status={transaction.status} />
                </div>

                {/* Amount */}
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {transaction.amount}
                  </div>
                  <div className="text-sm text-gray-500">
                    {transaction.usdAmount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 