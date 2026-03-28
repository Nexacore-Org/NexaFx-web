"use client";
import { AccountOverview } from "@/components/dashboard/account-overview";
import DepositMethods from "@/components/dashboard/deposit";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { WithdrawalModal } from "@/components/dashboard/withdrawal/WithdrawalModal";
import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { Download, Upload } from "lucide-react";
import { useState } from "react";

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

            <RecentTransactions />
          </div>
        </>
      )}
    </div>
  );
}
