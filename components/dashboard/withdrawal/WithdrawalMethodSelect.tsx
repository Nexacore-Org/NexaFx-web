"use client";

import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { Wallet, CreditCard, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function WithdrawalMethodSelect() {
    const { setStep, close, reset } = useWithdrawalStore();

    const handleCancel = () => {
        close();
        setTimeout(() => reset(), 300);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2 pt-4">
                <h2 className="text-xl font-bold text-foreground">Withdraw</h2>
                <p className="text-sm text-muted-foreground">
                    Select a withdrawal method
                </p>
            </div>

            {/* Method Options */}
            <div className="space-y-3">
                {/* Crypto Withdrawal - Active */}
                <button
                    onClick={() => setStep('form')}
                    className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl",
                        "bg-muted/50 hover:bg-muted border border-border",
                        "transition-all duration-200 hover:shadow-md",
                        "group text-left"
                    )}
                >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <Wallet className="size-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            Withdraw to wallet
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Send crypto to external wallet address
                        </p>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                {/* Fiat Withdrawal - Disabled (v1 constraint) */}
                <div
                    className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl",
                        "bg-muted/30 border border-border/50",
                        "opacity-50 cursor-not-allowed"
                    )}
                >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                        <CreditCard className="size-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-muted-foreground">
                                Sell for Fiat
                            </h3>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                Coming Soon
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground/70">
                            Withdraw to bank account via MoonPay
                        </p>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground/50" />
                </div>
            </div>

            {/* Info Note */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">0% fee</span> for crypto withdrawals to external wallets
                </p>
            </div>

            <button
                onClick={handleCancel}
                className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                Cancel
            </button>
        </div>
    );
}
