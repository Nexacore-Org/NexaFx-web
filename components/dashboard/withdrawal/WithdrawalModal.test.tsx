import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";
import { render, cleanup } from "@testing-library/react";
import { WithdrawalModal } from "./WithdrawalModal";
import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";

jest.mock("./WithdrawalForm", () => ({
  WithdrawalForm: () => <div data-testid="withdrawal-form" />,
}));

jest.mock("./WithdrawalReview", () => ({
  WithdrawalReview: () => <div data-testid="withdrawal-review" />,
}));

jest.mock("./WithdrawalMethodSelect", () => ({
  WithdrawalMethodSelect: () => <div data-testid="withdrawal-method-select" />,
}));

jest.mock("@/components/dashboard/withdraw/withdrawal-success", () => ({
  WithdrawalSuccess: () => <div data-testid="withdrawal-success" />,
}));

describe("WithdrawalModal focus trap", () => {
  beforeEach(() => {
    useWithdrawalStore.setState({
      isOpen: true,
      step: "select",
      currency: "USDC",
      amount: "",
      walletAddress: "",
      transactionId: null,
      transactionStatus: null,
      errorMessage: null,
    });
  });

  afterEach(() => {
    cleanup();
    useWithdrawalStore.setState({ isOpen: false });
    jest.restoreAllMocks();
  });

  it("registers exactly one document keydown listener while the modal is open", () => {
    const addSpy = jest.spyOn(document, "addEventListener");

    render(<WithdrawalModal />);

    const keydownAdds = addSpy.mock.calls.filter(
      ([type]) => type === "keydown",
    );

    expect(keydownAdds).toHaveLength(1);
  });

  it("removes the single document keydown listener when the modal unmounts", () => {
    const removeSpy = jest.spyOn(document, "removeEventListener");

    const { unmount } = render(<WithdrawalModal />);
    unmount();

    const keydownRemovals = removeSpy.mock.calls.filter(
      ([type]) => type === "keydown",
    );

    expect(keydownRemovals).toHaveLength(1);
  });
});