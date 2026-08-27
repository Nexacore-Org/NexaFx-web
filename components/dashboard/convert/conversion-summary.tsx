"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversionSummaryProps {
    fromAmount: string;
    fromCurrency: string;
    toAmount: string;
    toCurrency: string;
    rate: number;
    fee: number | null;
    expiresIn: number;
    onConfirm: () => void;
    onCancel: () => void;
    onExpired?: () => void;
}

export function ConversionSummary({
    fromAmount,
    fromCurrency,
    toAmount,
    toCurrency,
    rate,
    fee,
    expiresIn,
    onConfirm,
    onCancel,
    onExpired,
}: ConversionSummaryProps) {
    const [timeLeft, setTimeLeft] = useState(expiresIn);
    const isExpired = timeLeft <= 0;

    useEffect(() => {
        setTimeLeft(expiresIn);
    }, [expiresIn]);

    useEffect(() => {
        if (isExpired) {
            onExpired?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onExpired?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isExpired, onExpired]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const formatAmount = (amount: string, currency: string) => {
        const numericAmount = parseFloat(amount);
        if (!isNaN(numericAmount)) {
            return `${numericAmount.toLocaleString()} ${currency}`;
        }
        return amount;
    };

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-xl font-bold text-foreground mb-4">Confirm Conversion</h2>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">You are converting</span>
                        <span className="font-semibold text-foreground">
                            {formatAmount(fromAmount, fromCurrency)}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                        <div className="text-center">
                            <div className="text-primary font-bold text-2xl mb-1">↓</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">You will receive</span>
                        <span className="font-semibold text-foreground">
                            {formatAmount(toAmount, toCurrency)}
                        </span>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Exchange Rate</span>
                            <span className="text-foreground">
                                1 {fromCurrency} = {rate.toLocaleString()} {toCurrency}
                            </span>
                        </div>
                        
                        {fee !== null && fee > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Fee</span>
                                <span className="text-foreground">
                                    {fee.toLocaleString()} {fromCurrency}
                                </span>
                            </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Rate valid for</span>
                            <div className="flex items-center gap-2">
                                {isExpired ? (
                                    <span className="text-destructive font-medium">Rate expired</span>
                                ) : (
                                    <span className="text-green-600 font-mono font-medium">
                                        {formatTime(timeLeft)}
                                    </span>
                                )}
                                <Clock className={cn(
                                    "h-4 w-4",
                                    isExpired ? "text-destructive" : "text-green-600"
                                )} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className={cn(
                        "flex-1 py-3.5 rounded-xl font-semibold transition-all duration-200",
                        "bg-muted/50 text-foreground",
                        "hover:bg-muted",
                        "active:scale-[0.98]"
                    )}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isExpired}
                    className={cn(
                        "flex-1 py-3.5 rounded-xl font-semibold transition-all duration-200",
                        "bg-primary text-primary-foreground",
                        "hover:bg-primary/90 active:scale-[0.98]",
                        isExpired && "opacity-60 cursor-not-allowed hover:bg-primary"
                    )}
                >
                    Confirm
                </button>
            </div>
            
            {isExpired && (
                <div className="text-xs text-center text-destructive bg-destructive/10 py-2 rounded-lg border border-destructive/20">
                    <AlertCircle className="h-3.5 w-3.5 inline mr-1" />
                    Rate expired. Please refresh to get a new rate.
                </div>
            )}
        </div>
    );
}