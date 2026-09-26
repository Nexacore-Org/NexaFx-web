"use client";

import { CheckCircle2, ExternalLink, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import type { Transaction } from "@/lib/api/transactions";
import { CopyButton } from "@/components/ui/copy-button";

interface WithdrawalSuccessProps {
  transaction: Transaction;
}

export function WithdrawalSuccess({ transaction }: WithdrawalSuccessProps) {
  const router = useRouter();
  const { close, reset } = useWithdrawalStore();

  const handleViewTransactions = () => {
    close();
    setTimeout(() => reset(), 300);
    router.push("/dashboard/transactions");
  };

  const handleNewWithdrawal = () => {
    reset();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col items-center pt-8 pb-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-green-500/10">
          <CheckCircle2 className="size-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-green-500">Withdrawal Submitted</h2>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          Your withdrawal has been submitted successfully
        </p>
      </div>

      <div className="bg-muted/30 rounded-xl p-5 space-y-4 border border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Transaction ID</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-medium text-foreground">
              {transaction.id}
            </span>
            <CopyButton value={transaction.id} label="Copy transaction ID" size="sm" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="text-sm font-medium text-foreground">
            {transaction.amount.toLocaleString()} {transaction.currency}
          </span>
        </div>
        {transaction.walletAddress && (
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Destination Address</span>
            <p className="text-sm font-mono font-medium text-foreground break-all bg-muted/50 p-2 rounded border border-border">
              {transaction.walletAddress}
            </p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Estimated Processing Time</span>
          <span className="text-sm font-medium text-foreground">15-30 minutes</span>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Your transaction is being processed. It may take a few minutes to reflect in your
          wallet.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <button
          onClick={handleViewTransactions}
          className="w-full py-3.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
        >
          <ExternalLink className="size-4" />
          View in Transactions
        </button>
        <button
          onClick={handleNewWithdrawal}
          className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="size-4" />
          Make Another Withdrawal
        </button>
      </div>
    </div>
  );
}
