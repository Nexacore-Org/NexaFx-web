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

const ENV_KEYS = ["E2E_MOCK", "NODE_ENV"] as const;
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
  return new Request("http://localhost/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/verify-otp — production mode", () => {
  it("is unreachable without E2E_MOCK", async () => {
    setEnv({});
    const { POST } = await import("./route");
    const res = await POST(
      request({ email: "user@example.com", code: "123456" }),
    );
    expect(res.status).toBe(404);
    expect(cookieStore.size).toBe(0);
  });
});

describe("POST /api/auth/verify-otp — mock mode", () => {
  it("rejects an invalid email format", async () => {
    setEnv({ E2E_MOCK: "1" });
    const { POST } = await import("./route");
    const res = await POST(request({ email: "not-an-email", code: "123456" }));
    expect(res.status).toBe(400);
  });

  it("rejects the wrong code", async () => {
    setEnv({ E2E_MOCK: "1" });
    const { POST } = await import("./route");
    const res = await POST(
      request({ email: "user@example.com", code: "000000" }),
    );
    expect(res.status).toBe(400);
  });

  it("accepts the fixed code for a valid email and sets a session cookie", async () => {
    setEnv({ NODE_ENV: "test" });
    const { POST } = await import("./route");
    const res = await POST(
      request({ email: "user@example.com", code: "123456" }),
    );
    expect(res.status).toBe(200);
    const cookie = cookieStore.get("session");
    expect(cookie?.options?.httpOnly).toBe(true);
    expect(cookie?.options?.sameSite).toBe("lax");
  });
});
