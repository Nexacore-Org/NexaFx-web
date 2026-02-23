"use client";

import { ArrowDownLeft, ArrowUpRight, History, Check, Download, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const transactions = [
    { id: 1, type: "Deposit", currency: "NGN", date: "04.07.2025 12:40 AM", status: "Success", amount: "+ 200,000 NGN", isComingIn: true },
    { id: 2, type: "Exchange", currency: "NGN", date: "04.07.2025 12:40 AM", status: "Success", amount: "+ 200,000 NGN", isComingIn: true, isExchange: true },
    { id: 3, type: "Deposit", currency: "ETH", date: "Jan 22, 2024", status: "Pending", amount: "+ 0.05 ETH", isComingIn: true },
    { id: 4, type: "Withdraw", currency: "NGN", date: "Jan 21, 2024", status: "Failed", amount: "- ₦50,000.00", isComingIn: false },
];

export function RecentTransactions() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-3 md:px-0">
                <h3 className="text-sm md:text-lg font-bold text-foreground">Recent Transactions</h3>
                <button className="text-xs md:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">See All</button>
            </div>

            <div className="rounded-xl md:rounded-sm bg-card md:border md:border-border md:shadow-sm overflow-hidden p-2 md:p-0">
                {/* Desktop view */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b bg-muted/30">
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Currency</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y border-border">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-8 w-8 rounded-full flex items-center justify-center",
                                                tx.isComingIn ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500",
                                                tx.isExchange && "bg-orange-500/10 text-orange-500"
                                            )}>
                                                {tx.isExchange ? <RefreshCw className="h-4 w-4" /> : tx.isComingIn ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                            </div>
                                            <span className="font-medium text-foreground">{tx.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-foreground">{tx.currency}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{tx.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                            tx.status === "Success" ? "bg-green-500/10 text-green-500" :
                                                tx.status === "Pending" ? "bg-yellow-500/10 text-yellow-500" :
                                                    "bg-red-500/10 text-red-500"
                                        )}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className={cn(
                                        "px-6 py-4 text-sm font-bold text-right",
                                        tx.isComingIn ? "text-green-500" : "text-foreground"
                                    )}>
                                        {tx.amount}
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
                                <div className={cn(
                                    "flex items-center justify-center h-12 w-12 rounded-xl",
                                    tx.isExchange ? "bg-orange-500/10 text-orange-500" :
                                        tx.isComingIn ? "bg-green-500/10 text-green-500" :
                                            "bg-red-500/10 text-red-500"
                                )}>
                                    {tx.isExchange ? <RefreshCw className="h-6 w-6" /> : <Download className="h-6 w-6" />}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground">{tx.amount}</p>
                                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                                </div>
                            </div>
                            <div className={cn(
                                "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
                                tx.status === "Success" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-muted text-muted-foreground"
                            )}>
                                {tx.status === "Success" && <Check className="h-3 w-3" />}
                                {tx.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

