import { act, render, screen } from "@testing-library/react";
import {
  WithdrawalSuccess,
  getWithdrawalStatusDisplay,
} from "./WithdrawalSuccess";
import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import type { TransactionStatus } from "@/hooks/useWithdrawalStore";

function renderWithStatus(status: TransactionStatus) {
  act(() => {
    useWithdrawalStore.getState().reset();
    useWithdrawalStore.getState().setFormData({
      currency: "USDC",
      amount: "50",
    });
    useWithdrawalStore.getState().setTransactionResult("tx-123", status);
  });
  render(<WithdrawalSuccess />);
}

describe("WithdrawalSuccess status row", () => {
  it("shows Confirmed when the real status is success", () => {
    renderWithStatus("success");

    const status = screen.getByTestId("withdrawal-status");
    expect(status).toHaveTextContent("Confirmed");
    expect(status).not.toHaveTextContent("Pending Confirmation");
  });

  it("shows Pending Confirmation when the real status is pending", () => {
    renderWithStatus("pending");

    expect(screen.getByTestId("withdrawal-status")).toHaveTextContent(
      "Pending Confirmation",
    );
  });

  it("maps every transaction status to a distinct label", () => {
    expect(getWithdrawalStatusDisplay("success").label).toBe("Confirmed");
    expect(getWithdrawalStatusDisplay("pending").label).toBe(
      "Pending Confirmation",
    );
    expect(getWithdrawalStatusDisplay("failed").label).toBe("Failed");
    expect(getWithdrawalStatusDisplay(null).label).toBe("Processing");
  });
});
