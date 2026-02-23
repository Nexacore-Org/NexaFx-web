"use client";

import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createWithdrawal } from "@/lib/api/transactions";

const currencies = [
    { id: 'USDC', name: 'USD Coin', icon: '/icons/usdc.svg' },
    { id: 'ETH', name: 'Ethereum', icon: '/icons/eth.svg' },
    { id: 'BNB', name: 'BNB', icon: '/icons/bnb.svg' },
];

export function WithdrawalReview() {
    const { currency, amount, walletAddress, step, setStep, setTransactionResult, close, reset } = useWithdrawalStore();

    const isProcessing = step === 'processing';
    const selectedCurrency = currencies.find(c => c.id === currency) || currencies[0];

    const truncateAddress = (addr: string) => {
        if (addr.length <= 16) return addr;
        return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
    };

    const handleConfirm = async () => {
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
        }
    };

    const handleCancel = () => {
        if (isProcessing) return;
        close();
        setTimeout(() => reset(), 300);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pt-4">
                <button
                    onClick={() => setStep('form')}
                    disabled={isProcessing}
                    className={cn(
                        "p-2 -ml-2 rounded-full hover:bg-muted transition-colors",
                        isProcessing && "opacity-50 cursor-not-allowed"
                    )}
                    aria-label="Go back to withdrawal form"
                >
                    <ChevronLeft className="size-5 text-muted-foreground" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-foreground">Review Withdrawal</h2>
                    <p className="text-sm text-muted-foreground">Confirm your withdrawal details</p>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-muted/30 rounded-xl p-5 space-y-4 border border-border">
                {/* Amount */}
                <div className="text-center pb-4 border-b border-border">
                    <p className="text-sm text-muted-foreground mb-1">You are withdrawing</p>
                    <div className="flex items-center justify-center gap-3">
                        <img
                            src={selectedCurrency.icon}
                            alt={selectedCurrency.name}
                            className="w-8 h-8 rounded-full"
                        />
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
                            {currency === 'ETH' ? 'Ethereum' : currency === 'BNB' ? 'BSC' : 'Stellar'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Fee</span>
                        <span className="text-sm font-medium text-green-500">
                            Free
                        </span>
                    </div>
                </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    <span className="font-semibold">Important:</span> Please verify the wallet address is correct. Transactions cannot be reversed once confirmed.
                </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
                <button
                    onClick={handleConfirm}
                    disabled={isProcessing}
                    className={cn(
                        "w-full py-3.5 rounded-xl font-semibold",
                        "bg-primary text-primary-foreground",
                        "hover:bg-primary/90 active:scale-[0.98]",
                        "transition-all duration-200",
                        "flex items-center justify-center gap-2",
                        isProcessing && "opacity-80 cursor-not-allowed"
                    )}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="size-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        "Confirm Withdrawal"
                    )}
                </button>
                <button
                    onClick={() => setStep('form')}
                    disabled={isProcessing}
                    className={cn(
                        "w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
                        isProcessing && "opacity-50 cursor-not-allowed"
                    )}
                >
                    Go Back
                </button>
                <button
                    onClick={handleCancel}
                    disabled={isProcessing}
                    className={cn(
                        "w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
                        isProcessing && "opacity-50 cursor-not-allowed"
                    )}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
