"use client";

import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { StepModalShell } from "@/components/ui/step-modal-shell";
import { WithdrawalMethodSelect } from "./WithdrawalMethodSelect";
import { WithdrawalForm } from "./WithdrawalForm";
import { WithdrawalReview } from "./WithdrawalReview";
import { WithdrawalSuccess } from "./WithdrawalSuccess";

export function WithdrawalModal() {
  const { isOpen, step, close, reset } = useWithdrawalStore();
  const isProcessing = step === "processing";

  const handleClose = () => {
    if (isProcessing) return;
    close();
    // Reset after animation
    setTimeout(() => reset(), 300);
  };

  const renderStep = () => {
    switch (step) {
      case "select":
        return <WithdrawalMethodSelect />;
      case "form":
        return <WithdrawalForm />;
      case "review":
      case "processing":
        return <WithdrawalReview />;
      case "success":
      case "error":
        return <WithdrawalSuccess />;
      default:
        return <WithdrawalMethodSelect />;
    }
  };

  return (
    <StepModalShell
      isOpen={isOpen}
      onClose={handleClose}
      ariaLabel="Withdrawal"
      closeDisabled={isProcessing}
    >
      {renderStep()}
    </StepModalShell>
  );
}
