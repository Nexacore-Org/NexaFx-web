"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WithdrawalConfirmationModalProps {
  amount: string | number;
  currency: string;
  destinationAddress: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function WithdrawalConfirmationModal({
  amount,
  currency,
  destinationAddress,
  onConfirm,
  onCancel,
  isLoading = false,
}: WithdrawalConfirmationModalProps) {
  const formattedAmount =
    typeof amount === "number"
      ? amount.toLocaleString()
      : amount;

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2 pt-2">
        <h2 className="text-xl font-bold text-foreground">Confirm withdrawal</h2>
        <p className="text-sm text-muted-foreground">
          Review the destination address carefully before you submit.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
        <div className="text-center border-b border-border pb-4">
          <p className="text-sm text-muted-foreground mb-1">You are withdrawing</p>
          <p className="text-3xl font-bold text-foreground">
            {formattedAmount} {currency}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">To</p>
          <div className="rounded-lg border border-border bg-background/80 p-3">
            <p className="text-sm font-mono text-foreground break-all whitespace-pre-wrap">
              {destinationAddress.trim() || "No address provided"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
        <div className="flex gap-2">
          <AlertTriangle className="size-4 mt-0.5 shrink-0 text-yellow-600 dark:text-yellow-400" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
              This action cannot be undone.
            </p>
            <p className="text-xs text-yellow-700/90 dark:text-yellow-400">
              Funds sent to an incorrect address cannot be recovered.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            "w-full py-3.5 rounded-xl font-semibold",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 active:scale-[0.98]",
            "transition-all duration-200",
            "flex items-center justify-center gap-2",
            isLoading && "opacity-80 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm Withdrawal"
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className={cn(
            "w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
