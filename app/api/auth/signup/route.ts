import { NextResponse } from "next/server";

/** Signup stub — E2E/CI never hits production. */
export async function POST(request: Request) {
  let body: { email?: string; password?: string; firstName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (body.email === "taken@example.com") {
    return NextResponse.json({ error: "Email already taken" }, { status: 409 });
  }
  return NextResponse.json({ ok: true, email: body.email }, { status: 201 });
}
