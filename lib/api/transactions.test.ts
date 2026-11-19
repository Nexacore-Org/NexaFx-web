import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createWithdrawal,
  createDeposit,
  MissingTransactionIdError,
} from "./transactions";

describe("transaction creation request bodies", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function mockJsonResponse(payload: unknown) {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => payload,
      text: async () => JSON.stringify(payload),
    });
  }

  it("createWithdrawal sends an object body, not a JSON string", async () => {
    mockJsonResponse({ transaction: { id: "tx-1" } });

    await createWithdrawal({ amount: 10, asset: "XLM" } as never);

    const [, init] = fetchMock.mock.calls[0];
    expect(typeof init.body).toBe("string");
    const parsed = JSON.parse(init.body as string);
    expect(parsed).toEqual({ amount: 10, asset: "XLM" });
    expect(typeof parsed).toBe("object");
  });

  it("createDeposit sends an object body, not a JSON string", async () => {
    mockJsonResponse({ transaction: { id: "tx-2" } });

    await createDeposit({ amount: 5, asset: "USDC" } as never);

    const [, init] = fetchMock.mock.calls[0];
    expect(typeof init.body).toBe("string");
    const parsed = JSON.parse(init.body as string);
    expect(parsed).toEqual({ amount: 5, asset: "USDC" });
    expect(typeof parsed).toBe("object");
  });

  it("createWithdrawal throws a typed error when no id is returned", async () => {
    mockJsonResponse({});

    await expect(
      createWithdrawal({ amount: 10, asset: "XLM" } as never),
    ).rejects.toBeInstanceOf(MissingTransactionIdError);
  });

  it("createDeposit throws a typed error when no id is returned", async () => {
    mockJsonResponse({});

    await expect(
      createDeposit({ amount: 5, asset: "USDC" } as never),
    ).rejects.toBeInstanceOf(MissingTransactionIdError);
  });
});
