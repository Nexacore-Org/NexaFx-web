"use client";

import {
  ChevronDown,
  Download,
  Upload,
  Copy,
  Check,
  CircleDollarSign,
} from "lucide-react";
import { useEffect, useState } from "react";

const truncateAddress = (addr: string) =>
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

type AccountOverviewTypes = {
  openDeposit: boolean;
  onDepositClick?: () => void;
  onWithdrawClick?: () => void;
};

export function AccountOverview({
  openDeposit,
  onDepositClick,
  onWithdrawClick,
}: AccountOverviewTypes) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [ngnBalance, setNgnBalance] = useState("");
  const [usdBalance, setUsdBalance] = useState("");

  useEffect(() => {
    // TODO: replace this with your real API call e.g. getAccountOverview()
    const fetchAccount = async () => {
      try {
        // Simulated delay — remove when real API is wired up
        await new Promise((res) => setTimeout(res, 1000));
        setWalletAddress("0x1234567890123456789012345678901234567890");
        setBalance("₦ 325,980.65");
        setNgnBalance("₦250,250");
        setUsdBalance("$1,160.52");
      } catch {
        setError("Failed to load account data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccount();
  }, []);
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  return (
    <section className="account-overview-bg rounded-b-xl md:rounded-b-none md:ml-4">
      <div className="relative space-y-5 md:space-y-10 overflow-hidden p-3 md:p-4">
        {openDeposit ? (
          <></>
        ) : (
          <>
            {/* Balance row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {isLoading ? (
                <div className="space-y-2.5 animate-pulse">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-9 w-44 bg-muted rounded" />
                </div>
              ) : error ? (
                <p className="text-sm text-red-500">{error}</p>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total balance
                  </p>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-black">
                    {balance}
                  </h2>
                </div>
              )}

              {/* Wallet address pill — desktop only */}
              {isLoading ? (
                <div className="hidden md:block h-9 w-36 bg-muted rounded animate-pulse" />
              ) : !error ? (
                <div className="hidden md:inline-flex md:items-center gap-2 bg-muted rounded-sm border border-border px-4 py-2">
                  <p className="text-xs font-medium text-foreground">
                    {truncateAddress(walletAddress)}
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    aria-label="Copy wallet address"
                    className="transition-colors"
                    title={copied ? "Copied!" : "Copy address"}
                  >
                    {copied ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                </div>
              ) : null}
            </div>

            {/* Action buttons — always visible */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <button
                onClick={onDepositClick}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-sm bg-primary px-6 sm:px-8 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
              >
                <Download className="size-5" />
                Deposit
              </button>
              <button
                onClick={onWithdrawClick}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-sm bg-muted px-6 sm:px-8 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/80 transition-all active:scale-95 border border-border"
              >
                <Upload className="size-5" />
                Withdraw
              </button>
            </div>

            {/* Mini balance cards */}
            {isLoading ? (
              <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                <div className="rounded-sm bg-muted h-20 md:border-[0.43px] border-[#79797966]" />
                <div className="rounded-sm bg-muted h-20 md:border-[0.43px] border-[#79797966]" />
              </div>
            ) : !error ? (
              <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-sm w-full bg-card p-2.5 md:p-4 md:border-[0.43px] border-[#79797966] shadow-[4px-4px-12px-0px-#0000001A] flex flex-col">
                  <div className="flex items-center justify-between mb-2 grow">
                    <p className="text-xl font-medium text-foreground">NGN</p>
                  </div>
                  <p className="text-base md:text-xl font-semibold">
                    {ngnBalance}
                  </p>
                </div>

                <div className="rounded-sm w-full bg-card p-2.5 md:p-4 md:border-[0.43px] border-[#79797966] shadow-[4px-4px-12px-0px-#0000001A]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                      <CircleDollarSign className="w-6 h-6 text-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">
                        USD
                      </p>
                      <ChevronDown className="size-5 text-foreground" />
                    </div>
                  </div>
                  <p className="text-base md:text-xl font-semibold">
                    {usdBalance}
                  </p>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
