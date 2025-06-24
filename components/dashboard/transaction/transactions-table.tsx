import { ArrowDown, ArrowUp, RefreshCw, Check, X } from "lucide-react";

type TransactionStatus = "Success" | "Failed";

interface Transaction {
  id: number;
  type: string;
  fromCurrency: string;
  toCurrency: string;
  date: string;
  status: TransactionStatus;
  amount: string;
  usdAmount: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

function getTransactionIcon(type: string) {
  switch (type.toLowerCase()) {
    case "deposit":
      return <ArrowDown className="h-4 w-4 text-green-600" />;
    case "withdraw":
      return <ArrowUp className="h-4 w-4 text-red-600" />;
    case "convert":
      return <RefreshCw className="h-4 w-4 text-orange-600" />;
    default:
      return <ArrowDown className="h-4 w-4 text-gray-600" />;
  }
}

function StatusBadge({ status }: { status: TransactionStatus }) {
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

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/60">
            <tr className="border-b border-gray-100 bg-white/60">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                TYPE
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                CURRENCY
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                DATE
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                STATUS
              </th>
              <th className="text-right py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                AMOUNT
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50/50">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <span className="font-medium text-gray-900">
                      {transaction.type}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>{transaction.fromCurrency}</span>
                    <span>→</span>
                    <span>{transaction.toCurrency}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-600">{transaction.date}</td>
                <td className="py-4 px-6">
                  <StatusBadge status={transaction.status} />
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="font-semibold text-gray-900">
                    {transaction.amount}
                  </div>
                  <div className="text-sm text-gray-500">
                    {transaction.usdAmount}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
