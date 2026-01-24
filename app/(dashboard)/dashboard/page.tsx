import { AccountOverview } from "@/components/dashboard/account-overview";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { ArrowUpDown, Download, Upload } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-10">
            <AccountOverview />

            <div className="px-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center justify-center bg-card rounded-xl md:rounded-sm py-6 md:py-10 gap-2 border-[0.43px] border-[#79797966]">
                        <Download />
                        <p className="text-sm md:text-base font-medium">
                            Deposit
                        </p>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-card rounded-xl md:rounded-sm py-6 md:py-10 gap-2 border-[0.43px] border-[#79797966]">
                        <Upload />
                        <p className="text-sm md:text-base font-medium">
                            Withdraw
                        </p>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-card rounded-xl md:rounded-sm py-6 md:py-10 gap-2 border-[0.43px] border-[#79797966]">
                        <ArrowUpDown />
                        <p className="text-sm md:text-base font-medium">
                            Convert
                        </p>
                    </div>
                </div>


                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm md:text-lg font-semibold">Exchange Rates</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">Live updates</p>
                    </div>
                    <MarketOverview />
                </div>

                <RecentTransactions />
            </div>

        </div>
    );
}
