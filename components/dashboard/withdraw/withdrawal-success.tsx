"use client";

import Link from "next/link";
import { CheckCircle2, Copy, ExternalLink, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import type { Transaction } from "@/lib/api/transactions";

interface WithdrawalSuccessProps {
  transaction: Transaction;
}

export function WithdrawalSuccess({ transaction }: WithdrawalSuccessProps) {
  const [copied, setCopied] = useState(false);
  const resetForm = useWithdrawalStore((state) => state.resetForm);

  const handleCopy = () => {
    navigator.clipboard.writeText(transaction.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col items-center pt-4 pb-2">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="size-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Withdrawal submitted</h2>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Your withdrawal request has been received and is now being processed.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Transaction ID</p>
            <p className="mt-1 font-mono text-sm text-foreground">{transaction.id}</p>
          </div>
          <button
            onClick={handleCopy}
            className="rounded-lg p-2 transition-colors hover:bg-background"
            aria-label="Copy transaction ID"
          >
            <Copy className={cn("size-4", copied ? "text-green-500" : "text-muted-foreground")} />
          </button>
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-background/70 p-3">
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="mt-1 font-semibold text-foreground">{transaction.amountString}</p>
          </div>
          <div className="rounded-lg border border-border bg-background/70 p-3">
            <p className="text-xs text-muted-foreground">Currency</p>
            <p className="mt-1 font-semibold text-foreground">{transaction.currency}</p>
          </div>
          <div className="rounded-lg border border-border bg-background/70 p-3 sm:col-span-2">
            <p className="text-xs text-muted-foreground">Destination address</p>
            <p className="mt-1 break-all font-mono text-sm text-foreground">
              {transaction.destinationAddress || transaction.reference || "Pending verification"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background/70 p-3 sm:col-span-2">
            <p className="text-xs text-muted-foreground">Estimated processing time</p>
            <p className="mt-1 font-semibold text-foreground">1-3 business days</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <Link
          href="/dashboard/transactions"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          View in transactions
          <ArrowRight className="size-4" />
        </Link>
        <button
          onClick={() => resetForm()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ExternalLink className="size-4" />
          Make another withdrawal
        </button>
      </div>
    </div>
  );
}
