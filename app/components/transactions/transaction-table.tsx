"use client";

import { Transaction } from "@/lib/api/transactions";

interface TransactionTableProps {
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
}

export function TransactionTable({
  transactions,
  onSelectTransaction,
}: TransactionTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "Pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Failed":
        return "text-red-600 bg-red-50 border-red-200";
      case "Cancelled":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Deposit":
        return "text-green-700";
      case "Withdraw":
        return "text-red-700";
      case "Transfer":
        return "text-blue-700";
      case "Exchange":
        return "text-purple-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="hidden md:block mt-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                Date
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                Type
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                Amount
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                Reference
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                onClick={() => onSelectTransaction(transaction)}
                className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <td className="py-4 px-4 text-sm text-foreground">
                  {formatDate(transaction.date)}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`text-sm font-medium ${getTypeColor(transaction.type)}`}
                  >
                    {transaction.type}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm font-medium text-foreground">
                  {formatAmount(transaction.amount, transaction.currency)}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}
                  >
                    {transaction.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">
                  {transaction.reference}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
