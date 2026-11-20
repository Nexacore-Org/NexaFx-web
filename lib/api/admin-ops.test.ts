import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../api-client", () => ({ apiRequest: vi.fn() }));
import { apiRequest } from "../api-client";
import { getDisputes, normaliseAnnouncement, normaliseBroadcast, resolveDispute, toggleAnnouncement } from "./admin-ops";

const mock = vi.mocked(apiRequest);
beforeEach(() => mock.mockReset());

describe("admin ops API", () => {
  it("normalises partial dispute rows", async () => {
    mock.mockResolvedValueOnce({ disputes: [{ id: "d1", notes: ["a", { text: "b" }] }] });
    expect(await getDisputes()).toEqual([{ id: "d1", transactionId: "", reason: "", status: "open", notes: ["a", "b"], createdAt: "" }]);
  });

  it("posts dispute resolutions", async () => {
    mock.mockResolvedValueOnce({ id: "d1", status: "resolved" });
    expect((await resolveDispute("d1", "refund", "ok")).status).toBe("resolved");
    expect(mock.mock.calls[0][1]).toEqual({ method: "POST", body: { resolution: "refund", note: "ok" } });
  });

  it("toggles announcements and defaults fields", async () => {
    mock.mockResolvedValueOnce({ id: "a1", active: true });
    expect((await toggleAnnouncement("a1", true)).active).toBe(true);
    expect(normaliseAnnouncement({}).active).toBe(false);
    expect(normaliseBroadcast({}).audience).toBe("all");
  });
});
