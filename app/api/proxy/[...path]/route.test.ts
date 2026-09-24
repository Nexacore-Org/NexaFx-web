import { NextRequest } from "next/server";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const BACKEND_URL = "https://backend.example.test";

const server = setupServer(
  http.get(`${BACKEND_URL}/*`, () =>
    HttpResponse.json({ ok: true }, { status: 200 }),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeRequest(
  overrides: {
    clientToken?: string;
    accessTokenCookie?: string;
  } = {},
) {
  const headers = new Headers();
  if (overrides.clientToken)
    headers.set("x-client-token", overrides.clientToken);

  const req = new NextRequest(
    `https://app.example.test/api/proxy/wallet/balances`,
    {
      headers,
    },
  );

  if (overrides.accessTokenCookie) {
    req.cookies.set("access_token", overrides.accessTokenCookie);
  }

  return req;
}

async function loadHandler() {
  vi.resetModules();
  const mod = await import("./route");
  return mod.GET;
}

describe("proxy route auth handling", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_API_URL = BACKEND_URL;
  });

  it("returns 401 when there is no client token, outside development", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.TEST_ACCESS_TOKEN;

    const GET = await loadHandler();
    const res = await GET(makeRequest(), {
      params: Promise.resolve({ path: ["wallet", "balances"] }),
    });

    expect(res.status).toBe(401);
  });

  it("returns 401 outside development even when TEST_ACCESS_TOKEN is set", async () => {
    process.env.NODE_ENV = "production";
    process.env.TEST_ACCESS_TOKEN = "leaked-dev-token";

    const GET = await loadHandler();
    const res = await GET(makeRequest(), {
      params: Promise.resolve({ path: ["wallet", "balances"] }),
    });

    expect(res.status).toBe(401);
  });

  it("proxies the request when x-client-token is present", async () => {
    process.env.NODE_ENV = "production";

    server.use(
      http.get(`${BACKEND_URL}/*`, ({ request }) => {
        expect(request.headers.get("Authorization")).toBe(
          "Bearer real-user-token",
        );
        return HttpResponse.json({ ok: true });
      }),
    );

    const GET = await loadHandler();
    const res = await GET(makeRequest({ clientToken: "real-user-token" }), {
      params: Promise.resolve({ path: ["wallet", "balances"] }),
    });

    expect(res.status).toBe(200);
  });

  it("proxies the request when the access_token cookie is present", async () => {
    process.env.NODE_ENV = "production";

    server.use(
      http.get(`${BACKEND_URL}/*`, ({ request }) => {
        expect(request.headers.get("Authorization")).toBe(
          "Bearer cookie-token",
        );
        return HttpResponse.json({ ok: true });
      }),
    );

    const GET = await loadHandler();
    const res = await GET(makeRequest({ accessTokenCookie: "cookie-token" }), {
      params: Promise.resolve({ path: ["wallet", "balances"] }),
    });

    expect(res.status).toBe(200);
  });

  it("falls back to TEST_ACCESS_TOKEN only in development, when no client token is present", async () => {
    process.env.NODE_ENV = "development";
    process.env.TEST_ACCESS_TOKEN = "local-dev-token";

    server.use(
      http.get(`${BACKEND_URL}/*`, ({ request }) => {
        expect(request.headers.get("Authorization")).toBe(
          "Bearer local-dev-token",
        );
        return HttpResponse.json({ ok: true });
      }),
    );

    const GET = await loadHandler();
    const res = await GET(makeRequest(), {
      params: Promise.resolve({ path: ["wallet", "balances"] }),
    });

    expect(res.status).toBe(200);
  });

  it("still returns 401 in development when TEST_ACCESS_TOKEN is unset and no client token is present", async () => {
    process.env.NODE_ENV = "development";
    delete process.env.TEST_ACCESS_TOKEN;

    const GET = await loadHandler();
    const res = await GET(makeRequest(), {
      params: Promise.resolve({ path: ["wallet", "balances"] }),
    });

    expect(res.status).toBe(401);
  });

  it("prefers a real client token over the development fallback", async () => {
    process.env.NODE_ENV = "development";
    process.env.TEST_ACCESS_TOKEN = "local-dev-token";

    server.use(
      http.get(`${BACKEND_URL}/*`, ({ request }) => {
        expect(request.headers.get("Authorization")).toBe(
          "Bearer real-user-token",
        );
        return HttpResponse.json({ ok: true });
      }),
    );

    const GET = await loadHandler();
    const res = await GET(makeRequest({ clientToken: "real-user-token" }), {
      params: Promise.resolve({ path: ["wallet", "balances"] }),
    });

    expect(res.status).toBe(200);
  });
});
