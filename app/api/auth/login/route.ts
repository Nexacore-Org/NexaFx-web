import { NextResponse } from "next/server";
import { setSessionCookie } from "@/app/api/auth/lib/session";

/**
 * Login handler. In CI / Playwright (`E2E_MOCK=1` or missing upstream),
 * accepts demo credentials without calling production.
 */
export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  const useMock =
    process.env.E2E_MOCK === "1" ||
    process.env.NODE_ENV === "test" ||
    !process.env.AUTH_API_URL;

  if (useMock) {
    if (!email || !password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    // Wrong-password path for E2E: password "wrong" always fails generically
    if (password === "wrong") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    await setSessionCookie(`e2e-session-${email}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });
    return NextResponse.json(
      {
        user: {
          id: "e2e-user",
          email,
          role: email.startsWith("admin@") ? "admin" : "user",
        },
      },
      { status: 200 },
    );
  }

  const res = await fetch(
    `${process.env.AUTH_API_URL}/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    },
  );

  if (res.ok) {
    const data = await res.json();
    await setSessionCookie(data.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: data.expiresIn,
    });
    return NextResponse.json({ user: data.user }, { status: 200 });
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
