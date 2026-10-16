import { apiRequest } from "../api-client";

/**
 * NOTE: the backend session endpoints are NOT confirmed. Nothing in the
 * existing auth routes exposes a session list, so the shapes below are
 * documented assumptions kept in this module. If the backend does not ship
 * these endpoints, `SUPPORTED` should be flipped to false and the Security
 * page will render an explanatory notice instead of a broken list.
 */
export const SESSIONS_SUPPORTED = true;

export interface UserSession {
  id: string;
  /** Coarse device label, e.g. "iPhone 15". */
  device: string | null;
  browser: string | null;
  /** Human-readable location, e.g. "Lagos, Nigeria". */
  location: string | null;
  /** ISO 8601 timestamp. */
  lastActiveAt: string;
  createdAt: string | null;
  /** True for the session making the request right now. */
  current: boolean;
}

export interface RawSession {
  id?: unknown;
  device?: unknown;
  browser?: unknown;
  location?: unknown;
  lastActiveAt?: unknown;
  createdAt?: unknown;
  current?: unknown;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * Normalise the response so the UI never has to guard against missing
 * fields, and discard anything without an id or a usable timestamp since it
 * cannot be rendered or revoked.
 */
export function normaliseSessions(raw: unknown): UserSession[] {
  if (!Array.isArray(raw)) return [];

  const sessions: UserSession[] = [];
  for (const entry of raw as RawSession[]) {
    if (!entry || typeof entry !== "object") continue;
    const id = str(entry.id);
    const lastActiveAt = str(entry.lastActiveAt);
    if (!id || !lastActiveAt) continue;

    sessions.push({
      id,
      device: str(entry.device),
      browser: str(entry.browser),
      location: str(entry.location),
      lastActiveAt,
      createdAt: str(entry.createdAt),
      current: entry.current === true,
    });
  }

  return sessions;
}

export async function fetchSessions(): Promise<UserSession[]> {
  const data = await apiRequest<unknown>("/api/auth/sessions");
  const list = Array.isArray(data)
    ? data
    : ((data as { sessions?: unknown })?.sessions ?? []);
  return normaliseSessions(list);
}

export async function revokeSession(sessionId: string): Promise<void> {
  await apiRequest(`/api/auth/sessions/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
  });
}

export async function revokeOtherSessions(): Promise<void> {
  await apiRequest("/api/auth/sessions", { method: "DELETE" });
}
