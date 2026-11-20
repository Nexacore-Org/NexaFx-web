import { NextResponse } from "next/server";
import { getSessionCookie } from "@/app/api/auth/lib/session";

type ProfileUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

const E2E_SESSION_PREFIX = "e2e-session-";

function isMockMode(): boolean {
  return process.env.E2E_MOCK === "1" || !process.env.AUTH_API_URL;
}

function mockUserFromSession(session: string): ProfileUser {
  const email = session.startsWith(E2E_SESSION_PREFIX)
    ? session.slice(E2E_SESSION_PREFIX.length)
    : "user@example.com";

  return {
    id: "e2e-user",
    email,
    firstName: null,
    lastName: null,
  };
}

/**
 * Returns the signed-in user's profile.
 *
 * The provider calls this on mount so a reload restores the session from the
 * httpOnly cookie. Without a session the caller is treated as signed out.
 */
export async function GET() {
  const session = await getSessionCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isMockMode()) {
    return NextResponse.json({ user: mockUserFromSession(session) });
  }

  try {
    const res = await fetch(`${process.env.AUTH_API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${session}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await res.json();
    return NextResponse.json({ user: data?.user ?? data ?? null });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
