import { afterEach, describe, expect, it } from "vitest";

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
});

function request(body: unknown) {
  return new Request("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/signup — production mode", () => {
  it("is unreachable without E2E_MOCK", async () => {
    setEnv({});
    const { POST } = await import("./route");
    const res = await POST(
      request({ email: "user@example.com", password: "x" }),
    );
    expect(res.status).toBe(404);
  });
});

describe("POST /api/auth/signup — mock mode", () => {
  it("rejects an invalid email format", async () => {
    setEnv({ E2E_MOCK: "1" });
    const { POST } = await import("./route");
    const res = await POST(request({ email: "nope", password: "x" }));
    expect(res.status).toBe(400);
  });

  it("rejects an already-taken email", async () => {
    setEnv({ NODE_ENV: "test" });
    const { POST } = await import("./route");
    const res = await POST(
      request({ email: "taken@example.com", password: "x" }),
    );
    expect(res.status).toBe(409);
  });

  it("creates the account for valid input", async () => {
    setEnv({ E2E_MOCK: "1" });
    const { POST } = await import("./route");
    const res = await POST(
      request({ email: "new@example.com", password: "x" }),
    );
    expect(res.status).toBe(201);
  });
});
