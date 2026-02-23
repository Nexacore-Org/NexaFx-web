"use client";

import { ArrowDownLeft, ArrowUpRight, RefreshCw, Check, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Transaction, getTransactions } from "@/lib/api/transactions";

export function RecentTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getTransactions({ page: 1, limit: 5 })
            .then((result) => setTransactions(result.data))
            .catch(() => setError("Failed to load transactions"))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-3 md:px-0">
                <h3 className="text-sm md:text-lg font-bold text-foreground">Recent Transactions</h3>
                <Link
                    href="/transactions"
                    className="text-xs md:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                    See All
                </Link>
            </div>

            <div className="rounded-xl md:rounded-sm bg-card md:border md:border-border md:shadow-sm overflow-hidden p-2 md:p-0">
                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                ) : error ? (
                    <p className="text-sm text-muted-foreground text-center py-10">{error}</p>
                ) : transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-10">
                        No recent transactions
                    </p>
                ) : (
                    <>
                        {/* Desktop view */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Currency
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y border-border">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={cn(
                                                            "h-8 w-8 rounded-full flex items-center justify-center",
                                                            tx.type === "Deposit"
                                                                ? "bg-green-500/10 text-green-500"
                                                                : tx.type === "Withdraw"
                                                                ? "bg-red-500/10 text-red-500"
                                                                : "bg-orange-500/10 text-orange-500"
                                                        )}
                                                    >
                                                        {tx.type === "Convert" ? (
                                                            <RefreshCw className="h-4 w-4" />
                                                        ) : tx.type === "Deposit" ? (
                                                            <ArrowDownLeft className="h-4 w-4" />
                                                        ) : (
                                                            <ArrowUpRight className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-foreground">
                                                        {tx.type}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground">
                                                {tx.currency}
                                                {tx.toCurrency && (
                                                    <span className="text-muted-foreground">
                                                        {" → "}
                                                        {tx.toCurrency}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {tx.date}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                        tx.status === "Success"
                                                            ? "bg-green-500/10 text-green-500"
                                                            : tx.status === "Pending"
                                                            ? "bg-yellow-500/10 text-yellow-500"
                                                            : "bg-red-500/10 text-red-500"
                                                    )}
                                                >
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td
                                                className={cn(
                                                    "px-6 py-4 text-sm font-bold text-right",
                                                    tx.type === "Deposit"
                                                        ? "text-green-500"
                                                        : "text-foreground"
                                                )}
                                            >
                                                {tx.amountString}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile view */}
                        <div className="md:hidden space-y-4 p-4">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={cn(
                                                "flex items-center justify-center h-12 w-12 rounded-xl border",
                                                tx.type === "Convert"
                                                    ? "bg-orange-500/10 border-orange-200 text-orange-500"
                                                    : tx.type === "Deposit"
                                                    ? "bg-green-500/10 border-green-200 text-green-500"
                                                    : "bg-red-500/10 border-red-200 text-red-500"
                                            )}
                                        >
                                            {tx.type === "Convert" ? (
                                                <RefreshCw className="h-6 w-6" />
                                            ) : tx.type === "Deposit" ? (
                                                <Download className="h-6 w-6" />
                                            ) : (
                                                <ArrowUpRight className="h-6 w-6" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-foreground">
                                                {tx.amountString}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                                        </div>
                                    </div>
                                    <div
                                        className={cn(
                                            "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
                                            tx.status === "Success"
                                                ? "bg-green-500/10 text-green-600 border border-green-200"
                                                : tx.status === "Pending"
                                                ? "bg-yellow-500/10 text-yellow-600 border border-yellow-200"
                                                : "bg-red-500/10 text-red-600 border border-red-200"
                                        )}
                                    >
                                        {tx.status === "Success" && <Check className="h-3 w-3" />}
                                        {tx.status === "Failed" && <X className="h-3 w-3" />}
                                        {tx.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
