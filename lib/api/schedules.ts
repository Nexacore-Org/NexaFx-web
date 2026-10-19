/**
 * Schedules API — one-off and recurring conversions.
 *
 * BACKEND STATUS: the upstream backend does not expose schedule endpoints yet.
 * This module implements the full UI contract against the documented paths
 * below and gates every read/write behind `SCHEDULES_ENABLED` so the app
 * degrades gracefully when the backend is not ready. Remove the flag once the
 * endpoints ship:
 *
 *   GET    /schedules               — list
 *   POST   /schedules               — create
 *   POST   /schedules/:id/pause     — pause a running schedule
 *   POST   /schedules/:id/resume    — resume a paused schedule
 *   DELETE /schedules/:id           — cancel (irreversible)
 *
 * The rate is applied at execution time, never at creation time, so an amount
 * shown here is only an estimate until the schedule actually runs.
 */

import { apiRequest } from "@/lib/api-client";

// ---------------------------------------------------------------------------
// Feature flag
// ---------------------------------------------------------------------------

export const SCHEDULES_ENABLED =
  process.env.NEXT_PUBLIC_SCHEDULES_ENABLED === "true";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScheduleFrequency = "once" | "weekly" | "monthly";

export type ScheduleStatus = "active" | "paused" | "cancelled";

/** Outcome of the most recent run, if the schedule has run at least once. */
export type RunResult = "success" | "failed" | "pending";

export interface ScheduleRun {
  id: string;
  status: RunResult;
  /** ISO timestamp of the run. */
  ranAt: string;
  /** Human-readable failure reason, e.g. "Insufficient balance". */
  reason: string | null;
  /** Stellar transaction hash when the run produced one. */
  transactionHash: string | null;
}

export interface Schedule {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  /** Source amount as a decimal string, to avoid float drift. */
  amount: string;
  frequency: ScheduleFrequency;
  /** Calendar date (`YYYY-MM-DD`) the schedule first runs. */
  startDate: string;
  /** Optional calendar date the schedule stops running. */
  endDate: string | null;
  status: ScheduleStatus;
  /** ISO timestamp of the next run, or null when paused/cancelled/ended. */
  nextRunAt: string | null;
  /** Result of the last run, or null when the schedule has not run yet. */
  lastRun: ScheduleRun | null;
}

export interface CreateScheduleInput {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  frequency: ScheduleFrequency;
  startDate: string;
  endDate: string | null;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** Timezone-safe `YYYY-MM-DD` parser. Rejects impossible dates (e.g. 2026-02-30). */
export function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  // Local midnight; the month is 1-based for the Date constructor too.
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null; // Rolled over (e.g. day 32) — not a real calendar date.
  }
  return date;
}

function startOfToday(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Returns an error message when `startDate` is not a real calendar date in the
 * future, or `null` when valid.
 *
 * The date is interpreted in the user's local timezone. A schedule must start
 * strictly after today: choosing today would mean a start time already in the
 * past.
 */
export function validateStartDate(
  startDate: string,
  now: Date = new Date(),
): string | null {
  if (!startDate) return "Choose a start date";
  const parsed = parseLocalDate(startDate);
  if (!parsed) return "Enter a valid date";
  if (parsed.getTime() <= startOfToday(now).getTime()) {
    return "Start date must be in the future";
  }
  return null;
}

/**
 * Returns an error message when `endDate` is invalid, or `null` when valid.
 * A missing end date is allowed (the schedule runs until cancelled).
 */
export function validateEndDate(
  startDate: string,
  endDate: string | null,
  now: Date = new Date(),
): string | null {
  if (!endDate) return null;
  const parsedEnd = parseLocalDate(endDate);
  if (!parsedEnd) return "Enter a valid end date";
  const parsedStart = parseLocalDate(startDate);
  if (parsedStart && parsedEnd.getTime() < parsedStart.getTime()) {
    return "End date cannot be before the start date";
  }
  if (parsedEnd.getTime() <= startOfToday(now).getTime()) {
    return "End date must be in the future";
  }
  return null;
}

/**
 * Validates the whole create payload. Returns a map of field → message; an
 * empty object means the payload is valid.
 */
export function validateSchedule(
  input: Pick<
    CreateScheduleInput,
    "fromCurrency" | "toCurrency" | "amount" | "startDate" | "endDate"
  >,
  now: Date = new Date(),
): Partial<Record<"amount" | "startDate" | "endDate" | "pair", string>> {
  const errors: Partial<
    Record<"amount" | "startDate" | "endDate" | "pair", string>
  > = {};

  if (!input.fromCurrency || !input.toCurrency) {
    errors.pair = "Choose both currencies";
  } else if (input.fromCurrency === input.toCurrency) {
    errors.pair = "Choose two different currencies";
  }

  const amount = Number.parseFloat(input.amount);
  if (!input.amount || !Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Enter an amount greater than zero";
  }

  const startError = validateStartDate(input.startDate, now);
  if (startError) errors.startDate = startError;

  const endError = validateEndDate(input.startDate, input.endDate, now);
  if (endError) errors.endDate = endError;

  return errors;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function getSchedules(): Promise<Schedule[]> {
  if (!SCHEDULES_ENABLED) return [];
  const json = await apiRequest<{ schedules?: Schedule[] } | Schedule[]>(
    "/schedules",
  );
  return Array.isArray(json) ? json : (json.schedules ?? []);
}

export async function createSchedule(
  input: CreateScheduleInput,
): Promise<Schedule> {
  return apiRequest<Schedule>("/schedules", { method: "POST", body: input });
}

export async function pauseSchedule(id: string): Promise<Schedule> {
  return apiRequest<Schedule>(`/schedules/${id}/pause`, { method: "POST" });
}

export async function resumeSchedule(id: string): Promise<Schedule> {
  return apiRequest<Schedule>(`/schedules/${id}/resume`, { method: "POST" });
}

export async function cancelSchedule(id: string): Promise<void> {
  await apiRequest(`/schedules/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Presentation helpers
// ---------------------------------------------------------------------------

export function frequencyLabel(frequency: ScheduleFrequency): string {
  switch (frequency) {
    case "once":
      return "One-off";
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
  }
}
