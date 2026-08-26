"use client";

import { useState } from "react";
import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { useWithdrawalLimits } from "@/hooks/use-withdrawal-limits";
import { ChevronLeft, Coins, CircleDollarSign, BadgeDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { createWithdrawal } from "@/lib/api/transactions";
import { WithdrawalConfirmationModal } from "@/components/dashboard/withdraw/withdrawal-confirmation-modal";
import {
  calculateWithdrawalFee,
  formatWithdrawalFee,
  type WithdrawalNetwork,
} from "@/lib/utils/withdrawal-fee";

const currencies = [
    { id: 'USDC', name: 'USD Coin', icon: <CircleDollarSign className="w-8 h-8 text-blue-500" /> },
    { id: 'ETH', name: 'Ethereum', icon: <BadgeDollarSign className="w-8 h-8 text-neutral-500" /> },
    { id: 'BNB', name: 'BNB', icon: <Coins className="w-8 h-8 text-yellow-500" /> },
];

export function WithdrawalReview() {
    const { currency, amount, walletAddress, step, setStep, setTransactionResult, close, reset } = useWithdrawalStore();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { remainingDaily, remainingMonthly, isLoading: limitsLoading } = useWithdrawalLimits(currency);

    const isProcessingStep = step === 'processing';
    const selectedCurrency = currencies.find(c => c.id === currency) || currencies[0];
    const network: WithdrawalNetwork =
        currency === 'ETH' ? 'Ethereum' : currency === 'BNB' ? 'BSC' : 'Stellar';
    const fee = calculateWithdrawalFee(currency, amount, network);

    const truncateAddress = (addr: string) => {
        if (addr.length <= 16) return addr;
        return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
    };

    const handleConfirmClick = () => {
        setShowConfirmation(true);
    };

    const handleConfirmedWithdrawal = async () => {
        setIsProcessing(true);
        setStep('processing');

        try {
            const response = await createWithdrawal({
                currency,
                amount,
                walletAddress,
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
            setIsProcessing(false);
            setShowConfirmation(false);
        }
    };

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
                        {selectedCurrency.icon}
                        <span className="text-3xl font-bold text-foreground">
                            {parseFloat(amount).toLocaleString()} {currency}
                        </span>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Destination</span>
                        <span className="text-sm font-medium text-foreground font-mono">
                            {truncateAddress(walletAddress)}
                        </span>
                    </div>
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
                        "w-full py-3.5 rounded-xl font-semibold",
                        "bg-primary text-primary-foreground",
                        "hover:bg-primary/90 active:scale-[0.98]",
                        "transition-all duration-200",
                        "flex items-center justify-center gap-2",
                        isProcessingStep && "opacity-80 cursor-not-allowed"
                    )}
                >
                    Confirm Withdrawal
                </button>
                <button
                    onClick={() => setStep('form')}
                    disabled={isProcessingStep}
                    className={cn(
                        "w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
                        isProcessingStep && "opacity-50 cursor-not-allowed"
                    )}
                >
                    Go Back
                </button>
                <button
                    onClick={handleCancel}
                    disabled={isProcessingStep}
                    className={cn(
                        "w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
                        isProcessingStep && "opacity-50 cursor-not-allowed"
                    )}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
