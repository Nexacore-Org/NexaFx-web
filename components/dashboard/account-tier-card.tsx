"use client";

import { useState, useEffect } from "react";
import { Shield, ShieldCheck, Crown, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAccountLimits, type AccountLimits, type AccountTier } from "@/lib/api/users";
import { Skeleton } from "@/components/ui/skeleton";

function LimitRow({
  label,
  used,
  total,
  currency,
}: {
  label: string;
  used: number;
  total: number;
  currency: string;
}) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const color =
    pct < 60 ? "bg-green-500" : pct < 85 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">
          {used.toLocaleString()} / {total.toLocaleString()} {currency}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const TIER_CONFIG: Record<
  AccountTier,
  { icon: typeof Shield; color: string; bg: string; label: string }
> = {
  Basic: { icon: Shield, color: "text-gray-500", bg: "bg-gray-100", label: "Basic" },
  Verified: { icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-100", label: "Verified" },
  Premium: { icon: Crown, color: "text-yellow-600", bg: "bg-yellow-100", label: "Premium" },
};

export function AccountTierCard() {
  const [limits, setLimits] = useState<AccountLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getAccountLimits();
        if (!cancelled) setLimits(data);
      } catch (err) {
        if (!cancelled) setError("Failed to load account tier");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (error || !limits) {
    return (
      <div className="p-4 rounded-xl border border-border bg-card text-center">
        <AlertTriangle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
        <p className="text-sm text-muted-foreground">{error || "Could not load tier"}</p>
      </div>
    );
  }

  const tierConfig = TIER_CONFIG[limits.tier];
  const TierIcon = tierConfig.icon;

  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-4">
      {/* Tier badge */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            tierConfig.bg
          )}
        >
          <TierIcon className={cn("h-5 w-5", tierConfig.color)} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Account Tier</p>
          <p className="text-lg font-bold text-foreground">{tierConfig.label}</p>
        </div>
      </div>

      {/* Limits */}
      <div className="space-y-3">
        <LimitRow
          label="Daily Conversion"
          used={0}
          total={limits.dailyConversionLimit}
          currency={limits.currency}
        />
        <LimitRow
          label="Monthly Conversion"
          used={0}
          total={limits.monthlyConversionLimit}
          currency={limits.currency}
        />
        <LimitRow
          label="Daily Withdrawal"
          used={0}
          total={limits.dailyWithdrawalLimit}
          currency={limits.currency}
        />
        <LimitRow
          label="Monthly Withdrawal"
          used={0}
          total={limits.monthlyWithdrawalLimit}
          currency={limits.currency}
        />
      </div>

      {/* Upgrade section */}
      {limits.nextTier && (
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Upgrade to {limits.nextTier}
              </p>
              {limits.nextTierRequirements && (
                <ul className="mt-1 text-xs text-muted-foreground space-y-0.5">
                  {limits.nextTierRequirements.map((req, i) => (
                    <li key={i}>- {req}</li>
                  ))}
                </ul>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}
