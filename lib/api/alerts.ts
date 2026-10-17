/**
 * Currency rate-threshold alerts API client (#1079).
 *
 * Backend contract (feature-flagged if not yet deployed):
 *   GET    /api/alerts              → { alerts: RateAlert[], maxAlerts: number }
 *   POST   /api/alerts              → RateAlert
 *   DELETE /api/alerts/:id          → { ok: true }
 *
 * Direction: "above" | "below" relative to the pair's mid market rate.
 */

import { apiRequest } from "@/lib/api-client";

export type AlertDirection = "above" | "below";

export interface RateAlert {
  id: string;
  pair: string;
  direction: AlertDirection;
  targetRate: number;
  note?: string;
  createdAt: string;
  /** Optional live mid rate when the API includes it */
  currentRate?: number;
  /** true when the threshold has already been crossed */
  triggered?: boolean;
}

export interface AlertsListResponse {
  alerts: RateAlert[];
  /** Server-enforced per-user limit */
  maxAlerts: number;
}

export interface CreateAlertInput {
  pair: string;
  direction: AlertDirection;
  targetRate: number;
  note?: string;
}

const DEFAULT_MAX_ALERTS = 20;

function normalizeAlert(entry: unknown): RateAlert | null {
  if (!entry || typeof entry !== "object") return null;
  const r = entry as Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.pair !== "string") return null;
  const direction = r.direction === "below" ? "below" : "above";
  const targetRate = Number(r.targetRate ?? r.target_rate);
  if (!Number.isFinite(targetRate) || targetRate <= 0) return null;
  return {
    id: r.id,
    pair: r.pair,
    direction,
    targetRate,
    note: typeof r.note === "string" ? r.note : undefined,
    createdAt:
      typeof r.createdAt === "string"
        ? r.createdAt
        : typeof r.created_at === "string"
          ? r.created_at
          : new Date().toISOString(),
    currentRate:
      typeof r.currentRate === "number"
        ? r.currentRate
        : typeof r.current_rate === "number"
          ? r.current_rate
          : undefined,
    triggered: Boolean(r.triggered),
  };
}

/**
 * Client-side validation shared by the create dialog and unit tests.
 * Returns an error message or null when valid.
 */
export function validateAlertInput(input: {
  pair?: string;
  direction?: string;
  targetRate?: number | string;
}): string | null {
  if (!input.pair || !String(input.pair).includes("/")) {
    return "Select a valid currency pair.";
  }
  if (input.direction !== "above" && input.direction !== "below") {
    return "Choose whether to alert above or below the target rate.";
  }
  const rate =
    typeof input.targetRate === "number"
      ? input.targetRate
      : Number(input.targetRate);
  if (!Number.isFinite(rate) || rate <= 0) {
    return "Target rate must be a number greater than zero.";
  }
  return null;
}

export async function listAlerts(): Promise<AlertsListResponse> {
  const payload = await apiRequest<unknown>("/api/alerts");
  if (Array.isArray(payload)) {
    return {
      alerts: payload
        .map(normalizeAlert)
        .filter((a): a is RateAlert => a !== null),
      maxAlerts: DEFAULT_MAX_ALERTS,
    };
  }
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    const list = Array.isArray(obj.alerts) ? obj.alerts : [];
    const max =
      typeof obj.maxAlerts === "number"
        ? obj.maxAlerts
        : typeof obj.max_alerts === "number"
          ? obj.max_alerts
          : DEFAULT_MAX_ALERTS;
    return {
      alerts: list
        .map(normalizeAlert)
        .filter((a): a is RateAlert => a !== null),
      maxAlerts: max,
    };
  }
  return { alerts: [], maxAlerts: DEFAULT_MAX_ALERTS };
}

export async function createAlert(input: CreateAlertInput): Promise<RateAlert> {
  const error = validateAlertInput(input);
  if (error) {
    throw new Error(error);
  }
  const payload = await apiRequest<unknown>("/api/alerts", {
    method: "POST",
    body: {
      pair: input.pair,
      direction: input.direction,
      targetRate: input.targetRate,
      note: input.note,
    },
  });
  const alert = normalizeAlert(payload);
  if (!alert) {
    throw new Error("Unexpected response when creating alert.");
  }
  return alert;
}

export async function deleteAlert(id: string): Promise<void> {
  if (!id) throw new Error("Alert id is required.");
  await apiRequest<unknown>(`/api/alerts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
