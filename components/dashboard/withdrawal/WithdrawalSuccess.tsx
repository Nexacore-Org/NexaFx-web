"use client";

import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { WithdrawalSuccess as WithdrawalStatusScreen } from "@/components/dashboard/withdraw/withdrawal-success";
import { XCircle } from "lucide-react";

export function WithdrawalSuccess() {
    const { transaction, transactionStatus, errorMessage, setStep } = useWithdrawalStore();

    if (transaction && transactionStatus === 'success') {
        return <WithdrawalStatusScreen transaction={transaction} />;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col items-center pt-8 pb-4">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
                    <XCircle className="size-10 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-red-500">Withdrawal failed</h2>
                <p className="mt-1 text-center text-sm text-muted-foreground">
                    {errorMessage || "Something went wrong. Please try again."}
                </p>
            </div>

            <button
                onClick={() => setStep('review')}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
                Try Again
            </button>
        </div>
    );
}
