import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notify } from "@/lib/notify";
import {
  ConvertForm,
  buildConvertSchema,
} from "@/components/convert/convert-form";

const walletsState = {
  data: {
    balances: [
      { currency: "USD", balance: "100.50" },
      { currency: "NGN", balance: "500000" },
      { currency: "ETH", balance: "2" },
    ],
    depositAddress: null,
  } as
    | {
        balances: { currency: string; balance: string }[];
        depositAddress: null;
      }
    | undefined,
  isLoading: false,
};
vi.mock("@/hooks/use-wallets", () => ({ useWallets: () => walletsState }));

const quoteCalls: Array<unknown> = [];
vi.mock("@/hooks/use-convert-quote", () => ({
  useConvertQuote: (
    params: { from: string; to: string; amount: string } | null,
  ) => {
    quoteCalls.push(params);
    if (!params) {
      return {
        data: undefined,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
      };
    }
    return {
      data: {
        quoteId: "q1",
        pair: `${params.from}/${params.to}`,
        rate: "1500",
        fee: null,
        feeCurrency: params.from,
        toAmount: String(Number(params.amount) * 1500),
        expiresAt: new Date(Date.now() + 30_000).toISOString(),
      },
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    };
  },
}));

vi.mock("@/lib/notify", () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const fromSelect = () => screen.getByLabelText("Currency to convert from");
const toSelect = () => screen.getByLabelText("Currency to convert to");

beforeEach(() => {
  quoteCalls.length = 0;
  walletsState.data = {
    balances: [
      { currency: "USD", balance: "100.50" },
      { currency: "NGN", balance: "500000" },
      { currency: "ETH", balance: "2" },
    ],
    depositAddress: null,
  };
  walletsState.isLoading = false;
});
afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("buildConvertSchema", () => {
  const schema = buildConvertSchema({ USD: "100.50", ETH: "2" });
  const messages = (values: { from: string; to: string; amount: string }) => {
    const result = schema.safeParse(values);
    return result.success ? [] : result.error.issues.map((i) => i.message);
  };

  it("accepts an amount within balance", () => {
    expect(messages({ from: "USD", to: "NGN", amount: "100.50" })).toEqual([]);
  });

  it("blocks amounts above the balance with a clear message", () => {
    expect(messages({ from: "USD", to: "NGN", amount: "100.51" })).toEqual([
      "Amount exceeds your balance of 100.50 USD",
    ]);
  });

  it("uses decimals from the registry per currency", () => {
    expect(messages({ from: "USD", to: "NGN", amount: "1.234" })).toEqual([
      "USD supports up to 2 decimal places",
    ]);
    expect(
      messages({ from: "ETH", to: "USD", amount: "1.123456789012345678" }),
    ).toEqual([]);
    expect(
      messages({ from: "ETH", to: "USD", amount: "1.1234567890123456789" }),
    ).toEqual(["ETH supports up to 18 decimal places"]);
  });

  it("rejects empty, zero and non numeric amounts", () => {
    expect(messages({ from: "USD", to: "NGN", amount: "" })).toEqual([
      "Enter an amount",
    ]);
    expect(messages({ from: "USD", to: "NGN", amount: "0" })).toEqual([
      "Amount must be greater than zero",
    ]);
    expect(messages({ from: "USD", to: "NGN", amount: "1a" })).toEqual([
      "Enter a valid number",
    ]);
  });

  it("rejects the same currency on both sides", () => {
    expect(messages({ from: "USD", to: "USD", amount: "1" })).toContain(
      "Choose a different currency to convert to",
    );
  });

  it("tolerates wallet balances with more decimals than the registry", () => {
    const loose = buildConvertSchema({ USD: "100.509999" });
    expect(
      loose.safeParse({ from: "USD", to: "NGN", amount: "100.50" }).success,
    ).toBe(true);
  });
});

describe("ConvertForm", () => {
  it("shows a balance error and blocks continue when amount is too high", async () => {
    const user = userEvent.setup();
    render(<ConvertForm />);
    await user.type(screen.getByLabelText("You pay"), "500");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Amount exceeds your balance of 100.50 USD",
    );
    expect(
      screen.getByRole("button", { name: "Review conversion" }),
    ).toBeDisabled();
  });

  it("does not request a quote until the amount input is debounced", async () => {
    const user = userEvent.setup();
    render(<ConvertForm />);
    await user.type(screen.getByLabelText("You pay"), "50");
    expect(quoteCalls.every((call) => call === null)).toBe(true);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    await waitFor(() =>
      expect(quoteCalls).toContainEqual({
        from: "USD",
        to: "NGN",
        amount: "50",
      }),
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("75,000.00"),
    );
  });

  it("shows the rate and says the fee comes with the receipt", async () => {
    const user = userEvent.setup();
    render(<ConvertForm />);
    await user.type(screen.getByLabelText("You pay"), "10");
    expect(await screen.findByText("1 USD = ₦1,500.00")).toBeInTheDocument();
    expect(screen.getByText("Shown on your receipt")).toBeInTheDocument();
  });

  it("swaps currencies and carries the quoted amount across", async () => {
    const user = userEvent.setup();
    render(<ConvertForm />);
    await user.type(screen.getByLabelText("You pay"), "10");
    await screen.findByText("1 USD = ₦1,500.00");

    await user.click(
      screen.getByRole("button", { name: "Swap from and to currencies" }),
    );

    expect(screen.getByLabelText("You pay")).toHaveValue("15000");
    expect(fromSelect()).toHaveValue("NGN");
    expect(toSelect()).toHaveValue("USD");
  });

  it("prevents selecting the same currency on both sides", () => {
    render(<ConvertForm />);
    // "to" is NGN, so NGN is disabled in the "from" list and USD in the "to" list.
    expect(
      within(fromSelect()).getByRole("option", { name: /^NGN \(/ }),
    ).toBeDisabled();
    expect(
      within(toSelect()).getByRole("option", { name: /^USD \(/ }),
    ).toBeDisabled();
    expect(
      within(fromSelect()).getByRole("option", { name: /^EUR \(/ }),
    ).toBeEnabled();
  });

  it("fills the full balance with Max and clears errors", async () => {
    const user = userEvent.setup();
    render(<ConvertForm />);
    await user.type(screen.getByLabelText("You pay"), "999");
    await screen.findByRole("alert");

    await user.click(
      screen.getByRole("button", { name: "Use maximum USD balance" }),
    );

    expect(screen.getByLabelText("You pay")).toHaveValue("100.50");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("validates against the balance of the newly selected currency", async () => {
    const user = userEvent.setup();
    render(<ConvertForm />);
    await user.type(screen.getByLabelText("You pay"), "50000");
    expect(await screen.findByRole("alert")).toHaveTextContent("exceeds");

    await user.selectOptions(fromSelect(), "EUR");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Amount exceeds your balance of 0.00 EUR",
    );
  });

  it("calls onContinue with the values and quote", async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    render(<ConvertForm onContinue={onContinue} />);
    await user.type(screen.getByLabelText("You pay"), "10");
    const submit = screen.getByRole("button", { name: "Review conversion" });
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);
    await waitFor(() => expect(onContinue).toHaveBeenCalledTimes(1));
    expect(onContinue.mock.calls[0][0]).toEqual({
      from: "USD",
      to: "NGN",
      amount: "10",
    });
    expect(onContinue.mock.calls[0][1]).toMatchObject({ quoteId: "q1" });
  });

  it("restores a stored draft when there are no URL params", async () => {
    window.sessionStorage.setItem(
      "nexafx:convert-draft",
      JSON.stringify({ from: "NGN", to: "USD", amount: "2500" }),
    );
    render(<ConvertForm />);
    await waitFor(() =>
      expect(screen.getByLabelText("You pay")).toHaveValue("2500"),
    );
    expect(fromSelect()).toHaveValue("NGN");
  });

  it("prefers URL params over a stored draft", () => {
    window.sessionStorage.setItem(
      "nexafx:convert-draft",
      JSON.stringify({ from: "NGN", to: "USD", amount: "2500" }),
    );
    render(
      <ConvertForm
        hasUrlParams
        defaultValues={{ from: "EUR", to: "GBP", amount: "7" }}
      />,
    );
    expect(screen.getByLabelText("You pay")).toHaveValue("7");
    expect(fromSelect()).toHaveValue("EUR");
  });

  it("keeps the address bar in step with the form", async () => {
    const user = userEvent.setup();
    render(<ConvertForm />);
    await user.type(screen.getByLabelText("You pay"), "12");
    await waitFor(() =>
      expect(window.location.search).toBe("?from=USD&to=NGN&amount=12"),
    );
  });

  it("copies a link and confirms it", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    render(<ConvertForm />);
    await user.type(screen.getByLabelText("You pay"), "12");
    await user.click(screen.getByRole("button", { name: "Copy link" }));
    await waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(writeText.mock.calls[0][0]).toContain("/?from=USD&to=NGN&amount=12");
    expect(notify.success).toHaveBeenCalledWith("Link copied");
  });
});
