import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { ConvertForm } from "./convert-form";
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
