"use client";

import {
  ChevronDown,
  Download,
  Upload,
  CircleDollarSign,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getBalances } from "@/lib/api/wallet";
import { getProfile } from "@/lib/api/users";
import { CopyButton } from "@/components/ui/copy-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAuthStore } from "@/hooks/use-auth-store";
import { logger } from "@/src/utils/logger";

const truncateAddress = (addr: string) =>
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

export function formatCurrency(amount: string | number | undefined, currency: string) {
  if (amount === undefined || amount === null || amount === "") return "";
  const raw = typeof amount === "string" ? amount.replace(/[^0-9.-]+/g, "") : String(amount);
  const num = Number(raw);
  if (!Number.isFinite(num)) return String(amount);
  try {
    const locale = currency === "NGN" ? "en-NG" : "en-US";
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(num);
  } catch {
    return String(amount);
  }
}

/**
 * Build a currency→balance lookup from the `getBalances()` response shape
 * ({ currency, balance }[]) and pull out the NGN and USD figures. Keys are
 * upper-cased so a lower/mixed-case `currency` (e.g. "ngn") still resolves —
 * the case-insensitive fallback the old `balanceMap["NGN"] ?? balanceMap["NGN"]`
 * no-op was meant to provide but never did.
 */
export function resolveBalances(
  balances:
    | { currency?: string; balance?: string | number }[]
    | null
    | undefined,
): { ngn: string; usd: string } {
  const balanceMap: Record<string, string> = {};
  for (const b of balances ?? []) {
    if (!b || !b.currency) continue;
    balanceMap[String(b.currency).toUpperCase()] = String(b.balance ?? "");
  }
  return { ngn: balanceMap["NGN"] ?? "", usd: balanceMap["USD"] ?? "" };
}

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [ngnBalance, setNgnBalance] = useState("");
  const [usdBalance, setUsdBalance] = useState("");

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
      setError(null);

      const ngnItem = wsBalance.find(
        (b) => b.currency.toUpperCase() === "NGN"
      );
      const usdItem = wsBalance.find(
        (b) => b.currency.toUpperCase() === "USD"
      );
      const firstItem = wsBalance[0];

      if (ngnItem) {
        setBalance(formatCurrency(ngnItem.balance, "NGN"));
      } else if (usdItem) {
        setBalance(formatCurrency(usdItem.balance, "USD"));
      } else {
        setBalance(formatCurrency(firstItem.balance, firstItem.currency));
      }
    }
  }, [wsBalance]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const fetchAccount = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [profile, balances] = await Promise.all([getProfile(), getBalances()]);

        if (cancelled) return;

        const addr = profile?.walletAddress ?? "";
        setWalletAddress(addr);

        const { ngn, usd } = resolveBalances(balances);

        const formattedNgn = ngn ? formatCurrency(ngn, "NGN") : "";
        const formattedUsd = usd ? formatCurrency(usd, "USD") : "";

        setNgnBalance(formattedNgn);
        setUsdBalance(formattedUsd);

        setBalance(formattedNgn || formattedUsd || "");
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Failed to load account data", err);
        setError("Failed to load account data");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchAccount();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

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
                <div className="space-y-2.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-44" />
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
                <Skeleton className="hidden md:block h-9 w-36" />
              ) : !error ? (
                <div className="hidden md:inline-flex md:items-center gap-2 bg-muted rounded-sm border border-border px-4 py-2">
                  <p className="text-xs font-medium text-foreground">
                    {truncateAddress(walletAddress)}
                  </p>
                  <CopyButton value={walletAddress} label="Copy wallet address" size="sm" />
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
              <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-20 rounded-sm" />
                <Skeleton className="h-20 rounded-sm" />
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
