import { afterEach, describe, expect, it, vi } from "vitest";

type CookieRecord = { value: string; options?: Record<string, unknown> };

const cookieStore = new Map<string, CookieRecord>();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => cookieStore.get(name),
    set: (name: string, value: string, options?: Record<string, unknown>) =>
      cookieStore.set(name, { value, options }),
    delete: (name: string) => cookieStore.delete(name),
  })),
}));

const ENV_KEYS = ["E2E_MOCK", "NODE_ENV", "AUTH_API_URL"] as const;
const originalEnv: Record<string, string | undefined> = {};
for (const key of ENV_KEYS) originalEnv[key] = process.env[key];

function setEnv(values: Partial<Record<(typeof ENV_KEYS)[number], string>>) {
  const env = process.env as Record<string, string | undefined>;
  for (const key of ENV_KEYS) {
    if (values[key] === undefined) delete env[key];
    else env[key] = values[key];
  }
}

afterEach(() => {
  setEnv(originalEnv);
  cookieStore.clear();
  vi.restoreAllMocks();
  vi.resetModules();
});

function request(body: unknown) {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login — mock mode", () => {
  it("accepts any well-formed credentials under E2E_MOCK=1", async () => {
    setEnv({ E2E_MOCK: "1" });
    const { POST } = await import("./route");
    const res = await POST(
      request({ email: "user@example.com", password: "x" }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.email).toBe("user@example.com");
    expect(cookieStore.get("session")).toBeDefined();
  });

  it("grants admin role for admin@ emails only in mock mode", async () => {
    setEnv({ NODE_ENV: "test" });
    const { POST } = await import("./route");
    const res = await POST(
      request({ email: "admin@example.com", password: "x" }),
    );
    const data = await res.json();
    expect(data.user.role).toBe("admin");
  });

  it("rejects the generic e2e wrong-password sentinel", async () => {
    setEnv({ E2E_MOCK: "1" });
    const { POST } = await import("./route");
    const res = await POST(
      request({ email: "user@example.com", password: "wrong" }),
    );
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/login — production mode", () => {
  it("returns 503 when AUTH_API_URL is missing and mock is not enabled", async () => {
    setEnv({});
    const { POST } = await import("./route");
    const res = await POST(
      request({ email: "user@example.com", password: "x" }),
    );
    expect(res.status).toBe(503);
    expect(cookieStore.size).toBe(0);
  });

  it("forwards to AUTH_API_URL when configured and mock is not enabled", async () => {
    setEnv({ AUTH_API_URL: "https://auth.example.com" });
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            sessionToken: "real-token",
            expiresIn: 3600,
            user: { id: "1", email: "user@example.com", role: "user" },
          }),
          { status: 200 },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");
    const res = await POST(
      request({ email: "user@example.com", password: "x" }),
    );
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://auth.example.com/auth/login",
      expect.objectContaining({ method: "POST" }),
    );
    vi.unstubAllGlobals();
  });
});
