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
  return new Request("http://localhost/api/convert/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/convert/quote", () => {
  it("is unreachable without E2E_MOCK", async () => {
    setEnv({});
    const { POST } = await import("./route");
    const res = await POST(request({ amount: 1500 }));
    expect(res.status).toBe(404);
  });

  it("returns the fixed-rate quote in mock mode", async () => {
    setEnv({ E2E_MOCK: "1" });
    const { POST } = await import("./route");
    const res = await POST(request({ amount: 1500 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ usdAmount: "1.00", rate: 1500 });
  });
});
