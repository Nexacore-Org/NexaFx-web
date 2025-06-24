import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BalanceCard } from "@/components/dashboard/home/balance-card";
import { PortfolioCard } from "@/components/dashboard/convert/portfolio-card";
import { TransactionsTable } from "@/components/dashboard/transaction/transactions-table";

const portfolioData = [
  {
    symbol: "BTC",
    value: 150.27,
    change: 0.01,
    isPositive: true,
  },
  {
    symbol: "SOL",
    value: 178.52,
    change: -4.38,
    isPositive: false,
  },
  {
    symbol: "SOL",
    value: 178.52,
    change: -4.38,
    isPositive: false,
  },
  {
    symbol: "SOL",
    value: 178.52,
    change: -4.38,
    isPositive: false,
  },
];

const transactionData = [
  {
    id: 1,
    type: "Deposit",
    fromCurrency: "NGN",
    toCurrency: "NGN",
    date: "04.07.2025 12:40 AM",
    status: "Success" as const,
    amount: "+200,000 NGN",
    usdAmount: "80 USD",
  },
  {
    id: 2,
    type: "Withdraw",
    fromCurrency: "NGN",
    toCurrency: "NGN",
    date: "04.07.2025 12:40 AM",
    status: "Success" as const,
    amount: "+200,000 NGN",
    usdAmount: "80 USD",
  },
  {
    id: 3,
    type: "Convert",
    fromCurrency: "NGN",
    toCurrency: "USD",
    date: "04.07.2025 12:40 AM",
    status: "Failed" as const,
    amount: "+200,000 NGN",
    usdAmount: "80 USD",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end gap-3">
          <Button className="bg-amber-900 hover:bg-amber-800 text-white rounded-full px-6 py-2 h-auto">
            Deposit
            <ArrowDown className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            className="bg-gray-400 hover:bg-gray-500 text-white rounded-full px-6 py-2 h-auto"
          >
            Withdraw
            <ArrowUp className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Balance Card */}
        <BalanceCard />

        {/* Portfolio Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {portfolioData.map((item, index) => (
            <PortfolioCard
              key={index}
              symbol={item.symbol}
              value={item.value}
              change={item.change}
              isPositive={item.isPositive}
            />
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Transactions
            </h2>
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
            >
              See All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <TransactionsTable transactions={transactionData} />
        </div>
      </div>
    </div>
  );
}
