import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import * as transactionApi from "@/lib/api/transactions";
import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { WithdrawalReview } from "./WithdrawalReview";

beforeEach(() => {
  useWithdrawalStore.getState().reset();
  useWithdrawalStore.setState({
    currency: "USDC",
    amount: "100",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    step: "review",
  });
});

describe("WithdrawalReview", () => {
  it("ignores a second confirmation while a withdrawal request is already in flight", async () => {
    const pendingWithdrawal = new Promise(() => {});
    const createWithdrawalSpy = vi
      .spyOn(transactionApi, "createWithdrawal")
      .mockImplementation(() => pendingWithdrawal as Promise<any>);

    render(<WithdrawalReview />);

    fireEvent.click(screen.getByRole("button", { name: /confirm withdrawal/i }));

    const dialog = screen.getByRole("dialog");
    const confirmButton = within(dialog).getByRole("button", {
      name: /confirm withdrawal/i,
    });

    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);

    await waitFor(() => expect(createWithdrawalSpy).toHaveBeenCalledTimes(1));
  });
});
