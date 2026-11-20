import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../api-client", () => ({ apiRequest: vi.fn() }));
import { apiRequest } from "../api-client";
import { getAdminTransactions, getAuditLog } from "./admin";

const mock = vi.mocked(apiRequest);
beforeEach(() => mock.mockReset());

describe("admin API normalisers", () => {
  it("fills default page, pageSize and query values", async () => {
    mock.mockResolvedValueOnce({});
    expect(await getAdminTransactions({})).toEqual({ transactions: [], total: 0, page: 1, pageSize: 20 });
    expect((mock.mock.calls[0][1] as { query: Record<string, unknown> }).query).toMatchObject({ page: 1, pageSize: 20, search: "" });
  });

  it("fills partial transaction rows", async () => {
    mock.mockResolvedValueOnce({ transactions: [{ id: "t1" }], total: 1 });
    const { transactions } = await getAdminTransactions({ page: 2 });
    expect(transactions[0]).toEqual({ id: "t1", reference: "", type: "", amount: "0", currency: "", status: "", createdAt: "", counterparty: null });
  });

  it("fills partial audit rows", async () => {
    mock.mockResolvedValueOnce({ entries: [{ id: "a1", action: "login" }] });
    const res = await getAuditLog({});
    expect(res.entries[0]).toMatchObject({ id: "a1", action: "login", actorEmail: "", metadata: null });
    expect(res.pageSize).toBe(20);
  });
});
