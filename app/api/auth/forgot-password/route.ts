import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:8000";

export async function POST(request: Request) {
  let email: unknown;

  try {
    const body = await request.json();
    email = body?.email;
  } catch {
    return NextResponse.json(
      { message: "If an account exists, a reset email has been sent." },
      { status: 400 },
    );
  }

  if (typeof email !== "string" || email.trim() === "") {
    return NextResponse.json(
      { message: "If an account exists, a reset email has been sent." },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: "If an account exists, a reset email has been sent." },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json(
      { message: "If an account exists, a reset email has been sent." },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "If an account exists, a reset email has been sent." },
      { status: 502 },
    );
  }
}
