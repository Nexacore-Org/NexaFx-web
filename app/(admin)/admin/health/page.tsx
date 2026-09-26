"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Loader2, Activity } from "lucide-react";
import { getSystemHealth, type SystemHealth, type ServiceStatus } from "@/lib/api/admin";

const statusConfig: Record<ServiceStatus, { label: string; color: string; bg: string }> = {
  ok: { label: "Operational", color: "text-green-600", bg: "bg-green-50 border-green-200" },
  degraded: { label: "Degraded", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
  down: { label: "Down", color: "text-red-600", bg: "bg-red-50 border-red-200" },
  unknown: { label: "Unknown", color: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
};

const serviceLabels: Record<string, string> = {
  api: "API Server",
  database: "Database",
  stellar: "Stellar Network",
  moonpay: "MoonPay",
  exchangeRates: "Exchange Rates",
};

export default function HealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setError(null);
      const data = await getSystemHealth();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load system health");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchHealth().finally(() => setLoading(false));
  }, [fetchHealth]);

  useEffect(() => {
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHealth();
    setRefreshing(false);
  };

  const getOverallStatus = (): ServiceStatus => {
    if (!health) return "unknown";
    const services: ServiceStatus[] = [health.api, health.database, health.stellar, health.moonpay, health.exchangeRates];
    if (services.some(s => s === "down")) return "down";
    if (services.some(s => s === "degraded")) return "degraded";
    if (services.every(s => s === "ok")) return "ok";
    return "unknown";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const overallStatus = getOverallStatus();
  const overallConfig = statusConfig[overallStatus];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">System Health</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {health && (
        <>
          <div className={`rounded-2xl border p-6 ${overallConfig.bg}`}>
            <div className="flex items-center gap-3">
              <Activity className={`w-8 h-8 ${overallConfig.color}`} />
              <div>
                <p className={`text-2xl font-bold ${overallConfig.color}`}>
                  System {overallConfig.label}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Last checked: {new Date(health.lastChecked).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(serviceLabels).map(([key, label]) => {
              const status = health[key as keyof SystemHealth] as ServiceStatus;
              const cfg = statusConfig[status];
              return (
                <div key={key} className={`rounded-2xl border p-5 ${cfg.bg}`}>
                  <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${status === "ok" ? "bg-green-500" : status === "degraded" ? "bg-yellow-500" : status === "down" ? "bg-red-500" : "bg-gray-400"}`} />
                    <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
