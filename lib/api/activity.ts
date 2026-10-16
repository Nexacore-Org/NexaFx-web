import { apiRequest } from "../api-client";

/**
 * NOTE: the backend audit/activity endpoint is NOT confirmed. The app has no
 * reachable backend, so the shapes below are documented assumptions.
 *
 * The contract explicitly allows the API to mark device/IP details as
 * redacted, in which case they must not be rendered; `redacted` is honoured
 * here so the UI never has to guess.
 */

export type ActivityEventType =
  | "login"
  | "login_failed"
  | "logout"
  | "password_changed"
  | "password_reset"
  | "two_factor_enabled"
  | "two_factor_disabled"
  | "new_device"
  | "session_revoked"
  | "account_updated";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  /** ISO 8601. */
  occurredAt: string;
  description: string | null;
  device: string | null;
  ipAddress: string | null;
  /** When true, ipAddress and device must not be shown. */
  redacted: boolean;
}

export interface ActivityPage {
  events: ActivityEvent[];
  cursor: string | null;
}

const DAY = new Intl.DateTimeFormat("en", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDay(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "Unknown date" : DAY.format(date);
}

export function dayKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "unknown";
  // Local calendar day, which is what a person means by "today".
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function groupByDay(
  events: ActivityEvent[],
): [string, ActivityEvent[]][] {
  const groups = new Map<string, ActivityEvent[]>();

  // Newest first, so the day groups stay in reverse chronological order.
  for (const event of [...events].sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  )) {
    const key = dayKey(event.occurredAt);
    const bucket = groups.get(key);
    if (bucket) bucket.push(event);
    else groups.set(key, [event]);
  }

  return Array.from(groups.entries());
}

/**
 * Event types worth drawing attention to. Flagged with text, not colour
 * alone, so the distinction survives greyscale and screen readers.
 */
export const NOTABLE_EVENT_TYPES: ActivityEventType[] = [
  "login_failed",
  "new_device",
];

export function isNotable(event: ActivityEvent): boolean {
  return NOTABLE_EVENT_TYPES.includes(event.type);
}

export const EVENT_FILTERS: {
  value: ActivityEventType | "all";
  label: string;
}[] = [
  { value: "all", label: "All events" },
  { value: "login", label: "Sign-ins" },
  { value: "login_failed", label: "Failed sign-ins" },
  { value: "new_device", label: "New devices" },
  { value: "password_changed", label: "Password changes" },
  { value: "password_reset", label: "Password resets" },
  { value: "two_factor_enabled", label: "2FA enabled" },
  { value: "two_factor_disabled", label: "2FA disabled" },
  { value: "session_revoked", label: "Sessions revoked" },
];

export function describeEvent(event: ActivityEvent): string {
  if (event.description) return event.description;

  switch (event.type) {
    case "login":
      return "Signed in";
    case "login_failed":
      return "Failed sign-in attempt";
    case "logout":
      return "Signed out";
    case "password_changed":
      return "Password changed";
    case "password_reset":
      return "Password reset";
    case "two_factor_enabled":
      return "Two-factor authentication enabled";
    case "two_factor_disabled":
      return "Two-factor authentication disabled";
    case "new_device":
      return "New device signed in";
    case "session_revoked":
      return "A session was signed out";
    case "account_updated":
      return "Account details updated";
    default:
      return "Account activity";
  }
}

function normaliseEvent(raw: unknown): ActivityEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const entry = raw as Record<string, unknown>;

  const id = typeof entry.id === "string" ? entry.id : null;
  const occurredAt =
    typeof entry.occurredAt === "string" ? entry.occurredAt : null;
  const type = typeof entry.type === "string" ? entry.type : null;

  if (!id || !occurredAt || !type) return null;

  const redacted = entry.redacted === true;

  return {
    id,
    type: type as ActivityEventType,
    occurredAt,
    description:
      typeof entry.description === "string" ? entry.description : null,
    // A redacted payload must not leak through a partial response.
    device: redacted || typeof entry.device !== "string" ? null : entry.device,
    ipAddress:
      redacted || typeof entry.ipAddress !== "string" ? null : entry.ipAddress,
    redacted,
  };
}

export async function fetchActivity(options: {
  cursor?: string | null;
  type?: string;
}): Promise<ActivityPage> {
  const query: Record<string, string> = {};
  if (options.cursor) query.cursor = options.cursor;
  if (options.type && options.type !== "all") query.type = options.type;

  const data = await apiRequest<unknown>("/api/user/activity", { query });

  const container =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};

  const rawEvents = Array.isArray(container.events)
    ? container.events
    : Array.isArray(data)
      ? data
      : [];

  const events = rawEvents
    .map(normaliseEvent)
    .filter((e): e is ActivityEvent => e !== null);

  const cursor =
    typeof container.nextCursor === "string" ? container.nextCursor : null;

  return { events, cursor };
}
