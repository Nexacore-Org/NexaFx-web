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
  return new Request("http://localhost/api/convert/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/convert/confirm", () => {
  it("is unreachable without E2E_MOCK", async () => {
    setEnv({});
    const { POST } = await import("./route");
    const res = await POST(request({ amount: 100 }));
    expect(res.status).toBe(404);
  });

  it("rejects a missing amount in mock mode", async () => {
    setEnv({ E2E_MOCK: "1" });
    const { POST } = await import("./route");
    const res = await POST(request({}));
    expect(res.status).toBe(400);
  });

  it("confirms the conversion in mock mode", async () => {
    setEnv({ NODE_ENV: "test" });
    const { POST } = await import("./route");
    const res = await POST(request({ amount: 100 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.id).toMatch(/^cvt-/);
  });
});
