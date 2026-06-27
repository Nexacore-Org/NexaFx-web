"use client";

import { useState, useEffect } from "react";
import { ReportGenerator } from "@/components/admin/ReportGenerator";
import { ReportHistory } from "@/components/admin/ReportHistory";
import { getReports } from "@/lib/api/admin";
import type { Report } from "@/lib/api/admin";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReports();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
        <p className="text-sm text-gray-500">
          Generate and download transaction, user growth, and revenue reports
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={loadReports}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <ReportGenerator onGenerated={loadReports} />
      <ReportHistory reports={reports} loading={loading} />
    </div>
  );
}
