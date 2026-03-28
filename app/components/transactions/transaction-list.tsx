"use client";

import { Transaction } from "../../lib/api/transactions";

interface TransactionListProps {
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onSelectTransaction }: TransactionListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Cancelled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Deposit':
        return 'text-green-700';
      case 'Withdraw':
        return 'text-red-700';
      case 'Transfer':
        return 'text-blue-700';
      case 'Exchange':
        return 'text-purple-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="md:hidden mt-6 space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          onClick={() => onSelectTransaction(transaction)}
          className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${getTypeColor(transaction.type)}`}>
              {transaction.type}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold text-foreground">
              {formatAmount(transaction.amount, transaction.currency)}
            </span>
            <span className="text-sm text-muted-foreground">
              {transaction.reference}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatDate(transaction.date)}</span>
            {transaction.description && (
              <span className="truncate ml-2">{transaction.description}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}