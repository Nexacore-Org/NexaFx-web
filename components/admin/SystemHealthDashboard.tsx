"use client";

import { useState, useCallback } from "react";
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type ServiceStatus = "online" | "offline" | "degraded";

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  lastCheck: string;
  uptime: number;
}

export interface Incident {
  id: string;
  title: string;
  timestamp: string;
  severity: "critical" | "warning" | "resolved";
}

const MOCK_SERVICES: ServiceHealth[] = [
  { name: "API", status: "online", lastCheck: new Date().toISOString(), uptime: 99.97 },
  { name: "Database", status: "online", lastCheck: new Date().toISOString(), uptime: 99.89 },
  { name: "Blockchain", status: "degraded", lastCheck: new Date().toISOString(), uptime: 98.45 },
  { name: "Redis", status: "online", lastCheck: new Date().toISOString(), uptime: 99.99 },
  { name: "Email Service", status: "offline", lastCheck: new Date().toISOString(), uptime: 95.12 },
];

const MOCK_RESPONSE_TIMES = [
  { time: "00:00", api: 120, db: 45, blockchain: 850 },
  { time: "04:00", api: 95, db: 38, blockchain: 720 },
  { time: "08:00", api: 145, db: 52, blockchain: 1100 },
  { time: "12:00", api: 110, db: 41, blockchain: 980 },
  { time: "16:00", api: 135, db: 48, blockchain: 1050 },
  { time: "20:00", api: 100, db: 40, blockchain: 890 },
];

const MOCK_INCIDENTS: Incident[] = [
  { id: "inc1", title: "Blockchain node sync delay", timestamp: "2026-06-26T14:30:00Z", severity: "warning" },
  { id: "inc2", title: "Email delivery queue backlog", timestamp: "2026-06-25T09:15:00Z", severity: "critical" },
  { id: "inc3", title: "Database connection pool exhaustion", timestamp: "2026-06-24T22:00:00Z", severity: "resolved" },
  { id: "inc4", title: "API rate limiting threshold breached", timestamp: "2026-06-23T11:45:00Z", severity: "resolved" },
];

export function SystemHealthDashboard() {
  const [services, setServices] = useState<ServiceHealth[]>(MOCK_SERVICES);
  const [incidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    const now = new Date().toISOString();
    setServices((prev) =>
      prev.map((s) => ({ ...s, lastCheck: now })),
    );
    setRefreshing(false);
  }, []);

  const statusIcon = (status: ServiceStatus) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "offline":
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const statusDot = (status: ServiceStatus) => {
    const colors = {
      online: "bg-green-500",
      degraded: "bg-yellow-500",
      offline: "bg-red-500",
    };
    return (
      <span
        className={`inline-block w-3 h-3 rounded-full ${colors[status]} animate-pulse`}
      />
    );
  };

  const severityIcon = (severity: Incident["severity"]) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">System Health</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time status of all system services
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh All"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {services.map((svc) => (
          <div
            key={svc.name}
            className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">{svc.name}</p>
              {statusDot(svc.status)}
            </div>
            <div className="flex items-center gap-2 text-sm">
              {statusIcon(svc.status)}
              <span
                className={`font-medium capitalize ${
                  svc.status === "online"
                    ? "text-green-700"
                    : svc.status === "degraded"
                      ? "text-yellow-700"
                      : "text-red-700"
                }`}
              >
                {svc.status}
              </span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                Uptime: <span className="font-medium text-gray-700">{svc.uptime}%</span>
              </p>
              <p className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last check: {new Date(svc.lastCheck).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Response Time (ms)
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_RESPONSE_TIMES}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="api"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="API"
              />
              <Line
                type="monotone"
                dataKey="db"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="Database"
              />
              <Line
                type="monotone"
                dataKey="blockchain"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="Blockchain"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Recent Incidents
        </h2>
        {incidents.length === 0 ? (
          <p className="text-sm text-gray-500">No recent incidents.</p>
        ) : (
          <div className="space-y-3">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
              >
                {severityIcon(inc.severity)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{inc.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(inc.timestamp).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    inc.severity === "critical"
                      ? "bg-red-100 text-red-800"
                      : inc.severity === "warning"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {inc.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
