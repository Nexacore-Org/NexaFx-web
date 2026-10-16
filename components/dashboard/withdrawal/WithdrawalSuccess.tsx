"use client";

import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { CheckCircle2, XCircle, ExternalLink, Loader2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/utils/haptics";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "@/hooks/use-toast-store";
import { WITHDRAWAL_SUCCESS_CURRENCIES } from "@/lib/currencies";
import { getTransactionById } from "@/lib/api/transactions";
import type { TransactionStatus } from "@/lib/api/transactions";
import Link from "next/link";

/** Maximum number of times to poll before stopping. */
const MAX_POLL_ATTEMPTS = 5;
/** Interval between polls in ms. */
const POLL_INTERVAL_MS = 3000;

type StatusPillVariant = "pending" | "success" | "failed";

interface StatusPillProps {
  status: StatusPillVariant;
}

/** Renders the transaction status as a coloured pill. */
function StatusPill({ status }: StatusPillProps) {
  const variants: Record<StatusPillVariant, { label: string; className: string; dotClass: string }> = {
    pending: {
      label: "Pending",
      className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
      dotClass: "bg-yellow-500 animate-pulse",
    },
    success: {
      label: "Success",
      className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      dotClass: "bg-green-500",
    },
    failed: {
      label: "Failed",
      className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      dotClass: "bg-red-500",
    },
  };

  const { label, className, dotClass } = variants[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        className,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dotClass)} />
      {label}
    </span>
  );
}

/** Map API TransactionStatus to the StatusPill variant. */
function toStatusPillVariant(status: TransactionStatus | null): StatusPillVariant {
  if (status === "Success") return "success";
  if (status === "Failed") return "failed";
  return "pending";
}

/** Truncate a long address for display. */
function truncateAddress(addr: string, head = 8, tail = 6): string {
  if (addr.length <= head + tail + 3) return addr;
  return `${addr.slice(0, head)}...${addr.slice(-tail)}`;
}

