"use client";

import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { createWithdrawal, type Transaction } from "@/lib/api/transactions";
import { WithdrawalConfirmationModal } from "@/components/dashboard/withdraw/withdrawal-confirmation-modal";

export function WithdrawalReview() {
    const { currency, amount, walletAddress, step, setStep, setTransactionResult, setTransactionData } = useWithdrawalStore();

    const isProcessing = step === 'processing';

    const handleConfirm = async () => {
        setStep('processing');

        try {
            const response = await createWithdrawal({
                currency,
                amount: parseFloat(amount),
                destinationAddress: walletAddress,
            });

            const transaction: Transaction = {
                id: response.transactionId,
                type: 'Withdraw',
                currency,
                amount: parseFloat(amount),
                amountString: `${parseFloat(amount).toLocaleString()} ${currency}`,
                date: new Date().toISOString(),
                status: response.status === 'success' ? 'Success' : response.status === 'failed' ? 'Failed' : 'Pending',
                reference: walletAddress,
                description: 'Withdrawal request submitted',
                destinationAddress: walletAddress,
            };

            setTransactionData(transaction);
            setTransactionResult(response.transactionId, response.status === 'success' ? 'success' : response.status === 'failed' ? 'failed' : 'pending');
            setStep('success');
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'An unexpected error occurred';
            setTransactionResult(null, 'failed', errorMessage);
            setStep('error');
        }
    };

    return (
        <WithdrawalConfirmationModal
            amount={amount}
            currency={currency}
            destinationAddress={walletAddress}
            onConfirm={handleConfirm}
            onCancel={() => {
                if (isProcessing) return;
                setStep('form');
            }}
            isLoading={isProcessing}
        />
    );
}
