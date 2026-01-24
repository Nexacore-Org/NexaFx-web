"use client";

import { ArrowDownLeft, ArrowUpRight, MoreHorizontal } from "lucide-react";

const transactions = [
    { id: 1, type: "Deposit", currency: "NGN", date: "Jan 24, 2024", status: "Success", amount: "+ ₦150,000.00", isComingIn: true },
    { id: 2, type: "Withdraw", currency: "USD", date: "Jan 23, 2024", status: "Success", amount: "- $200.00", isComingIn: false },
    { id: 3, type: "Deposit", currency: "ETH", date: "Jan 22, 2024", status: "Pending", amount: "+ 0.05 ETH", isComingIn: true },
    { id: 4, type: "Withdraw", currency: "NGN", date: "Jan 21, 2024", status: "Failed", amount: "- ₦50,000.00", isComingIn: false },
];

export function RecentTransactions() {
    return (
        <div className="rounded-sm border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-bold">Recent Transactions</h3>
                <button className="text-sm font-semibold text-primary hover:underline">See all</button>
            </div>

            <div className="overflow-x-auto">
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
                    <tbody className="divide-y">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.isComingIn ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                            }`}>
                                            {tx.isComingIn ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                        </div>
                                        <span className="font-medium">{tx.type}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">{tx.currency}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{tx.date}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tx.status === "Success" ? "bg-green-500/10 text-green-500" :
                                        tx.status === "Pending" ? "bg-yellow-500/10 text-yellow-500" :
                                            "bg-red-500/10 text-red-500"
                                        }`}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-sm font-bold text-right ${tx.isComingIn ? "text-green-500" : "text-foreground"
                                    }`}>
                                    {tx.amount}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
