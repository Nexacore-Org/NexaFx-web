import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { WithdrawalForm } from "./WithdrawalForm";
import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import * as walletApi from "@/lib/api/wallet";
import * as currenciesApi from "@/lib/api/currencies";

vi.mock("@/hooks/use-withdrawal-limits", () => ({
  useWithdrawalLimits: () => ({
    remainingDaily: null,
    remainingMonthly: null,
    isLoading: false,
  }),
}));

describe("WithdrawalForm", () => {
  beforeEach(() => {
    useWithdrawalStore.getState().reset();
    vi.spyOn(walletApi, "getBalances").mockResolvedValue([
      { currency: "USDC", balance: "100" },
    ]);
    vi.spyOn(currenciesApi, "getCurrencies").mockRejectedValue(
      new Error("currency endpoint unavailable"),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("clears an amount validation error when Max is clicked", async () => {
    render(<WithdrawalForm />);

    const amountInput = await screen.findByPlaceholderText("0.00");
    fireEvent.change(amountInput, { target: { value: "999" } });

    expect(
      await screen.findByText("Amount exceeds available balance"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "MAX" }));

    await waitFor(() => {
      expect(
        screen.queryByText("Amount exceeds available balance"),
      ).not.toBeInTheDocument();
    });
    expect(amountInput).toHaveValue("100");
  });
});
