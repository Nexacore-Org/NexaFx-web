"use client";

import { useState } from "react";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import {
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
import React from "react";
import { EmptyTransaction } from "./EmptyTransaction";

interface TransactionListProps {
  transactions: Transaction[];
}

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
        className="bg-[#1BB72D]/20 text-[#009411]/90 font-bold flex items-center gap-1 rounded-full px-2 py-2 min-w-[104px] hover:bg-green-100"
      >
        <Check className="h-5 w-5" />
        Success
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-[#C80808]/20 text-[#C80808]/90 border-red-200 font-bold flex items-center gap-1 rounded-full min-w-[104px] px-2 py-2 hover:bg-red-100"
    >
      <X className="h-5 w-5" />
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
        onClick={() => setIsOpen(!isOpen)}
      >
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
    Deposit: transactions.filter((t) => t.type === "Deposit").length,
    Withdrawal: transactions.filter((t) => t.type === "Withdraw").length,
    Convert: transactions.filter((t) => t.type === "Convert").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>

        <Tabs
          value={activeFilter}
          onValueChange={(value) => setActiveFilter(value as TransactionFilter)}
          className="w-auto"
        >
          <TabsList className="bg-[#D0D8DE80] h-auto">
            <TabsTrigger
              value="All"
              className="data-[state=active]:bg-white data-[state=active]:text-black/70 text-black/60 px-4 py-3 text-xs rounded-xl"
            >
              All {counts.All > 0 && <span className="ml-1">{counts.All}</span>}
            </TabsTrigger>
            <TabsTrigger
              value="Deposit"
              className="data-[state=active]:bg-white data-[state=active]:text-black/70
               text-black/60 px-4 py-3 text-xs rounded-xl"
            >
              Deposit
            </TabsTrigger>
            <TabsTrigger
              value="Withdrawal"
              className="data-[state=active]:bg-white data-[state=active]:text-black/70
               text-black/60 px-4 py-3 text-xs rounded-xl"
            >
              Withdrawal
            </TabsTrigger>
            <TabsTrigger
              value="Convert"
              className="data-[state=active]:bg-white data-[state=active]:text-black/70 text-black/60 px-4 py-3 text-xs rounded-xl"
            >
              Convert
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Transactions Table or Empty State */}
      {filteredTransactions.length === 0 ? (
        <EmptyTransaction />
      ) : (
        <div className="bg-white rounded-t-2xl shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/60">
              <TableRow className="border-b border-black/20 hover:bg-transparent">
                {/* Desktop Headers */}
                <TableHead className="text-sm font-bold text-black/50 uppercase tracking-wider py-4 px-6 hidden md:table-cell">
                  TYPE
                </TableHead>
                <TableHead className="text-sm font-bold text-black/50 uppercase tracking-wider py-4 px-6 hidden md:table-cell">
                  CURRENCY
                </TableHead>
                <TableHead className="text-sm font-bold text-black/50 uppercase tracking-wider py-4 px-6 hidden md:table-cell">
                  DATE
                </TableHead>
                <TableHead className="text-sm font-bold text-black/50 uppercase tracking-wider py-4 px-6 hidden md:table-cell">
                  STATUS
                </TableHead>
                <TableHead className="text-sm font-bold text-black/50 uppercase tracking-wider py-4 px-6 text-right hidden md:table-cell">
                  AMOUNT
                </TableHead>

                {/* Mobile Headers - 3 columns properly aligned */}
                <TableHead className="text-sm font-bold text-black/50 uppercase tracking-wider py-4 px-4 w-1/3 md:hidden">
                  TYPE
                </TableHead>
                <TableHead className="text-sm font-bold text-black/50 uppercase tracking-wider py-4 px-4 w-1/3 md:hidden">
                  AMOUNT
                </TableHead>
                <TableHead className="text-sm font-bold text-black/50 uppercase tracking-wider py-4 px-4 w-1/3 md:hidden">
                  STATUS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <React.Fragment key={transaction.id}>
                  {/* Desktop Row */}
                  <TableRow
                    key={`desktop-${transaction.id}`}
                    className="border-b border-black/20 hover:bg-gray-50/50 hidden md:table-row"
                  >
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
        </div>
      )}
    </div>
  );
}
