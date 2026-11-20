import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Signup stub, only reachable in E2E/test mode. */
export async function POST(request: Request) {
  const useMock =
    process.env.E2E_MOCK === "1" || process.env.NODE_ENV === "test";
  if (!useMock) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { email?: string; password?: string; firstName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const email = body.email?.trim() ?? "";
  if (!email || !EMAIL_RE.test(email) || !body.password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (email === "taken@example.com") {
    return NextResponse.json({ error: "Email already taken" }, { status: 409 });
  }
  return NextResponse.json({ ok: true, email }, { status: 201 });
}
