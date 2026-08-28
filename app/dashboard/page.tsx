"use client";
import { useCallback, useState } from "react";
import { Download, Upload } from "lucide-react";
import { AccountOverview } from "@/components/dashboard/account-overview";
import { ConversionChart } from "@/components/dashboard/conversion-chart";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { PortfolioChart } from "@/components/dashboard/portfolio-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { ConversionHistory } from "@/components/dashboard/conversion-history";
import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { PullToRefresh } from "@/components/shared/pull-to-refresh";
import { useNotificationsStore } from "@/hooks/use-notifications-store";
import { BudgetTracker } from "@/components/dashboard/budget-tracker";
import { transactions } from "@/lib/api/transactions";
import { Watchlist } from "@/components/dashboard/watchlist";
import dynamic from "next/dynamic";

const DepositMethods = dynamic(
  () => import("@/components/dashboard/deposit"),
  {
    loading: () => (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
      </div>
    ),
    ssr: false,
  }
);

const WithdrawalModal = dynamic(
  () =>
    import("@/components/dashboard/withdrawal/WithdrawalModal").then(
      (mod) => mod.WithdrawalModal
    ),
  { ssr: false }
);

export default function DashboardPage() {
  const [openDeposit, setOpenDeposit] = useState(false);
  const openWithdrawal = useWithdrawalStore((state) => state.open);
  const toggleDeposit = () => {
    setOpenDeposit(!openDeposit);
  };
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchNotifications()]);
  }, [fetchNotifications]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="flex flex-col gap-5 md:gap-10">
        <WithdrawalModal />
        {openDeposit ? (
          <DepositMethods toggleDeposit={toggleDeposit} />
        ) : (
          <>
            <Watchlist />
            <AccountOverview
              openDeposit={openDeposit}
              onDepositClick={toggleDeposit}
              onWithdrawClick={openWithdrawal}
            />
            <div className="px-3 md:px-4">
              <BudgetTracker transactions={transactions} />
            </div>
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

              <div className="px-3 md:px-0">
                <ConversionChart />
              </div>

              <RecentTransactions />

              <ConversionHistory />
            </div>
          </>
        )}
      </div>
    </PullToRefresh>
  );
}
