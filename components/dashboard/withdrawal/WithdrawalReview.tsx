"use client";

import { useWithdrawalStore } from "@/hooks/use-withdrawal-store";
import { useWithdrawalLimits } from "@/hooks/use-withdrawal-limits";
import { useSubmitOnce } from "@/hooks/use-submit-once";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { createWithdrawal } from "@/lib/api/transactions";
import { WithdrawalConfirmationModal } from "@/components/dashboard/withdraw/withdrawal-confirmation-modal";
import { CurrencyIcon } from "@/components/ui/currency-icon";
import { getCurrency, formatMoney } from "@/lib/currencies";
import {
  calculateWithdrawalFee,
  formatWithdrawalFee,
  type WithdrawalNetwork,
} from "@/lib/utils/withdrawal-fee";
import { useState } from "react";

export function WithdrawalReview() {
    const { currency, amount, walletAddress, memo, step, setStep, setTransactionResult, close, reset } = useWithdrawalStore();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { remainingDaily, remainingMonthly, isLoading: limitsLoading } = useWithdrawalLimits(currency);

    const isProcessingStep = step === 'processing';
    const selectedCurrency = getCurrency(currency);
    const network: WithdrawalNetwork = 'Stellar';
    const fee = calculateWithdrawalFee(currency, amount, network);

    const truncateAddress = (addr: string) => {
        if (addr.length <= 16) return addr;
        return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
    };

    const handleConfirmClick = () => {
        if (isProcessingStep) return;
        setShowConfirmation(true);
    };

    const submitWithdrawal = async () => {
        setStep('processing');
        try {
            const response = await createWithdrawal({
                currency,
                amount: parseFloat(amount),
                destinationAddress: walletAddress,
                ...(memo ? { memo } : {}),
            });
            setTransactionResult(response.transactionId, 'success');
            setStep('success');
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'An unexpected error occurred';
            setTransactionResult(null, 'failed', errorMessage);
            setStep('error');
        } finally {
            setShowConfirmation(false);
        }
    };

    const { handleSubmit: handleConfirmedWithdrawal, isSubmitting: isProcessing } = useSubmitOnce(submitWithdrawal);

    const handleCancel = () => {
        if (isProcessingStep) return;
        close();
        setTimeout(() => reset(), 300);
    };

    return (
        <div className="p-6 space-y-6 relative">
            {showConfirmation && (
                <WithdrawalConfirmationModal
                    amount={amount}
                    currency={currency}
                    destinationAddress={walletAddress}
                    onConfirm={handleConfirmedWithdrawal}
                    onCancel={() => setShowConfirmation(false)}
                    isLoading={isProcessing}
                />
            )}
            {/* Header */}
            <div className="flex items-center gap-3 pt-4">
                <button
                    onClick={() => setStep('form')}
                    disabled={isProcessingStep}
                    className={cn(
                        "p-2 -ml-2 rounded-full hover:bg-muted transition-colors",
                        isProcessingStep && "opacity-50 cursor-not-allowed"
                    )}
                    aria-label="Go back to withdrawal form"
                >
                    <ChevronLeft className="size-5 text-muted-foreground" />
                </button>
                <div>
                    <h2 id="withdrawal-modal-title" className="text-xl font-bold text-foreground">Review Withdrawal</h2>
                    <p className="text-sm text-muted-foreground">Confirm your withdrawal details</p>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-muted/30 rounded-xl p-5 space-y-4 border border-border">
                {/* Amount */}
                <div className="text-center pb-4 border-b border-border">
                    <p className="text-sm text-muted-foreground mb-1">You are withdrawing</p>
                    <div className="flex items-center justify-center gap-3">
                        <CurrencyIcon currency={currency} className="w-8 h-8" />
                        <span className="text-3xl font-bold text-foreground">
                            {formatMoney(parseFloat(amount), currency)}
                        </span>
                    </div>
                    {selectedCurrency && (
                        <p className="text-sm text-muted-foreground mt-1">{selectedCurrency.name}</p>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Destination</span>
                        <span className="text-sm font-medium text-foreground font-mono">
                            {truncateAddress(walletAddress)}
                        </span>
                    </div>
                    {memo && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Memo</span>
                            <span className="text-sm font-medium text-foreground font-mono break-all text-right">
                                {memo}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Network</span>
                        <span className="text-sm font-medium text-foreground">
                            {network}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Fee</span>
                        <span className={cn(
                            "text-sm font-medium",
                            fee.amount <= 0 ? "text-green-500" : "text-foreground",
                        )}>
                            {formatWithdrawalFee(fee)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Withdrawal Limits */}
            {!limitsLoading && currency && (remainingDaily !== null || remainingMonthly !== null) && (
                <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Remaining Limits</p>
                    {remainingDaily !== null && (
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Daily</span>
                            <span className="font-medium text-foreground">
                                {remainingDaily} {currency}
                            </span>
                        </div>
                    )}
                    {remainingMonthly !== null && (
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Monthly</span>
                            <span className="font-medium text-foreground">
                                {remainingMonthly} {currency}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    <span className="font-semibold">Important:</span> Please verify the wallet address is correct. Transactions cannot be reversed once confirmed.
                </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
                <button
                    onClick={handleConfirmClick}
                    disabled={isProcessingStep}
                    className={cn(
                        "w-full py-3 rounded-xl font-semibold transition-colors",
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                        isProcessingStep && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isProcessingStep ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
                <button
                    onClick={handleCancel}
                    disabled={isProcessingStep}
                    className={cn(
                        "w-full py-3 rounded-xl font-semibold transition-colors",
                        "bg-muted text-foreground hover:bg-muted/80",
                        isProcessingStep && "opacity-50 cursor-not-allowed"
                    )}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
