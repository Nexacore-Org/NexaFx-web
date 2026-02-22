"use client";

import { ArrowDownLeft, ArrowUpRight, Check, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction } from "@/lib/api/transactions";

interface TransactionTableProps {
    transactions: Transaction[];
    onSelectTransaction: (transaction: Transaction) => void;
}

export function TransactionTable({ transactions, onSelectTransaction }: TransactionTableProps) {
    return (
        <div className="hidden md:block rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
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
                        <tr 
                            key={tx.id} 
                            onClick={() => onSelectTransaction(tx)}
                            className="hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center",
                                        tx.type === "Deposit" ? "bg-green-500/10 text-green-500" : 
                                        tx.type === "Withdraw" ? "bg-red-500/10 text-red-500" :
                                        "bg-orange-500/10 text-orange-500"
                                    )}>
                                        {tx.type === "Convert" ? <RefreshCw className="h-4 w-4" /> : 
                                         tx.type === "Deposit" ? <ArrowDownLeft className="h-4 w-4" /> : 
                                         <ArrowUpRight className="h-4 w-4" />}
                                    </div>
                                    <span className="font-medium">{tx.type}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                                {tx.currency}
                                {tx.toCurrency && <span className="text-muted-foreground"> → {tx.toCurrency}</span>}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{tx.date}</td>
                            <td className="px-6 py-4">
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                                    tx.status === "Success" ? "bg-green-500/10 text-green-500" :
                                    tx.status === "Pending" ? "bg-yellow-500/10 text-yellow-500" :
                                    "bg-red-500/10 text-red-500"
                                )}>
                                    {tx.status === "Success" && <Check className="h-3 w-3" />}
                                    {tx.status === "Failed" && <X className="h-3 w-3" />}
                                    {tx.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-right">
                                <span className={cn(
                                    tx.type === "Deposit" ? "text-green-500" : "text-foreground"
                                )}>
                                    {tx.amountString}
                                </span>
                                <div className="text-xs text-muted-foreground font-normal">80 USD</div> {/* Hardcoded secondary currency for visual match */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
