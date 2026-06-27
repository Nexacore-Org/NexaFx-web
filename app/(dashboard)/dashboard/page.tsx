"use client";
import { AccountOverview } from "@/components/dashboard/account-overview";
import DepositMethods from "@/components/dashboard/deposit";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { WithdrawalModal } from "@/components/dashboard/withdrawal/WithdrawalModal";
import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { Download, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getBalances, type WalletBalance } from "@/lib/api/wallet";
import { formatCurrency } from "@/lib/utils/format";

const COLORS = ["#FFD552", "#3B82F6", "#F7931A", "#627EEA", "#2775CA"];

type PortfolioData = {
  currency: string;
  amount: number;
  color: string;
};

function PortfolioDonutChart() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBalances()
      .then((balances: WalletBalance[]) => {
        const currencies = ["NGN", "USD", "BTC", "ETH", "USDC"];
        const data = currencies
          .map((c, i) => {
            const bal = balances.find(
              (b) => b.currency.toUpperCase() === c
            );
            return {
              currency: c,
              amount: bal ? bal.amount : 0,
              color: COLORS[i % COLORS.length],
            };
          })
          .filter((d) => d.amount > 0);
        setPortfolioData(data.length > 0 ? data : []);
      })
      .catch(() => setPortfolioData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 space-y-4 animate-pulse">
        <div className="h-5 w-40 bg-muted rounded" />
        <div className="flex items-center justify-center h-48">
          <div className="w-40 h-40 rounded-full bg-muted" />
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 w-20 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (portfolioData.length === 0) return null;

  const total = portfolioData.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <h3 className="text-base font-semibold">Portfolio Allocation</h3>
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={portfolioData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              dataKey="amount"
              paddingAngle={3}
            >
              {portfolioData.map((entry, index) => (
                <Cell key={entry.currency} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [
                formatCurrency(value, "USD"),
                "Balance",
              ]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        {portfolioData.map((entry) => {
          const pct = total > 0 ? ((entry.amount / total) * 100).toFixed(1) : "0";
          return (
            <div key={entry.currency} className="flex items-center gap-1.5 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium text-foreground">
                {entry.currency}
              </span>
              <span className="text-muted-foreground">{pct}%</span>
              <span className="text-muted-foreground">
                ({formatCurrency(entry.amount, entry.currency)})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [openDeposit, setOpenDeposit] = useState(false);
  const openWithdrawal = useWithdrawalStore((state) => state.open);
  const toggleDeposit = () => {
    setOpenDeposit(!openDeposit);
  };

  return (
    <div className="flex flex-col gap-5 md:gap-10">
      <WithdrawalModal />
      {openDeposit ? (
        <DepositMethods toggleDeposit={toggleDeposit} />
      ) : (
        <>
          <AccountOverview
            openDeposit={openDeposit}
            onDepositClick={toggleDeposit}
            onWithdrawClick={openWithdrawal}
          />
          <div className="md:px-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 px-6 pb-6 md:p-0">
              <button
                className="flex flex-col items-center justify-center bg-card rounded-xl md:rounded-sm py-6 md:py-10 gap-2 border-[0.43px] border-[#79797966] hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 active:scale-95"
                onClick={toggleDeposit}
                aria-label="Open deposit modal"
              >
                <Download />
                <p className="text-sm md:text-base font-medium">Deposit</p>
              </button>
              <button
                className="flex flex-col items-center justify-center bg-card rounded-xl md:rounded-sm py-6 md:py-10 gap-2 border-[0.43px] border-[#79797966] cursor-pointer hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 active:scale-95"
                onClick={openWithdrawal}
                aria-label="Open withdrawal modal"
              >
                <Upload />
                <p className="text-sm md:text-base font-medium">Withdraw</p>
              </button>
            </div>

            <div className="space-y-4 px-3 md:px-0">
              <MarketOverview />
            </div>

            <PortfolioDonutChart />

            <RecentTransactions />
          </div>
        </>
      )}
    </div>
  );
}
