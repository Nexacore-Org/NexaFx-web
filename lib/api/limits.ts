import { apiRequest } from "@/lib/api-client";

/**
 * NOTE: The backend limits contract is NOT confirmed. The shapes below are
 * documented assumptions. Fields are normalised at the read boundary so a
 * partial response degrades gracefully rather than crashing the page.
 *
 * Assumed endpoint: GET /user/limits
 * Response shape:
 *   { tier, daily: { limit, used }, monthly: { limit, used } }
 */

export type UserTier = "basic" | "verified" | "premium";

export interface LimitPeriod {
  /** Maximum amount allowed in this period (in the account's base currency). */
  limit: number;
  /** Amount already consumed in this period. */
  used: number;
}

export interface UserLimits {
  /** The user's current KYC tier. */
  tier: UserTier;
  /** Daily withdrawal allowance. */
  daily: LimitPeriod;
  /** Monthly withdrawal allowance. */
  monthly: LimitPeriod;
  /** ISO 4217 currency code for all limit values. */
  currency: string;
}

function toApiBase(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "/api";
  return `${base}${path}`;
}

function num(val: unknown, fallback = 0): number {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string") {
    const parsed = parseFloat(val);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function normalisePeriod(
  raw: unknown,
  defaultLimit: number,
): LimitPeriod | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const limit = num(d.limit ?? d.max, defaultLimit);
  const used = num(d.used ?? d.consumed, 0);
  if (limit <= 0) return null;
  return { limit, used };
}

function normaliseTier(raw: unknown): UserTier {
  const s = typeof raw === "string" ? raw.toLowerCase() : "";
  if (s === "verified" || s === "premium") return s;
  return "basic";
}

export async function fetchUserLimits(): Promise<UserLimits | null> {
  try {
    const data = await apiRequest<unknown>(toApiBase("/user/limits"));
    if (!data || typeof data !== "object") return null;

    const d = data as Record<string, unknown>;
    const daily = normalisePeriod(d.daily, 500_000);
    const monthly = normalisePeriod(d.monthly, 5_000_000);

    // If neither period is present the backend returned something unexpected.
    if (!daily && !monthly) return null;

    return {
      tier: normaliseTier(d.tier),
      daily: daily ?? { limit: 500_000, used: 0 },
      monthly: monthly ?? { limit: 5_000_000, used: 0 },
      currency:
        typeof d.currency === "string" ? d.currency.toUpperCase() : "NGN",
    };
  } catch {
    // If the endpoint is unreachable, return null so the indicator hides
    // rather than showing fabricated data.
    return null;
  }
}
