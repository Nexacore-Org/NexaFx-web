"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import type {
  Transaction,
  TransactionFilter,
  TransactionType,
} from "@/types/transaction";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/but";
import { fetchTransactions } from "@/lib/api/transactions";
import React from "react";
import { EmptyTransaction } from "./EmptyTransaction";

// interface TransactionListProps {
//   transactions: Transaction[];
// }

function getTransactionIcon(type: TransactionType) {
  switch (type) {
    case "Deposit":
      return (
        <Image
          src="/deposit-icon.svg"
          alt="Deposit"
          width={20}
          height={20}
          className="w-5 h-5"
        />
      );
    case "Withdraw":
      return (
        <Image
          src="/withdraw-icon.svg"
          alt="Withdraw"
          width={20}
          height={20}
          className="w-5 h-5"
        />
      );
    case "Convert":
      return (
        <Image
          src="/convert-icon.svg"
          alt="Convert"
          width={20}
          height={20}
          className="w-5 h-5"
        />
      );
    default:
      return (
        <Image
          src="/deposit-icon.svg"
          alt="Default"
          width={20}
          height={20}
          className="w-5 h-5"
        />
      );
  }
}

function StatusBadge({ status }: { status: "Success" | "Failed" }) {
  if (status === "Success") {
    return (
      <Badge
        variant="outline"
        className="bg-[#1BB72D]/20 text-[#009411]/90 font-bold flex items-center gap-1 rounded-full px-2 py-1.5 min-w-[106px] hover:bg-green-100">
        <Check className="h-6 w-6" />
        Success
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-[#C80808]/20 text-[#C80808]/90 border-red-200 font-bold flex items-center gap-1 rounded-full min-w-[106px] px-2 py-1.5 hover:bg-red-100">
      <X className="h-6 w-6" />
      Failed
    </Badge>
  );
}

// Mobile Accordion Row Component for mobile view
function MobileAccordionRow({ transaction }: { transaction: Transaction }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TableRow
        className="border-b border-black/20 hover:bg-gray-50/50 cursor-pointer md:hidden"
        onClick={() => setIsOpen(!isOpen)}>
        {/* TYPE */}
        <TableCell className="py-4 px-4 w-1/3">
          <div className="flex items-center gap-2">
            {getTransactionIcon(transaction.type)}
            <span className="font-medium text-gray-900 text-sm">
              {transaction.type}
            </span>
          </div>
        </TableCell>

        {/* AMOUNT */}
        <TableCell className="py-4 px-4 w-1/3">
          <div className="text-black/70 font-bold text-sm">
            {transaction.amount}
          </div>
        </TableCell>

        {/* STATUS with Chevron */}
        <TableCell className="py-4 px-4 w-1/3">
          <div className="flex items-center justify-between">
            <StatusBadge status={transaction.status} />
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-500 ml-2 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500 ml-2 flex-shrink-0" />
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded Content Row */}
      {isOpen && (
        <TableRow className="border-b border-black/20 bg-gray-50/30 md:hidden">
          <TableCell colSpan={3} className="py-3 px-4">
            <div className="space-y-2 text-sm">
              {/* Currency Details */}
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Currency:</span>
                <div className="flex items-center text-black/70 font-bold text-xs">
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
              </div>

              {/* Date */}
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Date:</span>
                <span className="text-black/70 font-medium text-xs">
                  {transaction.date}
                </span>
              </div>

              {/* USD Value */}
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">USD Value:</span>
                <span className="text-xs text-[#787878]/60">
                  {transaction.usdAmount}
                </span>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 6;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisiblePages; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 3; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 bg-white border-t border-gray-100">
      {/* Left side - Showing entries text */}
      <div className="text-sm text-gray-600">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>

      {/* Right side - Navigation */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </Button>

        {/* Page Numbers */}
        {pageNumbers.map((pageNum) => (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNum)}
            className={
              currentPage === pageNum
                ? "px-3 py-2 text-sm font-medium text-white bg-orange-500 border border-orange-500 rounded-md hover:bg-orange-600"
                : "px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            }>
            {pageNum}
          </Button>
        ))}

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Next
        </Button>
      </div>
    </div>
  );
}

export function TransactionList() {
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(true);
  const [transactionsData, setTransactionsData] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await fetchTransactions();
        setTransactionsData(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter transactions based on active filter
  const filteredTransactions = transactionsData.filter((transaction) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Withdrawal") return transaction.type === "Withdraw";
    return transaction.type === activeFilter;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // Count transactions for each filter
  const counts = {
    All: transactionsData.length,
    Deposit: transactionsData.filter((t) => t.type === "Deposit").length,
    Withdrawal: transactionsData.filter((t) => t.type === "Withdraw").length,
    Convert: transactionsData.filter((t) => t.type === "Convert").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-4">
        {/* Search bar */}
        <div className="flex flex-1">
          <input
            type="text"
            placeholder="Search..."
            className="w-full max-w-md px-5 py-2 rounded-lg bg-[#F5F5F5] text-gray-700 placeholder-gray-400 focus:outline-none"
          />
        </div>

        <Tabs
          value={activeFilter}
          onValueChange={(value) => setActiveFilter(value as TransactionFilter)}
          className="w-auto">
          <TabsList className="bg-white/50 border h-auto rounded-xl">
            <TabsTrigger
              value="All"
              className="data-[state=active]:bg-[#FFD552] data-[state=active]:text-black/70 text-black/60 px-5 py-3 text-xs rounded-xl">
              All {counts.All > 0 && <span className="ml-1">{counts.All}</span>}
            </TabsTrigger>
            <TabsTrigger
              value="Deposit"
              className="data-[state=active]:bg-[#FFD552] data-[state=active]:text-black/70
               text-black/60 px-5 py-3 text-xs rounded-xl">
              Deposit
            </TabsTrigger>
            <TabsTrigger
              value="Withdrawal"
              className="data-[state=active]:bg-[#FFD552] data-[state=active]:text-black/70
               text-black/60 px-5 py-3 text-xs rounded-xl">
              Withdrawal
            </TabsTrigger>
            <TabsTrigger
              value="Convert"
              className="data-[state=active]:bg-[#FFD552] data-[state=active]:text-black/70 text-black/60 px-5 py-3 text-xs rounded-xl">
              Convert
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Transactions Table or Empty State */}
      <div className="p-6 bg-[#F0F0F0]">
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading transactions...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <EmptyTransaction />
        ) : (
          <div className="bg-white rounded-t-lg shadow-sm border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/60">
                <TableRow className="border-b border-black/20 hover:bg-transparent">
                  {/* Desktop Headers */}
                  <TableHead className="text-xs font-bold text-black/70 uppercase tracking-wider py-4 px-6 hidden md:table-cell">
                    TYPE
                  </TableHead>
                  <TableHead className="text-xs font-bold text-black/70 uppercase tracking-wider py-4 px-6 hidden md:table-cell">
                    CURRENCY
                  </TableHead>
                  <TableHead className="text-xs font-bold text-black/70 uppercase tracking-wider py-4 px-6 hidden md:table-cell">
                    DATE
                  </TableHead>
                  <TableHead className="text-xs font-bold text-black/70 uppercase tracking-wider py-4 px-6 hidden md:table-cell">
                    STATUS
                  </TableHead>
                  <TableHead className="text-xs font-bold text-black/70 uppercase tracking-wider py-4 px-6 text-right hidden md:table-cell">
                    AMOUNT
                  </TableHead>

                  {/* Mobile Headers - 3 columns properly aligned */}
                  <TableHead className="text-xs font-bold text-black/70 uppercase tracking-wider py-4 px-4 w-1/3 md:hidden">
                    TYPE
                  </TableHead>
                  <TableHead className="text-xs font-bold text-black/70 uppercase tracking-wider py-4 px-4 w-1/3 md:hidden">
                    AMOUNT
                  </TableHead>
                  <TableHead className="text-xs font-bold text-black/70 uppercase tracking-wider py-4 px-4 w-1/3 md:hidden">
                    STATUS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTransactions.map((transaction) => (
                  <React.Fragment key={transaction.id}>
                    {/* Desktop Row */}
                    <TableRow
                      key={`desktop-${transaction.id}`}
                      className="border-b border-black/20 hover:bg-gray-50/50 hidden md:table-row">
                      {/* Type */}
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.type)}
                          <span className="font-medium text-gray-900">
                            {transaction.type}
                          </span>
                        </div>
                      </TableCell>

                      {/* Currency */}
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center text-black/70 font-bold text-xs">
                          {transaction.toCurrency ? (
                            <div className="flex items-center text-xs text-black/70 font-bold gap-2">
                              <span>{transaction.fromCurrency}</span>
                              <span>→</span>
                              <span>{transaction.toCurrency}</span>
                            </div>
                          ) : (
                            <span>{transaction.fromCurrency}</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-4 px-6 text-black/70 font-medium text-xs">
                        {transaction.date}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4 px-6">
                        <StatusBadge status={transaction.status} />
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="py-4 px-6 text-right">
                        <div className="text-black/70 font-bold text-xs">
                          {transaction.amount}
                        </div>
                        <div className="text-xs text-[#787878]/60">
                          {transaction.usdAmount}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Mobile Accordion Row */}
                    <MobileAccordionRow
                      key={`mobile-${transaction.id}`}
                      transaction={transaction}
                    />
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {filteredTransactions.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredTransactions.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
