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
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-client";
import { fetchTransaction } from "@/lib/api/transactions";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

function mockJson(status: number, body: unknown) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    }),
  );
}

describe("fetchTransaction", () => {
  it("returns the normalised transaction on success", async () => {
    mockJson(200, { id: "tx-9", type: "deposit", amount: "12.5" });
    const tx = await fetchTransaction("tx-9");
    expect(tx).toMatchObject({
      id: "tx-9",
      type: "deposit",
      sourceAmount: 12.5,
    });
  });

  it("returns null for a 404 whose JSON message hides the status", async () => {
    mockJson(404, { message: "Transaction not found" });
    await expect(fetchTransaction("tx-1")).resolves.toBeNull();
  });

  it("returns null for a 403 whose JSON message hides the status", async () => {
    mockJson(403, { message: "You do not have access" });
    await expect(fetchTransaction("tx-1")).resolves.toBeNull();
  });

  it("surfaces a 500 instead of returning mock data outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    mockJson(500, { message: "Internal error" });
    await expect(fetchTransaction("tx-1")).rejects.toMatchObject({
      status: 500,
      message: "Internal error",
    });
  });

  it("surfaces a 401 instead of returning mock data outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    mockJson(401, { message: "Unauthorized" });
    await expect(fetchTransaction("tx-1")).rejects.toBeInstanceOf(ApiError);
  });

  it("falls back to mock data on a network error outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("fetch failed"),
    );
    const tx = await fetchTransaction("tx-1");
    expect(tx?.id).toBe("tx-1");
  });

  it("rethrows a network error in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("fetch failed"),
    );
    await expect(fetchTransaction("tx-1")).rejects.toMatchObject({
      isNetworkError: true,
    });
  });
});
