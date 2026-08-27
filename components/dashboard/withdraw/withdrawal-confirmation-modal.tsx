"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WithdrawalConfirmationModalProps {
  amount: string;
  currency: string;
  destinationAddress: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function WithdrawalConfirmationModal({
  amount,
  currency,
  destinationAddress,
  onConfirm,
  onCancel,
  isLoading,
}: WithdrawalConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        className="relative w-full max-w-md bg-card rounded-xl shadow-2xl border border-border p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200"
      >
        <h3
          id="confirmation-modal-title"
          className="text-lg font-bold text-foreground text-center"
        >
          Confirm Withdrawal
        </h3>

        <div className="bg-muted/30 rounded-xl p-5 space-y-4 border border-border">
          <div className="text-center pb-4 border-b border-border">
            <p className="text-sm text-muted-foreground mb-1">You are withdrawing</p>
            <p className="text-2xl font-bold text-foreground">
              {parseFloat(amount).toLocaleString()} {currency}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">To:</p>
            <p className="text-sm font-mono font-medium text-foreground break-all bg-muted/50 p-3 rounded-lg border border-border">
              {destinationAddress}
            </p>
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-xs text-red-600 dark:text-red-400 text-center font-medium">
            This action cannot be undone. Funds sent to an incorrect address cannot be recovered.
          </p>
        </div>

        <div className="space-y-3">
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
            className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
