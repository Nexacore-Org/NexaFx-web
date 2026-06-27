"use client";

import {
  Download,
  Upload,
  Copy,
  Check,
  CircleDollarSign,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getBalances, type WalletBalance } from "@/lib/api/wallet";
import { getProfile } from "@/lib/api/users";
import { formatCurrency } from "@/lib/utils/format";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAuthStore } from "@/hooks/use-auth-store";

const truncateAddress = (addr: string) => {
  if (!addr) return "";
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

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
  const [balances, setBalances] = useState<WalletBalance[]>([]);

  const wsBalance = useWebSocket((s) => s.balance);
  const accessToken = useAuthStore((s) => s.accessToken);
  const subscribe = useWebSocket((s) => s.subscribe);

  useEffect(() => {
    if (accessToken) {
      subscribe(accessToken);
    }
  }, [accessToken, subscribe]);

  useEffect(() => {
    if (wsBalance && wsBalance.length > 0) {
      setBalances(wsBalance);
      setError(null);

      const ngnItem = wsBalance.find(
        (b) => b.currency.toUpperCase() === "NGN"
      );
      const usdItem = wsBalance.find(
        (b) => b.currency.toUpperCase() === "USD"
      );
      const firstItem = wsBalance[0];

      if (ngnItem) {
        setBalance(formatCurrency(ngnItem.amount, "NGN"));
      } else if (usdItem) {
        setBalance(formatCurrency(usdItem.amount, "USD"));
      } else {
        setBalance(formatCurrency(firstItem.amount, firstItem.currency));
      }
    }
  }, [wsBalance]);

  useEffect(() => {
    let cancelled = false;

    const fetchAccount = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [profile, balancesData] = await Promise.all([
          getProfile().catch((err) => {
            console.error("Failed to load profile", err);
            return null;
          }),
          getBalances(),
        ]);

        if (cancelled) return;

        // Use walletAddress from balance response if available, fallback to profile
        const balanceWithAddress = balancesData.find((b) => b.walletAddress);
        const addr = balanceWithAddress?.walletAddress || profile?.walletAddress || "";
        setWalletAddress(addr);

        setBalances(balancesData);

        if (balancesData.length > 0) {
          const ngnBalanceItem = balancesData.find(
            (b) => b.currency.toUpperCase() === "NGN"
          );
          const usdBalanceItem = balancesData.find(
            (b) => b.currency.toUpperCase() === "USD"
          );
          const firstBalanceItem = balancesData[0];

          let totalBalanceStr = "";
          if (ngnBalanceItem) {
            totalBalanceStr = formatCurrency(ngnBalanceItem.amount, "NGN");
          } else if (usdBalanceItem) {
            totalBalanceStr = formatCurrency(usdBalanceItem.amount, "USD");
          } else {
            totalBalanceStr = formatCurrency(
              firstBalanceItem.amount,
              firstBalanceItem.currency
            );
          }
          setBalance(totalBalanceStr);
        } else {
          setBalance("");
        }
      } catch (err) {
        console.error("Failed to load account data", err);
        setError("Unable to load balances — please refresh");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchAccount();
    return () => {
      cancelled = true;
    };
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
                <div className="space-y-2.5">
                  <p className="text-sm font-medium text-red-500">{error}</p>
                </div>
              ) : balances.length === 0 ? (
                <div className="space-y-2.5">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total balance
                  </p>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-black">
                    No balances found
                  </h2>
                </div>
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
              ) : !error && walletAddress ? (
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
            ) : error ? (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            ) : balances.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 font-medium">
                No balances found
              </p>
            ) : (
              <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4">
                {balances.map((b) => (
                  <div
                    key={b.currency}
                    className="rounded-sm w-full bg-card p-2.5 md:p-4 md:border-[0.43px] border-[#79797966] shadow-[4px-4px-12px-0px-#0000001A] flex flex-col justify-between min-h-[80px]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {b.currency.toUpperCase() === "USD" && (
                          <CircleDollarSign className="w-5 h-5 text-foreground" />
                        )}
                        <p className="text-sm font-medium text-foreground">
                          {b.currency.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <p className="text-base md:text-xl font-semibold">
                      {formatCurrency(b.amount, b.currency)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
