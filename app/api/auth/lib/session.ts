export interface SessionCookieOptions {
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
}

export async function getSessionCookie(): Promise<string | undefined> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value;
}

export async function setSessionCookie(
  value: string,
  options: SessionCookieOptions = {},
): Promise<void> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  cookieStore.set("session", value, {
    httpOnly: options.httpOnly ?? true,
    secure: options.secure ?? process.env.NODE_ENV === "production",
    sameSite: options.sameSite ?? "lax",
    path: options.path ?? "/",
    ...(options.maxAge !== undefined ? { maxAge: options.maxAge } : {}),
  });
}

export async function deleteSessionCookie(): Promise<void> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
