"use client";

import { useEffect, useState } from "react";
import { Plus, Pause, Play, XCircle, RefreshCw } from "lucide-react";
import { useRecurringTransfersStore } from "@/hooks/use-recurring-transfers-store";
import { CreateRecurringTransferModal } from "@/components/dashboard/create-recurring-transfer-modal";

function TransferSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse space-y-3">
      <div className="h-5 w-1/3 rounded bg-gray-200" />
      <div className="h-4 w-1/2 rounded bg-gray-200" />
      <div className="h-4 w-2/3 rounded bg-gray-200" />
      <div className="flex gap-2 pt-2">
        <div className="h-8 w-20 rounded bg-gray-200" />
        <div className="h-8 w-20 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export default function TransfersPage() {
  const { transfers, isLoading, error, fetchTransfers, pauseTransfer, cancelTransfer } =
    useRecurringTransfersStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      paused: "bg-amber-100 text-amber-800",
      completed: "bg-gray-100 text-gray-600",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Recurring Transfers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your scheduled recurring transfers</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchTransfers}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-600"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFD552] text-black rounded-lg text-sm font-semibold hover:bg-yellow-400"
          >
            <Plus className="w-4 h-4" />
            Create Recurring Transfer
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <TransferSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchTransfers}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      ) : transfers.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
          <p className="text-lg font-medium">No recurring transfers yet</p>
          <p className="text-sm mt-1">
            Create your first recurring transfer to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {transfers.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {t.amount.toLocaleString()} {t.currency}
                  </p>
                  <p className="text-sm text-gray-500">to {t.recipient}</p>
                </div>
                {statusBadge(t.status)}
              </div>

              <div className="space-y-1.5 text-sm text-gray-600">
                <p>
                  <span className="text-gray-400">Frequency:</span> {t.frequency}
                </p>
                <p>
                  <span className="text-gray-400">Next execution:</span>{" "}
                  {new Date(t.nextExecutionDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="text-gray-400">Total executed:</span>{" "}
                  {t.totalExecuted}
                </p>
                <p>
                  <span className="text-gray-400">Period:</span>{" "}
                  {new Date(t.startDate).toLocaleDateString()} -{" "}
                  {new Date(t.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                {t.status !== "completed" && (
                  <button
                    onClick={() => pauseTransfer(t.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700"
                  >
                    {t.status === "active" ? (
                      <><Pause className="w-3.5 h-3.5" /> Pause</>
                    ) : (
                      <><Play className="w-3.5 h-3.5" /> Resume</>
                    )}
                  </button>
                )}
                <button
                  onClick={() => cancelTransfer(t.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 hover:bg-red-50 text-red-600"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateRecurringTransferModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
