"use client";

import { useQuery } from "@tanstack/react-query";
import { getSystemHealth } from "@/lib/api/admin-health";

const TONE = { up: "text-green-700", degraded: "text-amber-700", down: "text-red-700", unknown: "text-zinc-500" };

export default function SystemHealth({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const { data, isPending, isError, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["admin", "system-health"],
    queryFn: getSystemHealth,
    refetchInterval: intervalMs,
  });

  if (isPending) return <p role="status" aria-busy="true" className="text-sm">Checking services…</p>;
  if (isError)
    return (
      <div role="alert" className="space-y-2 text-sm">
        <p>Could not load system health.</p>
        <button type="button" onClick={() => refetch()} className="rounded-md border px-3 py-1.5">Retry</button>
      </div>
    );

  return (
    <div className="space-y-2 text-sm">
      <p className="text-muted-foreground">Refreshes every {Math.round(intervalMs / 1000)}s · last update {new Date(dataUpdatedAt).toISOString()}</p>
      <table className="w-full border-collapse">
        <thead><tr className="border-b text-left"><th className="py-2">Service</th><th>Status</th><th>Latency</th><th>Last checked</th></tr></thead>
        <tbody>
          {data.map((s) => (
            <tr key={s.name} className="border-b">
              <td className="py-2">{s.name}</td>
              <td className={TONE[s.status]}>{s.status}</td>
              <td>{s.latencyMs === null ? "-" : `${s.latencyMs} ms`}</td>
              <td>{s.checkedAt ? <time dateTime={s.checkedAt}>{s.checkedAt}</time> : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
