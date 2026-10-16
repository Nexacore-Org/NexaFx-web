import { apiRequest } from "@/lib/api-client";

/* -------------------------------------------------------------------------- */
/* Notification feed                                                          */
/* -------------------------------------------------------------------------- */

export type NotificationCategory =
  "transactions" | "security" | "promotions" | "system";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  createdAt: string;
}

const CATEGORIES: NotificationCategory[] = [
  "transactions",
  "security",
  "promotions",
  "system",
];

function normalize(payload: unknown): AppNotification[] {
  const list = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && "notifications" in payload
      ? (payload as { notifications?: unknown }).notifications
      : [];

  if (!Array.isArray(list)) return [];

  return list
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      const id = record.id;
      const title = record.title;
      const body = record.body ?? record.message ?? "";
      const category = record.category;
      const createdAt = record.createdAt ?? record.created_at;
      if (typeof id !== "string" || typeof title !== "string") return null;
      return {
        id,
        title,
        body: typeof body === "string" ? body : "",
        category: CATEGORIES.includes(category as NotificationCategory)
          ? (category as NotificationCategory)
          : "system",
        createdAt:
          typeof createdAt === "string" ? createdAt : new Date().toISOString(),
      };
    })
    .filter((entry): entry is AppNotification => entry !== null);
}

export async function getNotifications(): Promise<AppNotification[]> {
  const payload = await apiRequest<unknown>("/api/notifications");
  return normalize(payload);
}

export function categoryLabel(category: NotificationCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

/* -------------------------------------------------------------------------- */
/* Notification preferences                                                    */
/* -------------------------------------------------------------------------- */

/**
 * NOTE: the backend notification-preferences contract is NOT confirmed. The
 * app has no reachable backend, so the shapes below are documented
 * assumptions. Each category maps to a channel pair, and security alerts are
 * locked on, which the UI enforces and this module re-asserts on write so a
 * crafted request cannot disable them.
 */

export const NOTIFICATION_CHANNELS = ["email", "inApp"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export type NotificationPreferenceCategory =
  "transactions" | "securityAlerts" | "marketing";

export interface NotificationCategoryMeta {
  id: NotificationPreferenceCategory;
  label: string;
  description: string;
  /** Categories the user cannot opt out of, and why. */
  locked: boolean;
  lockedReason?: string;
}

export const NOTIFICATION_CATEGORIES: NotificationCategoryMeta[] = [
  {
    id: "transactions",
    label: "Transaction updates",
    description:
      "Confirmations, completed conversions, deposits and withdrawals.",
    locked: false,
  },
  {
    id: "securityAlerts",
    label: "Security alerts",
    description:
      "Sign-ins from new devices, password changes and suspicious activity.",
    locked: true,
    lockedReason:
      "These alerts cannot be turned off. They are how we tell you if someone else gets into your account.",
  },
  {
    id: "marketing",
    label: "News and offers",
    description: "Product updates, rate promotions and announcements.",
    locked: false,
  },
];

export type NotificationPreferences = Record<
  NotificationPreferenceCategory,
  Record<NotificationChannel, boolean>
>;

export function defaultPreferences(): NotificationPreferences {
  return {
    transactions: { email: true, inApp: true },
    securityAlerts: { email: true, inApp: true },
    marketing: { email: false, inApp: false },
  };
}

/**
 * Coerce a server payload into a complete matrix, then force security alerts
 * back on regardless of what the server sent.
 */
export function normalisePreferences(raw: unknown): NotificationPreferences {
  const base = defaultPreferences();
  if (!raw || typeof raw !== "object") return base;

  const source = raw as Record<string, unknown>;
  for (const category of NOTIFICATION_CATEGORIES) {
    const entry = source[category.id];
    if (!entry || typeof entry !== "object") continue;

    const channels = entry as Record<string, unknown>;
    for (const channel of NOTIFICATION_CHANNELS) {
      const value = channels[channel];
      if (typeof value === "boolean") {
        base[category.id][channel] = value;
      }
    }
  }

  base.securityAlerts.email = true;
  base.securityAlerts.inApp = true;

  return base;
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const data = await apiRequest<unknown>("/api/user/notification-preferences");
  return normalisePreferences(data);
}

export async function saveNotificationPreference(
  category: NotificationPreferenceCategory,
  channel: NotificationChannel,
  enabled: boolean,
): Promise<NotificationPreferences> {
  if (category === "securityAlerts") {
    // Locked in the UI; refuse here too rather than trusting the client.
    return defaultPreferences();
  }

  const data = await apiRequest<unknown>("/api/user/notification-preferences", {
    method: "PATCH",
    body: { category, channel, enabled },
  });

  return normalisePreferences(data);
}
