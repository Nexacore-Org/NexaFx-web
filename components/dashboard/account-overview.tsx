"use client";

import { ChevronDown, Download, Upload, Copy } from "lucide-react";
import { Topbar } from "./topbar";

const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

type AccountOverviewTypes = {
  openDeposit: boolean;
};


export function AccountOverview({ openDeposit }: AccountOverviewTypes) {
  return (
    <section className="account-overview rounded-b-xl md:rounded-b-none md:ml-4">
      {/* Main balance card */}
      <div className="relative space-y-5 md:space-y-10 overflow-hidden p-3 md:p-4">
        <Topbar />

        {openDeposit ? (
          <></>
        ) : (
          <>
            {" "}
            <div className="flex items-center justify-between">
              <div className="space-y-2.5">
                <p className="text-sm font-medium text-black/60">
                  Total balance
                </p>
                <div className="flex items-center gap-2">
                  <h2 className="text-4xl font-bold tracking-tight text-black">
                    ₦ 325,980.65
                  </h2>
                </div>
              </div>

              <div className="hidden md:inline-flex bg-[#E9EAEE] flex items-center gap-2 rounded-sm border border-white/90 px-4 py-2">
                <p className="text-xs font-medium">
                  {truncateAddress(
                    "0x1234567890123456789012345678901234567890",
                  )}
                </p>
                <button>
                  <Copy />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 rounded-sm bg-primary px-8 py-2.5 text-sm font-semibold text-black hover:bg-black/80 transition-all active:scale-95">
                <Download className="size-5" />
                Deposit
              </button>
              <button className="flex items-center gap-2 rounded-sm bg-[#E9EAEE] px-8 py-2.5 text-sm font-semibold text-black hover:bg-white/60 transition-all active:scale-95 border border-white/90">
                <Upload className="size-5" />
                Withdraw
              </button>
            </div>
            {/* Mini balance displays */}
            <div className="flex w-full gap-4">
              <div className="rounded-sm w-full md:w-1/2 bg-white/30 md:bg-card p-2.5 md:p-4  md:border-[0.43px] border-[#79797966] shadow-[4px-4px-12px-0px-#0000001A] flex flex-col">
                <div className="flex items-center justify-between mb-2 grow">
                  <p className="text-xl font-medium text-black">NGN</p>
                </div>
                <p className="text-base md:text-xl font-semibold">₦250,250</p>
              </div>

              <div className="rounded-sm w-full md:w-1/2 bg-white/30 md:bg-card p-2.5 md:p-4  md:border-[0.43px] border-[#79797966] shadow-[4px-4px-12px-0px-#0000001A]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 bg-[#E0E0E099] p-2 rounded-md">
                    <img src="/icons/usdc.svg" alt="" className="w-6 h-6" />
                    <p className="text-xs font-medium text-muted-foreground">
                      USD
                    </p>
                    <ChevronDown className="size-5 text-black" />
                  </div>
                </div>
                <p className="text-base md:text-xl font-semibold">$1,160.52</p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
