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

  it("renders currency icons as SVG nodes, not raw /icons/*.svg path text (issue #816)", async () => {
    render(<WithdrawalForm />);
    // Wait for form to settle after currency fetch fallback
    await screen.findByPlaceholderText("0.00");
    // Raw path strings must never appear in the document
    expect(document.body.textContent).not.toMatch(/\/icons\/[a-z0-9]+\.svg/i);
    // Lucide icons from getCurrencyIcon render as inline SVG
    const svgs = document.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });
});
