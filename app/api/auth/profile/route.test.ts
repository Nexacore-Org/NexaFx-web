// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getSessionCookie } = vi.hoisted(() => ({
  getSessionCookie: vi.fn(),
}));

vi.mock("@/app/api/auth/lib/session", () => ({
  getSessionCookie,
  setSessionCookie: vi.fn(),
  deleteSessionCookie: vi.fn(),
}));

import { GET } from "./route";

const upstreamUser = {
  id: "u1",
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
};

describe("GET /api/auth/profile", () => {
  beforeEach(() => {
    getSessionCookie.mockReset();
    vi.stubEnv("E2E_MOCK", "");
    vi.stubEnv("AUTH_API_URL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns 401 when there is no session cookie", async () => {
    getSessionCookie.mockResolvedValue(undefined);

    const res = await GET();

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns the session-backed mock user in E2E mode", async () => {
    getSessionCookie.mockResolvedValue("e2e-session-ada@example.com");
    vi.stubEnv("E2E_MOCK", "1");

    const res = await GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      user: {
        id: "e2e-user",
        email: "ada@example.com",
        firstName: null,
        lastName: null,
      },
    });
  });

  it("forwards the session cookie to the upstream profile endpoint", async () => {
    getSessionCookie.mockResolvedValue("session-token");
    vi.stubEnv("E2E_MOCK", "0");
    vi.stubEnv("AUTH_API_URL", "https://backend.test");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user: upstreamUser }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await GET();

    expect(fetchMock).toHaveBeenCalledWith("https://backend.test/auth/profile", {
      headers: { Authorization: "Bearer session-token" },
      cache: "no-store",
    });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ user: upstreamUser });
  });

  it("returns 401 when upstream rejects the session", async () => {
    getSessionCookie.mockResolvedValue("expired-session");
    vi.stubEnv("E2E_MOCK", "0");
    vi.stubEnv("AUTH_API_URL", "https://backend.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
    );

    const res = await GET();

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns 401 when upstream is unreachable", async () => {
    getSessionCookie.mockResolvedValue("session-token");
    vi.stubEnv("E2E_MOCK", "0");
    vi.stubEnv("AUTH_API_URL", "https://backend.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    const res = await GET();

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
  });
});
