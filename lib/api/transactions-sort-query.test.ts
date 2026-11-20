import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiRequest } = vi.hoisted(() => ({ apiRequest: vi.fn() }));

vi.mock("../api-client", () => ({
  apiRequest,
  ApiError: class ApiError extends Error {},
}));

import { fetchTransactions } from "./transactions";

describe("fetchTransactions server-side sorting", () => {
  beforeEach(() => {
    apiRequest.mockReset();
    apiRequest.mockResolvedValue({
      transactions: [
        {
          id: "tx-1",
          type: "convert",
          status: "completed",
          sourceAmount: 100,
          sourceCurrency: "NGN",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      total: 1,
    });
  });

  it("forwards sort and dir to the transactions endpoint", async () => {
    await fetchTransactions({
      page: 2,
      limit: 10,
      sort: "amount",
      dir: "desc",
    });

    expect(apiRequest).toHaveBeenCalledWith("/api/transactions", {
      query: expect.objectContaining({
        page: 2,
        limit: 10,
        sort: "amount",
        dir: "desc",
      }),
    });
  });

  it("omits sort params when the caller does not supply them", async () => {
    await fetchTransactions({});

    expect(apiRequest).toHaveBeenCalledWith("/api/transactions", {
      query: {},
    });
  });

  it("marks the offline fallback so callers can sort it client-side", async () => {
    apiRequest.mockRejectedValue(new Error("offline"));

    const result = await fetchTransactions({ limit: 5, sort: "amount" });

    expect(result.isFallback).toBe(true);
    expect(result.transactions.length).toBeGreaterThan(0);
  });
});
