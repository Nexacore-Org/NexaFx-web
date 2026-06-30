"use client";

import { useState, useCallback } from "react";
import { X, Loader2, Check, Ban, ChevronLeft, ChevronRight } from "lucide-react";
import { approveKyc, rejectKyc, type KycSubmission } from "@/lib/api/admin";

interface KycReviewPanelProps {
  submission: KycSubmission;
  onClose: () => void;
  onApproved: () => void;
  onRejected: () => void;
}

export function KycReviewPanel({ submission, onClose, onApproved, onRejected }: KycReviewPanelProps) {
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleApprove = async () => {
    try {
      setProcessing(true);
      setError(null);
      await approveKyc(submission.userId);
      onApproved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve KYC");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      setProcessing(true);
      setError(null);
      await rejectKyc(submission.userId, rejectReason.trim());
      onRejected();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject KYC");
    } finally {
      setProcessing(false);
    }
  };

  const handleBackdrop = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleBackdrop} />

      <div className="fixed inset-x-0 bottom-0 lg:right-0 lg:top-10 lg:inset-x-auto max-h-[85vh] lg:h-[590px] w-full lg:w-[710px] bg-white shadow-2xl z-50 overflow-y-auto rounded-t-3xl lg:rounded-lg lg:mr-4">
        <div className="sticky top-0 bg-white px-5 py-4 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-medium text-gray-900">KYC Review</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Name</span>
              <span className="text-sm font-medium text-gray-900">{submission.firstName} {submission.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm font-medium text-gray-900">{submission.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Submitted</span>
              <span className="text-sm font-medium text-gray-900">{new Date(submission.submittedAt).toLocaleString()}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Documents</h3>
            <div className="grid grid-cols-2 gap-3">
              {submission.documents.map((doc, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className="relative aspect-[4/3] rounded-lg border border-gray-200 overflow-hidden hover:border-yellow-400 transition-colors group"
                >
                  <img
                    src={doc.url}
                    alt={doc.type}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                    {doc.type.replace(/_/g, " ")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            {!action ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setAction("approve")}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => setAction("reject")}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Ban className="w-4 h-4" />
                  Reject
                </button>
              </div>
            ) : action === "approve" ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Are you sure you want to approve this KYC submission?</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {processing ? "Approving..." : "Confirm Approve"}
                  </button>
                  <button
                    onClick={() => setAction(null)}
                    disabled={processing}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Rejection Reason *</label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[80px]"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleReject}
                    disabled={processing || !rejectReason.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                    {processing ? "Rejecting..." : "Confirm Reject"}
                  </button>
                  <button
                    onClick={() => setAction(null)}
                    disabled={processing}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          <img
            src={submission.documents[lightboxIndex].url}
            alt={submission.documents[lightboxIndex].type}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {lightboxIndex < submission.documents.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {lightboxIndex + 1} / {submission.documents.length}
          </div>
        </div>
      )}
    </>
  );
}
