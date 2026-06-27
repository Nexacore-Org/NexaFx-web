"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import type { Dispute } from "@/lib/api/admin";
import { addDisputeNote, resolveDispute } from "@/lib/api/admin";

interface DisputeDetailPanelProps {
  dispute: Dispute;
  onRefresh: () => void;
}

export function DisputeDetailPanel({ dispute, onRefresh }: DisputeDetailPanelProps) {
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolution, setResolution] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    setError(null);
    try {
      await addDisputeNote(dispute.id, noteText.trim());
      setNoteText("");
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setSavingNote(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution) return;
    setResolving(true);
    setError(null);
    try {
      await resolveDispute(dispute.id, resolution);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve dispute");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="border-t border-gray-100 px-6 py-4 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Transaction Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-500 text-xs">Transaction ID</p>
          <p className="font-medium text-gray-900 truncate">{dispute.transactionId}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Amount</p>
          <p className="font-medium text-gray-900">
            {dispute.currency} {dispute.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Flag Reason</p>
          <p className="font-medium text-gray-900">{dispute.flagReason}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Date</p>
          <p className="font-medium text-gray-900">
            {new Date(dispute.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Internal Notes */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Internal Notes</h4>
        {dispute.notes.length === 0 ? (
          <p className="text-xs text-gray-400">No notes yet</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {dispute.notes.map((note) => (
              <div
                key={note.id}
                className="bg-gray-50 rounded-lg px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">
                    {note.author}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(note.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Note */}
      <div className="flex gap-2">
        <input
          type="text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add an internal note..."
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddNote();
            }
          }}
        />
        <button
          onClick={handleAddNote}
          disabled={!noteText.trim() || savingNote}
          className="px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {savingNote ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Resolve */}
      {dispute.status === "open" && (
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="">Select resolution...</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
            <option value="approved">Approved</option>
          </select>
          <button
            onClick={handleResolve}
            disabled={!resolution || resolving}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {resolving && <Loader2 className="w-4 h-4 animate-spin" />}
            Resolve Dispute
          </button>
        </div>
      )}
    </div>
  );
}
