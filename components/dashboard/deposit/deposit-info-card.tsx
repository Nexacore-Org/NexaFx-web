"use client";

import { useEffect, useState } from "react";
import { getLimits, type TransactionLimits } from "@/lib/api/limits";
import { formatCurrency } from "@/lib/utils/format";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

interface DepositInfoCardProps {
  currency?: string;
}

export function DepositInfoCard({ currency = "NGN" }: DepositInfoCardProps) {
  const [limits, setLimits] = useState<TransactionLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);
  const [mobileCollapsed, setMobileCollapsed] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLimits(currency)
      .then((data) => {
        if (!cancelled) setLimits(data);
      })
      .catch(() => {
        if (!cancelled) {
          setLimits({
            currency,
            minDeposit: 1000,
            maxDeposit: 10000000,
            minWithdrawal: 2000,
            maxWithdrawal: 5000000,
            dailyLimit: 20000000,
            monthlyLimit: 50000000,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currency]);

  if (loading) {
    return (
      <div className="mt-6 animate-pulse space-y-3 rounded-xl border border-border p-4">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-4 w-48 bg-muted rounded" />
        <div className="h-4 w-40 bg-muted rounded" />
      </div>
    );
  }

  if (!limits) return null;

  const sections = [
    { label: "Min Deposit", value: formatCurrency(limits.minDeposit, currency) },
    { label: "Max Deposit", value: formatCurrency(limits.maxDeposit, currency) },
    { label: "Min Withdrawal", value: formatCurrency(limits.minWithdrawal, currency) },
    { label: "Max Withdrawal", value: formatCurrency(limits.maxWithdrawal, currency) },
    { label: "Daily Limit", value: formatCurrency(limits.dailyLimit, currency) },
    { label: "Monthly Limit", value: formatCurrency(limits.monthlyLimit, currency) },
  ];

  const showCollapsed = collapsed;
  const visibleSections = showCollapsed ? sections.slice(0, 3) : sections;

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-4">
      {/* Desktop view */}
      <div className="hidden md:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Deposit Limits & Fees</h3>
          </div>
          {collapsed ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
          {visibleSections.map((s) => (
            <div key={s.label}>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="font-medium">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <p>Processing time: 1-3 business days for bank transfers.</p>
          <p>Fees: 0% deposit fee. Withdrawal fees may apply.</p>
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileCollapsed(!mobileCollapsed)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Deposit Limits & Fees</h3>
          </div>
          {mobileCollapsed ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {!mobileCollapsed && (
          <div className="mt-3 space-y-2 text-sm">
            {sections.map((s) => (
              <div key={s.label} className="flex justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className="font-medium">{s.value}</span>
              </div>
            ))}
            <div className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground space-y-1">
              <p>Processing time: 1-3 business days for bank transfers.</p>
              <p>Fees: 0% deposit fee. Withdrawal fees may apply.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
