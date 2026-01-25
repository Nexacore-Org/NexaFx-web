"use client";

import { ArrowDownLeft, ArrowUpRight, Check, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction } from "@/lib/mock-data";

interface TransactionListProps {
    transactions: Transaction[];
    onSelectTransaction: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onSelectTransaction }: TransactionListProps) {
    return (
        <div className="md:hidden space-y-4">
            {transactions.map((tx) => (
                <div 
                    key={tx.id} 
                    onClick={() => onSelectTransaction(tx)}
                    className="flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
                >
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "flex items-center justify-center h-12 w-12 rounded-xl border",
                            tx.type === "Convert" ? "bg-orange-500/10 border-orange-200 text-orange-500" :
                            tx.type === "Deposit" ? "bg-green-500/10 border-green-200 text-green-500" :
                            "bg-red-500/10 border-red-200 text-red-500"
                        )}>
                            {tx.type === "Convert" ? <RefreshCw className="h-6 w-6" /> : 
                             tx.type === "Deposit" ? <ArrowDownLeft className="h-6 w-6" /> : 
                             <ArrowUpRight className="h-6 w-6" />}
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-foreground">{tx.amountString}</p>
                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                    </div>
                    <div className={cn(
                        "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
                        tx.status === "Success" ? "bg-green-500/10 text-green-600 border border-green-200" : 
                        tx.status === "Pending" ? "bg-yellow-500/10 text-yellow-600 border border-yellow-200" :
                        "bg-red-500/10 text-red-600 border border-red-200"
                    )}>
                        {tx.status === "Success" && <Check className="h-3 w-3" />}
                        {tx.status === "Failed" && <X className="h-3 w-3" />}
                        {tx.status}
                    </div>
                </div>
            ))}
        </div>
    );
}
