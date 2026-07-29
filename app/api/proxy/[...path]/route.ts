import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * DEV_TOKEN: LOCAL DEVELOPMENT ONLY
 * 
 * This fallback token is ONLY used in local development (NODE_ENV === "development").
 * It must NEVER be set in staging, production, or any deployed environment.
 * 
 * If TEST_ACCESS_TOKEN is set in a deployed environment without this guard,
 * all proxy requests from unauthenticated users would be authorized using that token,
 * leaking real data including transactions, notifications, and other sensitive information.
 * 
 * SECURITY RISK: Setting TEST_ACCESS_TOKEN on Render staging/production without
 * this NODE_ENV check would allow unauthenticated API requests to succeed.
 */
const DEV_TOKEN = process.env.NODE_ENV === "development"
  ? (process.env.TEST_ACCESS_TOKEN ?? "")
  : "";

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

    // Use token from client cookie/header if present, otherwise fall back to dev token
    const clientToken =
        req.headers.get("x-client-token") ?? req.cookies.get("access_token")?.value;
    const token = clientToken ?? DEV_TOKEN;
    if (token) headers.set("Authorization", `Bearer ${token}`);

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
