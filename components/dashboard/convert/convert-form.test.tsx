import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { ConvertForm, getAmountFractionDigits } from "./convert-form";
import { server } from "@/__tests__/msw-server";

// The amount <input> is the only field with this placeholder (the "To" amount
// is a read-only span), and its <label> is not associated, so query by it.
const amountInput = () => screen.getByPlaceholderText("0.00");
const convertButton = () =>
  screen.getByRole("button", { name: /Convert Now/i });

const failExchangeRate = () =>
  server.use(
    http.get("*/api/exchange-rates", () =>
      HttpResponse.json({ message: "Internal Server Error" }, { status: 500 })
    )
  );

describe("getAmountFractionDigits (ETH precision)", () => {
  it("allows up to 8 decimals when ETH is the source currency", () => {
    expect(getAmountFractionDigits("ETH", "NGN")).toEqual({
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  });

  it("allows up to 8 decimals when ETH is the target currency", () => {
    expect(getAmountFractionDigits("USD", "ETH")).toEqual({
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  });

  it("keeps fiat pairs at 2 decimals", () => {
    expect(getAmountFractionDigits("USD", "NGN")).toEqual({
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  });

  it("renders an ETH amount with more precision than a fiat amount", () => {
    const value = 0.00012345;
    const eth = value.toLocaleString(undefined, getAmountFractionDigits("ETH", "NGN"));
    const fiat = value.toLocaleString(undefined, getAmountFractionDigits("USD", "NGN"));
    expect(eth).toBe("0.00012345");
    expect(fiat).toBe("0.00"); // rounded to 2 dp, hiding the small amount
  });
});

describe("ConvertForm", () => {
  describe("submit button state", () => {
    it("is disabled when the amount is 0", async () => {
      render(<ConvertForm />);
      await waitFor(() => expect(convertButton()).toBeDisabled());
    });

    it("is disabled when the exchange rate endpoint returns 500", async () => {
      failExchangeRate();
      render(<ConvertForm />);

      fireEvent.change(amountInput(), { target: { value: "100" } });

      await waitFor(() =>
        expect(screen.getAllByText("Rates unavailable").length).toBeGreaterThan(0)
      );
      expect(convertButton()).toBeDisabled();
    });

    it("is enabled when amount > 0 and a rate is available", async () => {
      render(<ConvertForm />);

      fireEvent.change(amountInput(), { target: { value: "100" } });

      await waitFor(() => expect(convertButton()).not.toBeDisabled());
    });
  });

  it("shows 'Rates unavailable' when the exchange rate API returns 500", async () => {
    failExchangeRate();
    render(<ConvertForm />);

    await waitFor(() =>
      expect(screen.getAllByText("Rates unavailable").length).toBeGreaterThan(0)
    );
  });

  describe("swap submission", () => {
    it("calls POST /transactions/swap with the correct DTO", async () => {
      let body: Record<string, unknown> | null = null;
      server.use(
        http.post("*/transactions/swap", async ({ request }) => {
          body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({
            transactionId: "tx-swap-1",
            status: "success",
          });
        })
      );

      render(<ConvertForm />);

      fireEvent.change(amountInput(), { target: { value: "100" } });
      await waitFor(() => expect(convertButton()).not.toBeDisabled());
      fireEvent.click(convertButton());

      await waitFor(() =>
        expect(body).toEqual({
          fromCurrency: "USD",
          toCurrency: "NGN",
          amount: "100",
        })
      );
    });

    it("clears the amount after a successful swap", async () => {
      render(<ConvertForm />);

      fireEvent.change(amountInput(), { target: { value: "100" } });
      await waitFor(() => expect(convertButton()).not.toBeDisabled());
      fireEvent.click(convertButton());

      await waitFor(() => expect(amountInput()).toHaveValue(""));
    });
  });
});
