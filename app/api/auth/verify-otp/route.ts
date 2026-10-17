import { NextResponse } from "next/server";
import { setSessionCookie } from "@/app/api/auth/lib/session";

/** OTP verify stub — accepts code 123456 in mock mode. */
export async function POST(request: Request) {
  let body: { email?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const code = body.code?.trim() ?? "";
  if (code !== "123456") {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }
  await setSessionCookie(`e2e-session-${body.email ?? "user"}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  return NextResponse.json({ ok: true }, { status: 200 });
}
