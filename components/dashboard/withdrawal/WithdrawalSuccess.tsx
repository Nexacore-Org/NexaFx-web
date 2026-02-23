"use client";

import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { CheckCircle2, XCircle, Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const currencies = [
    { id: 'USDC', name: 'USD Coin', icon: '/icons/usdc.svg' },
    { id: 'ETH', name: 'Ethereum', icon: '/icons/eth.svg' },
    { id: 'BNB', name: 'BNB', icon: '/icons/bnb.svg' },
];

export function WithdrawalSuccess() {
    const { currency, amount, transactionId, transactionStatus, errorMessage, close, reset, setStep } = useWithdrawalStore();
    const [copied, setCopied] = useState(false);

    const selectedCurrency = currencies.find(c => c.id === currency) || currencies[0];
    const isSuccess = transactionStatus === 'success';

    const handleCopyTxId = () => {
        if (transactionId) {
            navigator.clipboard.writeText(transactionId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDone = () => {
        close();
        setTimeout(() => reset(), 300);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Status Icon */}
            <div className="flex flex-col items-center pt-8 pb-4">
                <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center mb-4",
                    isSuccess ? "bg-green-500/10" : "bg-red-500/10"
                )}>
                    {isSuccess ? (
                        <CheckCircle2 className="size-10 text-green-500" />
                    ) : (
                        <XCircle className="size-10 text-red-500" />
                    )}
                </div>

                <h2 className={cn(
                    "text-xl font-bold",
                    isSuccess ? "text-green-500" : "text-red-500"
                )}>
                    {isSuccess ? "Withdrawal Successful!" : "Withdrawal Failed"}
                </h2>

                <p className="text-sm text-muted-foreground mt-1 text-center">
                    {isSuccess
                        ? "Your withdrawal has been submitted successfully"
                        : (errorMessage || "Something went wrong. Please try again.")
                    }
                </p>
            </div>

            {/* Amount Display */}
            {isSuccess && (
                <div className="bg-muted/30 rounded-xl p-5 text-center border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Amount Withdrawn</p>
                    <div className="flex items-center justify-center gap-3">
                        <img
                            src={selectedCurrency.icon}
                            alt={selectedCurrency.name}
                            className="w-8 h-8 rounded-full"
                        />
                        <span className="text-2xl font-bold text-foreground">
                            {parseFloat(amount).toLocaleString()} {currency}
                        </span>
                    </div>
                </div>
            )}

            {/* Transaction Details */}
            {isSuccess && transactionId && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                        <div className="space-y-0.5">
                            <p className="text-xs text-muted-foreground">Transaction ID</p>
                            <p className="text-sm font-mono font-medium text-foreground">{transactionId}</p>
                        </div>
                        <button
                            onClick={handleCopyTxId}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                            <Copy className={cn(
                                "size-4",
                                copied ? "text-green-500" : "text-muted-foreground"
                            )} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                        <div className="space-y-0.5">
                            <p className="text-xs text-muted-foreground">Status</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                <p className="text-sm font-medium text-foreground">Pending Confirmation</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Note */}
            {isSuccess && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Your transaction is being processed. It may take a few minutes to reflect in your wallet.
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-2">
                <button
                    onClick={isSuccess ? handleDone : () => setStep('review')}
                    className={cn(
                        "w-full py-3.5 rounded-xl font-semibold",
                        "bg-primary text-primary-foreground",
                        "hover:bg-primary/90 active:scale-[0.98]",
                        "transition-all duration-200"
                    )}
                >
                    {isSuccess ? "Done" : "Try Again"}
                </button>

                {isSuccess && (
                    <button
                        onClick={handleDone}
                        className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
                    >
                        <ExternalLink className="size-4" />
                        View in Transactions
                    </button>
                )}
            </div>
        </div>
    );
}
