import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// LOCAL DEVELOPMENT ONLY. Read once at module load, and only ever populated
// when NODE_ENV === "development" -- see .env.example for the full security
// rationale. Gating on NODE_ENV here (rather than inside the handler) means
// setting TEST_ACCESS_TOKEN in a deployed environment has no effect on this
// module at all: DEV_TOKEN is simply undefined there, so the fallback below
// can never be reached outside development, however the guard is read.
const DEV_TOKEN =
  process.env.NODE_ENV === "development"
    ? process.env.TEST_ACCESS_TOKEN
    : undefined;

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const pathname = path.join("/");

  // Use token from client cookie/header if present; only fall back to the
  // local-dev token when neither is present, and never outside development.
  const token =
    req.headers.get("x-client-token") ??
    req.cookies.get("access_token")?.value ??
    DEV_TOKEN;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const targetUrl = new URL(`${BACKEND_URL}/${pathname}`);
  // Forward query string as-is
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
async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const pathname = path.join("/");

    const targetUrl = new URL(`${BACKEND_URL}/${pathname}`);
    // Forward query string as-is
    req.nextUrl.searchParams.forEach((value, key) => {
        targetUrl.searchParams.set(key, value);
    });

    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    if (process.env.TEST_ACCESS_TOKEN && process.env.NODE_ENV !== "development") {
        console.warn(
            "[NexaFx] TEST_ACCESS_TOKEN was configured outside local development. This is a security risk and should be removed immediately.",
            { env: process.env.NODE_ENV, pathname }
        );
    }

    // Use token from client cookie/header if present
    const token = req.headers.get("x-client-token") ?? req.cookies.get("access_token")?.value;
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const backendRes = await fetch(targetUrl.toString(), {
        method: req.method,
        headers,
        body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
    });

    const body = await backendRes.text();

    return new NextResponse(body, {
        status: backendRes.status,
        headers: {
            "Content-Type": backendRes.headers.get("Content-Type") ?? "application/json",
        },
    });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
