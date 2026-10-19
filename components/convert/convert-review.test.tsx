import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ConvertReview,
  describeSwapError,
} from "@/components/convert/convert-review";
import { ConvertSuccess } from "@/components/convert/convert-success";
import { ApiError } from "@/lib/api-client";
import type { Transaction } from "@/lib/api/transactions";
import type { ConvertQuote } from "@/hooks/use-convert-quote";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const createSwap = vi.fn();
vi.mock("@/lib/api/transactions", () => ({
  createSwap: (input: unknown, key?: string) => createSwap(input, key),
}));

const refetch = vi.fn();
vi.mock("@/hooks/use-convert-quote", () => ({
  useConvertQuote: () => ({
    data: undefined,
    isFetching: false,
    error: null,
    refetch,
  }),
}));

const values = { from: "USD", to: "NGN", amount: "10" };

function makeQuote(overrides: Partial<ConvertQuote> = {}): ConvertQuote {
  return {
    quoteId: "q1",
    pair: "USD/NGN",
    rate: "1500",
    fee: "0.5",
    feeCurrency: "USD",
    toAmount: "15000",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    ...overrides,
  };
}

function renderReview(quote: ConvertQuote, handlers = {}) {
  const queryClient = new QueryClient();
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  const props = { onBack: vi.fn(), onSuccess: vi.fn(), ...handlers };
  render(
    <QueryClientProvider client={queryClient}>
      <ConvertReview values={values} quote={quote} {...props} />
    </QueryClientProvider>,
  );
  return { ...props, invalidate };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  createSwap.mockReset();
  refetch.mockReset();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ConvertReview", () => {
  it("shows amounts, rate, fee and total", () => {
    renderReview(makeQuote());
    expect(screen.getByText("10.00 USD")).toBeInTheDocument();
    expect(screen.getByText("15,000.00 NGN")).toBeInTheDocument();
    expect(screen.getByText("1 USD = ₦1,500.00")).toBeInTheDocument();
    expect(screen.getByText("0.50 USD")).toBeInTheDocument();
    expect(screen.getByText("10.00 USD + 0.50 USD")).toBeInTheDocument();
    expect(screen.getByRole("timer")).toHaveTextContent(
      "Quote expires in 1:00",
    );
  });

  it("says the fee comes with the receipt when the quote has none", () => {
    renderReview(makeQuote({ fee: null }));
    expect(screen.getByText("Shown on your receipt")).toBeInTheDocument();
    expect(screen.getAllByText("10.00 USD")).toHaveLength(2);
  });

  it("reports success only after the API resolves", async () => {
    const pending = deferred<{ id: string; referenceId: string }>();
    createSwap.mockReturnValue(pending.promise);
    const { onSuccess } = renderReview(makeQuote());

    fireEvent.click(screen.getByRole("button", { name: "Confirm conversion" }));

    const confirm = await screen.findByRole("button", { name: "Confirming" });
    expect(confirm).toBeDisabled();
    expect(onSuccess).not.toHaveBeenCalled();

    await act(async () => {
      pending.resolve({ id: "tx-1", referenceId: "REF-1" });
    });
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(onSuccess.mock.calls[0][0]).toEqual({
      id: "tx-1",
      referenceId: "REF-1",
    });
  });

  it("sends one request with an idempotency key on a double click", async () => {
    const pending = deferred<{ id: string; referenceId: string }>();
    createSwap.mockReturnValue(pending.promise);
    renderReview(makeQuote());

    const button = screen.getByRole("button", { name: "Confirm conversion" });
    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => expect(createSwap).toHaveBeenCalledTimes(1));
    expect(createSwap.mock.calls[0][0]).toEqual({
      fromCurrency: "USD",
      toCurrency: "NGN",
      amount: 10,
    });
    expect(typeof createSwap.mock.calls[0][1]).toBe("string");
  });

  it("invalidates balances and transactions on success", async () => {
    createSwap.mockResolvedValue({ id: "tx-1", referenceId: "REF-1" });
    const { invalidate, onSuccess } = renderReview(makeQuote());

    fireEvent.click(screen.getByRole("button", { name: "Confirm conversion" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const keys = invalidate.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).toContainEqual(["wallets"]);
    expect(keys).toContainEqual(["transactions"]);
  });

  it("keeps the entered data and allows a retry after an error", async () => {
    createSwap.mockRejectedValueOnce(
      new ApiError({
        status: 422,
        code: "INSUFFICIENT_FUNDS",
        message: "no",
        details: null,
        isNetworkError: false,
      }),
    );
    const { onSuccess } = renderReview(makeQuote());

    fireEvent.click(screen.getByRole("button", { name: "Confirm conversion" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You do not have enough funds",
    );
    expect(screen.getByText("10.00 USD")).toBeInTheDocument();
    expect(screen.getByText("15,000.00 NGN")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirm conversion" }),
    ).toBeEnabled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("prompts instead of re-pricing when the quote expires", async () => {
    vi.useFakeTimers();
    renderReview(
      makeQuote({ expiresAt: new Date(Date.now() + 2000).toISOString() }),
    );

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "This quote has expired",
    );
    expect(
      screen.getByRole("button", { name: "Confirm conversion" }),
    ).toBeDisabled();
    expect(refetch).not.toHaveBeenCalled();
    expect(createSwap).not.toHaveBeenCalled();
  });

  it("only applies a refreshed quote after the user accepts it", async () => {
    vi.useFakeTimers();
    refetch.mockResolvedValue({
      data: makeQuote({ quoteId: "q2", rate: "1600", toAmount: "16000" }),
    });
    renderReview(
      makeQuote({ expiresAt: new Date(Date.now() + 2000).toISOString() }),
    );
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Get new quote" }));
    });

    expect(screen.getByRole("alert")).toHaveTextContent("A new quote is ready");
    // Old numbers are still what the review shows until the user accepts.
    expect(screen.getByText("15,000.00 NGN")).toBeInTheDocument();
    expect(screen.queryByText("16,000.00 NGN")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirm conversion" }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Accept new quote" }));

    expect(screen.getByText("16,000.00 NGN")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirm conversion" }),
    ).toBeEnabled();
  });

  it("reuses the idempotency key when retrying the same quote", async () => {
    createSwap.mockRejectedValueOnce(
      new ApiError({
        status: 503,
        code: null,
        message: "down",
        details: null,
        isNetworkError: false,
      }),
    );
    createSwap.mockResolvedValueOnce({ id: "tx-1", referenceId: "REF-1" });
    renderReview(makeQuote());

    fireEvent.click(screen.getByRole("button", { name: "Confirm conversion" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We could not reach the server",
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirm conversion" }));

    await waitFor(() => expect(createSwap).toHaveBeenCalledTimes(2));
    expect(createSwap.mock.calls[1][1]).toBe(createSwap.mock.calls[0][1]);
  });

  it("treats a server QUOTE_EXPIRED error as an expired quote", async () => {
    createSwap.mockRejectedValueOnce(
      new ApiError({
        status: 410,
        code: "QUOTE_EXPIRED",
        message: "gone",
        details: null,
        isNetworkError: false,
      }),
    );
    renderReview(makeQuote());

    fireEvent.click(screen.getByRole("button", { name: "Confirm conversion" }));

    expect(
      await screen.findByRole("button", { name: "Get new quote" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirm conversion" }),
    ).toBeDisabled();
  });
});

describe("describeSwapError", () => {
  it("distinguishes backend down from other failures", () => {
    const down = new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message: "x",
      details: null,
      isNetworkError: true,
    });
    expect(describeSwapError(down).message).toContain(
      "could not reach the server",
    );
    expect(describeSwapError(new Error("boom")).message).toContain(
      "Something went wrong",
    );
  });
});

describe("ConvertSuccess", () => {
  it("shows the reference id and links to the transaction", () => {
    render(
      <ConvertSuccess
        values={values}
        quote={makeQuote()}
        transaction={{ id: "tx 1", referenceId: "REF-123" } as Transaction}
        onReset={() => {}}
      />,
    );
    expect(screen.getByText("REF-123")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View transaction" }),
    ).toHaveAttribute("href", "/transactions/tx%201");
  });
});
