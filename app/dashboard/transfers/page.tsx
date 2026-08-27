"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, RefreshCw, AlertCircle, Pause, XCircle } from "lucide-react";
import { useRecurringTransfersStore } from "@/hooks/use-recurring-transfers-store";
import { CreateRecurringTransferModal } from "@/components/dashboard/create-recurring-transfer-modal";

export default function TransfersPage() {
  const { transfers, loading, error, fetchTransfers, pauseTransfer, cancelTransfer } =
    useRecurringTransfersStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Recurring Transfers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your automated recurring transfers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTransfers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            New Transfer
          </button>
        </div>
      </div>

      {loading && transfers.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-lg mx-auto mt-8">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p className="font-semibold">Error Loading Transfers</p>
          </div>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchTransfers}
            className="mt-2 text-xs font-semibold underline hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      ) : transfers.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-500">
          <p className="text-lg font-medium">No recurring transfers yet</p>
          <p className="text-sm mt-1">Create your first one to get started</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            Create Transfer
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {transfers.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  {t.amount} {t.currency}
                </p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    t.status === "active"
                      ? "bg-green-100 text-green-800"
                      : t.status === "paused"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {t.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  To:{" "}
                  <span className="text-gray-700 font-mono">
                    {t.recipientAddress}
                  </span>
                </p>
                <p>Frequency: {t.frequency}</p>
                <p>Next: {new Date(t.nextExecution).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => pauseTransfer(t.id)}
                  disabled={t.status !== "active"}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  <Pause className="w-3 h-3" />
                  Pause
                </button>
                <button
                  onClick={() => cancelTransfer(t.id)}
                  disabled={t.status === "cancelled" || t.status === "completed"}
                  className="flex items-center gap-1 px-3 py-1.5 border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                >
                  <XCircle className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateRecurringTransferModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}
