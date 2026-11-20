'use client';

import { WithdrawalForm } from '@/components/withdraw/WithdrawalForm';
import { WithdrawalReview } from '@/components/withdraw/WithdrawalReview';
import { WithdrawalSuccess } from '@/components/withdraw/WithdrawalSuccess';
import { useWithdrawalStore } from '@/lib/stores/withdrawal-store';

export default function WithdrawPage() {
  const step = useWithdrawalStore((state) => state.step);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Withdraw</h1>
      {step === 'form' && <WithdrawalForm />}
      {step === 'review' && <WithdrawalReview />}
      {step === 'success' && <WithdrawalSuccess />}
    </div>
  );
}
