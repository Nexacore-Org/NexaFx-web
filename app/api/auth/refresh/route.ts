import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  setSessionCookie,
  deleteSessionCookie,
} from "@/app/api/auth/lib/session";

const AUTH_API_URL = process.env.AUTH_API_URL;
const REFRESH_TIMEOUT_MS = 10_000;

export async function POST(request: Request) {
  if (!AUTH_API_URL) {
    return NextResponse.json(
      { error: "Auth backend not configured" },
      { status: 500 },
    );
  }

  const sessionToken = cookies().get("session")?.value;

  let res: Response;
  try {
    res = await fetch(`${AUTH_API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(sessionToken ? { Cookie: `session=${sessionToken}` } : {}),
      },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
    });
  } catch {
    // Network error or timeout: treat as refresh failure
    await deleteSessionCookie();
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
  }

  if (res.ok) {
    const data = await res.json().catch(() => null);

    // Validate the upstream response before trusting it
    if (
      !data ||
      typeof data.sessionToken !== "string" ||
      data.sessionToken.length === 0 ||
      typeof data.expiresIn !== "number" ||
      !Number.isFinite(data.expiresIn) ||
      data.expiresIn <= 0
    ) {
      await deleteSessionCookie();
      return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    }

    // Refresh httpOnly cookie
    await setSessionCookie(data.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: data.expiresIn,
    });
    return NextResponse.json({ user: data.user }, { status: 200 });
  }

  // If refresh fails, sign out
  await deleteSessionCookie();
  return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
}
