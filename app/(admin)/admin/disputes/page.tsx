"use client";

import { useState, useEffect } from "react";
import { DisputeTable } from "@/components/admin/DisputeTable";
import { getDisputes } from "@/lib/api/admin";
import type { Dispute } from "@/lib/api/admin";

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const loadDisputes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDisputes({ status: statusFilter });
      setDisputes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Dispute Management
          </h2>
          <p className="text-sm text-gray-500">
            Review and resolve flagged transactions
          </p>
        </div>
        <div className="flex gap-2">
          {["All", "Open", "Resolved"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={loadDisputes}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <DisputeTable
          disputes={disputes}
          loading={loading}
          onRefresh={loadDisputes}
        />
      )}
    </div>
  );
}
