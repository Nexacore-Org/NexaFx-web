"use client";
import { AccountOverview } from "@/components/dashboard/account-overview";
import DepositMethods from "@/components/dashboard/deposit";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { WithdrawalModal } from "@/components/dashboard/withdrawal/WithdrawalModal";
import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { ArrowUpDown, Download, Upload } from "lucide-react";
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
              <div
                className="flex flex-col items-center justify-center bg-card rounded-xl md:rounded-sm py-6 md:py-10 gap-2 border-[0.43px] border-[#79797966]"
                onClick={toggleDeposit}
              >
                <Download />
                <p className="text-sm md:text-base font-medium">Deposit</p>
              </div>
              <div
                className="flex flex-col items-center justify-center bg-card rounded-xl md:rounded-sm py-6 md:py-10 gap-2 border-[0.43px] border-[#79797966] cursor-pointer"
                onClick={openWithdrawal}
              >
                <Upload />
                <p className="text-sm md:text-base font-medium">Withdraw</p>
              </div>
            </div>

            <div className="space-y-4 px-3 md:px-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm md:text-lg font-semibold">
                  Exchange Rates
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Live updates
                </p>
              </div>
              <MarketOverview />
            </div>

            <RecentTransactions />
          </div>
        </>
      )}
    </div>
  );
}
