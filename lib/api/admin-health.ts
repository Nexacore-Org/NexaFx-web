import { apiRequest } from "../api-client";

export interface ServiceHealth {
  name: string;
  status: "up" | "degraded" | "down" | "unknown";
  latencyMs: number | null;
  checkedAt: string;
}

const STATUSES = ["up", "degraded", "down"] as const;

export async function getSystemHealth(): Promise<ServiceHealth[]> {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "/api";
  const data = await apiRequest<{ services?: Partial<ServiceHealth>[] }>(`${base}/admin/system-health`);
  return (data.services ?? []).map((s) => ({
    name: s.name ?? "unknown",
    status: STATUSES.includes(s.status as (typeof STATUSES)[number]) ? (s.status as ServiceHealth["status"]) : "unknown",
    latencyMs: typeof s.latencyMs === "number" ? s.latencyMs : null,
    checkedAt: s.checkedAt ?? "",
  }));
}
