import { afterEach, describe, expect, it, vi } from "vitest";
import { getRateHistory } from "@/lib/api/rates";

afterEach(() => vi.restoreAllMocks());

function mockFetch(body: unknown) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), {
      headers: { "content-type": "application/json" },
    }),
  );
}

describe("getRateHistory", () => {
  it("requests the pair and range and returns sorted numeric points", async () => {
    const fetchSpy = mockFetch({
      points: [
        { timestamp: "2026-10-02T00:00:00Z", rate: "1510.5" },
        { timestamp: "2026-10-01T00:00:00Z", rate: 1500 },
      ],
    });
    const points = await getRateHistory({
      from: "USD",
      to: "NGN",
      range: "7D",
    });
    const url = new URL(String(fetchSpy.mock.calls[0][0]));
    expect(url.pathname).toBe("/rates/history");
    expect(url.searchParams.get("from")).toBe("USD");
    expect(url.searchParams.get("range")).toBe("7D");
    expect(points).toEqual([
      { timestamp: "2026-10-01T00:00:00Z", rate: 1500 },
      { timestamp: "2026-10-02T00:00:00Z", rate: 1510.5 },
    ]);
  });

  it("rejects a response with an unexpected shape", async () => {
    mockFetch({ message: "Not Found", statusCode: 404 });
    await expect(
      getRateHistory({ from: "USD", to: "NGN", range: "7D" }),
    ).rejects.toThrow("unexpected shape");
  });
});
