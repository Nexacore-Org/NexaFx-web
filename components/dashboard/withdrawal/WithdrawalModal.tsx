"use client";

import { useRef } from "react";
import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { WithdrawalMethodSelect } from "./WithdrawalMethodSelect";
import { WithdrawalForm } from "./WithdrawalForm";
import { WithdrawalReview } from "./WithdrawalReview";
import { WithdrawalSuccess } from "@/components/dashboard/withdraw/withdrawal-success";
import type { Transaction } from "@/lib/api/transactions";
import { cn } from "@/lib/utils";
import { X, XCircle } from "lucide-react";

export function WithdrawalModal() {
  const { isOpen, step, close, reset, amount, currency, walletAddress, transactionId, errorMessage } = useWithdrawalStore();
  const isProcessing = step === "processing";
  const desktopModalRef = useRef<HTMLDivElement>(null);
  const mobileModalRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (isProcessing) return;
    close();
    // Reset after animation
    setTimeout(() => reset(), 300);
  };

  // Use focus trap for desktop modal
  useFocusTrap(isOpen, handleClose, desktopModalRef);

  // Use focus trap for mobile modal
  useFocusTrap(isOpen, handleClose, mobileModalRef);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (isProcessing) return;
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const successTransaction: Transaction = {
    id: transactionId ?? "",
    type: "Withdraw",
    currency,
    amount: parseFloat(amount) || 0,
    amountString: `${parseFloat(amount).toLocaleString()} ${currency}`,
    date: new Date().toISOString(),
    status: "Pending",
    reference: transactionId ?? "",
    walletAddress,
  };

  const renderStep = () => {
    switch (step) {
      case "select":
        return <WithdrawalMethodSelect />;
      case "form":
        return <WithdrawalForm />;
      case "review":
      case "processing":
        return <WithdrawalReview />;
      case "success":
        return <WithdrawalSuccess transaction={successTransaction} />;
      case "error":
        return <WithdrawalErrorDisplay message={errorMessage} onRetry={() => close()} />;
      default:
        return <WithdrawalMethodSelect />;
    }
  };

  function WithdrawalErrorDisplay({ message, onRetry }: { message: string | null; onRetry: () => void }) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center pt-8 pb-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-red-500/10">
            <XCircle className="size-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-red-500">Withdrawal Failed</h2>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            {message || "Something went wrong. Please try again."}
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <button
            onClick={onRetry}
            className="w-full py-3.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Modal - Desktop */}
          <div
            ref={desktopModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdrawal-modal-title"
            className={cn(
              "fixed z-50 animate-in fade-in slide-in-from-bottom-4 duration-300",
              // Desktop: centered modal
              "hidden md:flex md:items-center md:justify-center md:inset-0 md:p-4",
            )}
            onClick={handleBackdropClick}
          >
            <div className="relative w-full max-w-md bg-card rounded-xl shadow-2xl overflow-hidden">
              {/* Close button */}
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                aria-label="Close withdrawal modal"
              >
                <X className="size-5 text-muted-foreground" />
              </button>
              {renderStep()}
            </div>
          </div>

          {/* Modal - Mobile (Full Screen) */}
          <div
            ref={mobileModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdrawal-modal-title"
            className={cn(
              "fixed inset-0 z-50 md:hidden",
              "bg-card animate-in slide-in-from-bottom duration-300",
            )}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
              aria-label="Close withdrawal modal"
            >
              <X className="size-5 text-muted-foreground" />
            </button>
            <div className="h-full overflow-y-auto">{renderStep()}</div>
          </div>
        </>
      )}
    </>
  );
}
