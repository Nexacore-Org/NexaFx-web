"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConversionSummaryProps {
    fromAmount: string;
    fromCurrency: string;
    toAmount: string;
    toCurrency: string;
    rate: number;
    fee: number | null;
    fromSymbol: string;
    toSymbol: string;
    isSubmitting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    onGetNewRate: () => void;
}

const COUNTDOWN_SECONDS = 30;

export function ConversionSummary({
    fromAmount,
    fromCurrency,
    toAmount,
    toCurrency,
    rate,
    fee,
    fromSymbol,
    toSymbol,
    isSubmitting,
    onConfirm,
    onCancel,
    onGetNewRate,
}: ConversionSummaryProps) {
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (countdown <= 0) {
            setIsExpired(true);
            return;
        }
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const formatCountdown = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }, []);

    const parsedFrom = parseFloat(fromAmount.replace(/,/g, ""));
    const feeAmount = fee !== null ? (parsedFrom * fee) / 100 : null;
    const netFrom = feeAmount !== null ? parsedFrom - feeAmount : parsedFrom;
    const netFromFormatted = netFrom.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: fromCurrency === "ETH" ? 8 : 2,
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
                <div className="p-6 space-y-5">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">
                            Confirm Conversion
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Review the details before confirming
                        </p>
                    </div>

                    <div className="space-y-4 bg-muted/30 rounded-xl p-4 border border-border/50">
                        <div className="text-center space-y-2">
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {fromSymbol} {parseFloat(fromAmount.replace(/,/g, "")).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: fromCurrency === "ETH" ? 8 : 2,
                                    })}
                                </p>
                                <p className="text-sm text-muted-foreground">{fromCurrency}</p>
                            </div>

                            <div className="flex justify-center">
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <ArrowDown className="h-4 w-4 text-primary" />
                                </div>
                            </div>

                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {toSymbol} {toAmount}
                                </p>
                                <p className="text-sm text-muted-foreground">{toCurrency}</p>
                            </div>
                        </div>

                        <div className="border-t border-border pt-3 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Exchange Rate</span>
                                <span className="font-semibold text-foreground">
                                    1 {fromCurrency} = {rate.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 8,
                                    })} {toCurrency}
                                </span>
                            </div>

                            {fee !== null && fee > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Fee ({fee}%)
                                    </span>
                                    <span className="font-semibold text-destructive">
                                        -{fromSymbol} {feeAmount!.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })} {fromCurrency}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between text-sm pt-1 border-t border-border/50">
                                <span className="font-medium text-foreground">You receive</span>
                                <span className="font-bold text-foreground">
                                    {toSymbol} {toAmount}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                        {isExpired ? (
                            <div className="flex items-center gap-2 text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">Rate expired. Refresh to get a new rate.</span>
                            </div>
                        ) : (
                            <span className={cn(
                                "text-sm font-mono font-semibold tabular-nums",
                                countdown <= 10 ? "text-destructive" : "text-muted-foreground"
                            )}>
                                Rate valid for: {formatCountdown(countdown)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="px-6 pb-6 space-y-3">
                    {isExpired ? (
                        <button
                            type="button"
                            onClick={onGetNewRate}
                            className={cn(
                                "w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2",
                                "bg-primary text-primary-foreground",
                                "hover:bg-primary/90 active:scale-[0.98]",
                                "transition-all duration-200"
                            )}
                        >
                            Get new rate
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isSubmitting}
                            className={cn(
                                "w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2",
                                "bg-primary text-primary-foreground",
                                "hover:bg-primary/90 active:scale-[0.98]",
                                "transition-all duration-200",
                                isSubmitting && "opacity-60 cursor-not-allowed hover:bg-primary"
                            )}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Confirming...
                                </>
                            ) : (
                                "Confirm"
                            )}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className={cn(
                            "w-full py-3 rounded-xl font-semibold",
                            "bg-muted/50 text-foreground border border-border",
                            "hover:bg-muted transition-colors",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
