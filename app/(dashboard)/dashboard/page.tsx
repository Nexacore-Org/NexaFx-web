"use client";

import { AccountOverview } from "@/components/dashboard/account-overview";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { WithdrawalModal } from "@/components/dashboard/withdrawal/WithdrawalModal";
import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { ArrowUpDown, Download, Upload } from "lucide-react";

export default function DashboardPage() {
    const openWithdrawal = useWithdrawalStore((state) => state.open);

    return (
        <div className="flex flex-col gap-5 md:gap-10">
            <AccountOverview />

            <div className="md:px-4 space-y-4">
                <div className="grid grid-cols-3 gap-4 px-6 pb-6 md:p-0">
                    <div className="flex flex-col items-center justify-center bg-card rounded-xl md:rounded-sm py-6 md:py-10 gap-2 border-[0.43px] border-[#79797966] cursor-pointer hover:bg-muted/50 transition-colors">
                        <Download />
                        <p className="text-sm md:text-base font-medium">
                            Deposit
                        </p>
                    </div>
                    <div
                        onClick={openWithdrawal}
                        className="flex flex-col items-center justify-center bg-card rounded-xl md:rounded-sm py-6 md:py-10 gap-2 border-[0.43px] border-[#79797966] cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                        <Upload />
                        <p className="text-sm md:text-base font-medium">
                            Withdraw
                        </p>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-card rounded-xl md:rounded-sm py-6 md:py-10 gap-2 border-[0.43px] border-[#79797966] cursor-pointer hover:bg-muted/50 transition-colors">
                        <ArrowUpDown />
                        <p className="text-sm md:text-base font-medium">
                            Convert
                        </p>
                    </div>
                </div>


                <div className="space-y-4 px-3 md:px-0">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm md:text-lg font-semibold">Exchange Rates</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">Live updates</p>
                    </div>
                    <MarketOverview />
                </div>

                <RecentTransactions />
            </div>

            {/* Withdrawal Modal */}
            <WithdrawalModal />
        </div>
    );
}
