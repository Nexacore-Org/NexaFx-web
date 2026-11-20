import { NextResponse } from "next/server";
import { setSessionCookie } from "@/app/api/auth/lib/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** OTP verify stub — accepts code 123456, only reachable in E2E/test mode. */
export async function POST(request: Request) {
  const useMock =
    process.env.E2E_MOCK === "1" || process.env.NODE_ENV === "test";
  if (!useMock) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { email?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const code = body.code?.trim() ?? "";
  if (code !== "123456") {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }
  await setSessionCookie(`e2e-session-${email}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  return NextResponse.json({ ok: true }, { status: 200 });
}
