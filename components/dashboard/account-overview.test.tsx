import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { AccountOverview } from "./account-overview";
import { formatCurrency } from "@/lib/utils/format";
import { server } from "@/__tests__/msw-server";

const renderOverview = (props = {}) =>
  render(<AccountOverview openDeposit={false} {...props} />);

describe("AccountOverview", () => {
  it("shows a skeleton while GET /users/wallet/balances is in flight", () => {
    renderOverview();
    // The fetch has not resolved yet on first paint, so the loading skeleton
    // (animate-pulse) must be on screen.
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders real balance amounts from the API response", async () => {
    server.use(
      http.get("*/users/wallet/balances", () =>
        HttpResponse.json([
          { currency: "NGN", amount: 15000000, balance: "15,000,000.00" },
        ])
      )
    );

    renderOverview();

    await waitFor(() =>
      expect(screen.getByText("Total balance")).toBeInTheDocument()
    );

    // The figure must come from the API response, formatted by the component.
    expect(document.body.textContent).toContain("15,000,000.00");
  });

  it("shows an error state when the API returns 500", async () => {
    server.use(
      http.get("*/users/wallet/balances", () =>
        HttpResponse.json({ message: "Internal Server Error" }, { status: 500 })
      )
    );

    renderOverview();

    // The error message is shown in both the balance row and the cards area.
    await waitFor(() =>
      expect(
        screen.getAllByText(/Failed to load account data/i).length
      ).toBeGreaterThan(0)
    );
  });

  it("never renders a hardcoded balance value", async () => {
    renderOverview();

    await waitFor(() =>
      expect(screen.getByText("Total balance")).toBeInTheDocument()
    );

    // The old v1 UI hardcoded "325,980" — it must never appear.
    expect(document.body.textContent).not.toContain("325,980");
  });

  describe("formatCurrency", () => {
    // Locale grouping / decimal separators can vary by ICU version, so assert
    // on the currency symbol plus the significant digits.
    const digitsOf = (value: string) => value.replace(/\D/g, "");

    it("formats NGN amounts", () => {
      const result = formatCurrency(15000000, "NGN");
      expect(result).toContain("₦");
      expect(digitsOf(result)).toContain("15000000");
    });

    it("formats USD amounts", () => {
      const result = formatCurrency(2500.5, "USD");
      expect(result).toContain("$");
      expect(digitsOf(result)).toContain("250050");
    });

    it("formats EUR amounts", () => {
      const result = formatCurrency(2000, "EUR");
      expect(result).toContain("€");
      expect(digitsOf(result)).toContain("2000");
    });
  });
});
