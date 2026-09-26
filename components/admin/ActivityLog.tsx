"use client";
import React, { useEffect, useState } from "react";
import { getAuthHeaders, mapAdminUser } from "@/lib/api/admin";
import { apiClient } from "@/lib/api-client";

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target?: string;
  createdAt: string;
}

export default function ActivityLog() {
  const [items, setItems] = useState<ActivityItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // TODO: Prefer /admin/activity (backend) when available. Falling back
        // to client-side collected actions stored in localStorage for now.
        const json = await apiClient<any>("/admin/activity", { method: "GET", headers: getAuthHeaders() });
        const data = (json?.data ?? json ?? []) as any[];
        if (!mounted) return;
        setItems(
          data.map((d) => ({
            id: d.id ?? d._id ?? String(Math.random()),
            actor: d.actor ?? d.admin ?? "Unknown",
            action: d.action ?? d.type ?? "Unknown",
            target: d.target ?? d.userId ?? d.targetId ?? undefined,
            createdAt: d.createdAt ?? d.created_at ?? d.timestamp ?? "",
          })),
        );
      } catch (err) {
        // degrade gracefully: show empty state
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="p-4 bg-white rounded-lg border">Loading activity...</div>;
  if (!items || items.length === 0)
    return (
      <div className="p-4 bg-white rounded-lg border">
        <h4 className="font-semibold">Activity Log</h4>
        <p className="text-sm text-gray-500">No activity available.</p>
      </div>
    );

  return (
    <div className="p-4 bg-white rounded-lg border">
      <h4 className="font-semibold">Activity Log</h4>
      <ul className="mt-3 space-y-2">
        {items.slice(0, 10).map((it) => (
          <li key={it.id} className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium">{it.action}</div>
              <div className="text-xs text-gray-500">By {it.actor}{it.target ? ` — ${it.target}` : ""}</div>
            </div>
            <div className="text-xs text-gray-400">{new Date(it.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
