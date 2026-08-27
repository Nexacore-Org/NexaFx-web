"use client";

import { useState } from "react";
import { Loader2, X, Download, Bell, UserX } from "lucide-react";
import { bulkDeactivateUsers, bulkSendNotification } from "@/lib/api/admin";

interface BulkActionBarProps {
  selectedIds: string[];
  onClear: () => void;
  onSuccess: () => void;
}

export function BulkActionBar({ selectedIds, onClear, onSuccess }: BulkActionBarProps) {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (selectedIds.length === 0) return null;

  const handleDeactivate = async () => {
    try {
      setProcessing(true);
      setError(null);
      await bulkDeactivateUsers(selectedIds);
      onClear();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate users");
    } finally {
      setProcessing(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) return;
    try {
      setProcessing(true);
      setError(null);
      await bulkSendNotification(selectedIds, notificationTitle.trim(), notificationMessage.trim());
      setShowNotificationModal(false);
      setNotificationTitle("");
      setNotificationMessage("");
      onClear();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send notification");
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = () => {
    const csv = ["userId,email", ...selectedIds.map(id => `${id},`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export-users-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onClear();
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-900">
              {selectedIds.length} user{selectedIds.length > 1 ? "s" : ""} selected
            </span>
            <button
              onClick={onClear}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeactivate}
              disabled={processing}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
              Deactivate selected
            </button>
            <button
              onClick={() => setShowNotificationModal(true)}
              disabled={processing}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Bell className="w-4 h-4" />
              Send notification
            </button>
            <button
              onClick={handleExport}
              disabled={processing}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export selected
            </button>
          </div>
        </div>
        {error && (
          <div className="max-w-7xl mx-auto mt-2 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {showNotificationModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowNotificationModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Notification</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={e => setNotificationTitle(e.target.value)}
                  placeholder="Notification title"
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Message</label>
                <textarea
                  value={notificationMessage}
                  onChange={e => setNotificationMessage(e.target.value)}
                  placeholder="Notification message"
                  rows={3}
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={processing || !notificationTitle.trim() || !notificationMessage.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {processing ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
