import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// LOCAL DEVELOPMENT ONLY. Read once at module load, and only ever populated
// when NODE_ENV === "development" -- see .env.example for the full security
// rationale. Gating on NODE_ENV here (rather than inside the handler) means
// setting TEST_ACCESS_TOKEN in a deployed environment has no effect on this
// module at all: DEV_TOKEN is simply undefined there, so the fallback below
// can never be reached outside development.
const DEV_TOKEN =
  process.env.NODE_ENV === "development"
    ? process.env.TEST_ACCESS_TOKEN
    : undefined;

/**
 * Token resolution priority for the BFF proxy (issue #813):
 *
 * 1. `x-client-token` request header — primary path used by client fetch
 *    helpers that forward the bearer from localStorage / Zustand.
 * 2. `access_token` cookie — set by `lib/utils/token.ts` `setTokens()` when
 *    the user signs in (and cleared by `clearTokens()` on logout). This is a
 *    real, currently-used mechanism so server-side proxy calls can authenticate
 *    without requiring every caller to attach the header.
 * 3. `TEST_ACCESS_TOKEN` — development-only fallback (see DEV_TOKEN above).
 *
 * There is no separate silent session cookie beyond (2). Do not reintroduce a
 * dead fallback; if a new auth transport is added, document it here and in
 * `docs/store-conventions.md` / useProxy notes.
 */
async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const pathname = path.join("/");

  const token =
    req.headers.get("x-client-token") ??
    req.cookies.get("access_token")?.value ??
    DEV_TOKEN;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const targetUrl = new URL(`${BACKEND_URL}/${pathname}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const backendRes = await fetch(targetUrl.toString(), {
    method: req.method,
    headers,
    body:
      req.method !== "GET" && req.method !== "HEAD"
        ? await req.text()
        : undefined,
  });

  const body = await backendRes.text();

  return new NextResponse(body, {
    status: backendRes.status,
    headers: {
      "Content-Type":
        backendRes.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
