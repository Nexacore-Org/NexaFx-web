import { NextResponse } from "next/server";
import { deleteSessionCookie } from "@/app/api/auth/lib/session";

const AUTH_API_URL = process.env.AUTH_API_URL ?? "https://api.example.com";
const REVOKE_TIMEOUT_MS = 5000;

export async function POST(request: Request) {
  // Revoke upstream first, forwarding the session token, then clear the cookie.
  try {
    const cookie = request.headers.get("cookie");
    await fetch(`${AUTH_API_URL}/auth/revoke`, {
      method: "POST",
      headers: cookie ? { cookie } : undefined,
      signal: AbortSignal.timeout(REVOKE_TIMEOUT_MS),
    });
  } catch {
    // ignore revoke errors
  }

  await deleteSessionCookie();

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed" },
    { status: 405, headers: { Allow: "POST" } },
  );
}
