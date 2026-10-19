import { z } from "zod";
import { apiRequest } from "@/lib/api-client";

export const RATE_RANGES = ["7D", "30D", "90D"] as const;
export type RateRange = (typeof RATE_RANGES)[number];

export interface RatePoint {
  /** ISO 8601 timestamp. */
  timestamp: string;
  /** Units of `to` per 1 unit of `from`. */
  rate: number;
}

/**
 * Assumed contract (no backend source or docs were available when this was
 * written, so it needs confirming against the real endpoint):
 *
 *   GET /rates/history (same origin as the other API calls)?from=USD&to=NGN&range=7D
 *   200 { "points": [{ "timestamp": "2026-10-01T00:00:00Z", "rate": "1500.25" }] }
 *
 * The response is validated, so a different shape surfaces as an error state
 * in the UI instead of drawing wrong data. Nothing here generates fake data.
 */
const responseSchema = z.object({
  points: z.array(
    z.object({
      timestamp: z.string().refine((value) => !Number.isNaN(Date.parse(value))),
      rate: z.coerce.number().finite(),
    }),
  ),
});

export async function getRateHistory(params: {
  from: string;
  to: string;
  range: RateRange;
}): Promise<RatePoint[]> {
  const data = await apiRequest<unknown>("/rates/history", {
    query: params,
  });
  const parsed = responseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Rate history response had an unexpected shape");
  }
  return parsed.data.points
    .map((point) => ({ timestamp: point.timestamp, rate: point.rate }))
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
}