export function WithdrawalSuccess() {
  const {
    currency,
    amount,
    walletAddress,
    transactionId,
    transactionStatus,
    errorMessage,
    close,
    reset,
    setStep,
    setFormData,
    setTransactionResult,
  } = useWithdrawalStore();

  const [copied, setCopied] = useState(false);
  const [polledStatus, setPolledStatus] = useState<TransactionStatus | null>(null);
  const pollCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedCurrency =
    WITHDRAWAL_SUCCESS_CURRENCIES.find((c) => c.id === currency) ||
    WITHDRAWAL_SUCCESS_CURRENCIES[0];

  const isSuccess = transactionStatus === "success";

  // Derive the display status: prefer polled result (real API status),
  // fall back to the status from the initial withdrawal response.
  const displayStatus: TransactionStatus | null = polledStatus
    ?? (transactionStatus === "success" ? "Success" : transactionStatus === "failed" ? "Failed" : "Pending");

  const statusPillVariant = toStatusPillVariant(displayStatus);

  /** Poll the transaction status up to MAX_POLL_ATTEMPTS times. */
  const poll = useCallback(async () => {
    if (!transactionId || pollCountRef.current >= MAX_POLL_ATTEMPTS) return;
    pollCountRef.current += 1;

    try {
      const tx = await getTransactionById(transactionId);
      setPolledStatus(tx.status);
      // Update the store so other components see the latest status too
      setTransactionResult(
        transactionId,
        tx.status === "Success" ? "success" : tx.status === "Failed" ? "failed" : "pending",
      );

      // Stop polling once we reach a terminal state
      if (tx.status === "Success" || tx.status === "Failed") return;
    } catch {
      // Polling failure is non-fatal — silently stop
    }

    if (pollCountRef.current < MAX_POLL_ATTEMPTS) {
      timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    }
  }, [transactionId, setTransactionResult]);

  useEffect(() => {
    if (isSuccess && transactionId) {
      toast("Withdrawal submitted", "success");
      setFormData({ amount: "", walletAddress: "" });

      // Start polling after a short delay so the initial render settles
      timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, transactionId]);

  const handleCopyTxId = () => {
    if (transactionId) {
      navigator.clipboard.writeText(transactionId);
      setCopied(true);
      haptics.light();
      toast("Transaction ID copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDone = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    close();
    setTimeout(() => reset(), 300);
  };

  const handleMakeAnother = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    reset();
    setStep("select");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Status Icon */}
      <div className="flex flex-col items-center pt-8 pb-4">
        <div
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-4",
            isSuccess ? "bg-green-500/10" : "bg-red-500/10",
          )}
        >
          {isSuccess ? (
            <CheckCircle2 className="size-10 text-green-500" />
          ) : (
            <XCircle className="size-10 text-red-500" />
          )}
        </div>

        <h2
          className={cn(
            "text-xl font-bold",
            isSuccess ? "text-green-500" : "text-red-500",
          )}
        >
          {isSuccess ? "Withdrawal Submitted" : "Withdrawal Failed"}
        </h2>

        <p className="text-sm text-muted-foreground mt-1 text-center">
          {isSuccess
            ? "Your withdrawal is being processed"
            : errorMessage || "Something went wrong. Please try again."}
        </p>
      </div>

      {/* Amount Display */}
      {isSuccess && (
        <div className="bg-muted/30 rounded-xl p-5 text-center border border-border">
          <p className="text-sm text-muted-foreground mb-2">Amount Withdrawn</p>
          <div className="flex items-center justify-center gap-3">
            {selectedCurrency.icon}
            <span className="text-2xl font-bold text-foreground">
              {parseFloat(amount).toLocaleString()} {currency}
            </span>
          </div>
        </div>
      )}

      {/* Transaction Details */}
      {isSuccess && transactionId && (
        <div className="space-y-3">
          {/* Transaction ID row */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs text-muted-foreground">Transaction ID</p>
              <p className="text-sm font-mono font-medium text-foreground truncate">
                {transactionId}
              </p>
            </div>
            <button
              onClick={handleCopyTxId}
              aria-label="Copy transaction ID"
              className="ml-2 p-1.5 rounded-md hover:bg-muted transition-colors flex-shrink-0"
            >
              {copied ? (
                <Check className="size-4 text-green-500" />
              ) : (
                <Copy className="size-4 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Status row */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Status</p>
            </div>
            <div className="flex items-center gap-2">
              {polledStatus === null && pollCountRef.current === 0 && (
                <Loader2 className="size-3 animate-spin text-muted-foreground" />
              )}
              <StatusPill status={statusPillVariant} />
            </div>
          </div>

          {/* Destination row */}
          {walletAddress && (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="text-sm font-mono font-medium text-foreground">
                  {truncateAddress(walletAddress)}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(walletAddress);
                  toast("Address copied", "success");
                }}
                aria-label="Copy destination address"
                className="ml-2 p-1.5 rounded-md hover:bg-muted transition-colors flex-shrink-0"
              >
                <Copy className="size-4 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Info Note */}
      {isSuccess && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Your transaction is being processed. It may take a few minutes to
            reflect in your wallet.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <button
          onClick={isSuccess ? handleDone : () => setStep("review")}
          className={cn(
            "w-full py-3.5 rounded-xl font-semibold",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 active:scale-[0.98]",
            "transition-all duration-200",
          )}
        >
          {isSuccess ? "Done" : "Try Again"}
        </button>

        {isSuccess && transactionId && (
          <Link
            href={`/transactions/${transactionId}`}
            onClick={handleDone}
            className="w-full py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="size-4" />
            View Transaction
          </Link>
        )}

        {isSuccess && (
          <button
            onClick={handleMakeAnother}
            className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Make another withdrawal
          </button>
        )}
      </div>
    </div>
  );
}
