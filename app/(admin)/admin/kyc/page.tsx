"use client";

import { useState, useEffect } from "react";
import { Loader2, ShieldCheck, Clock } from "lucide-react";
import { getPendingKyc, type KycSubmission } from "@/lib/api/admin";
import { KycReviewPanel } from "@/components/admin/kyc-review-panel";

export default function KycPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);

  const loadKyc = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPendingKyc();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load KYC submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKyc();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-lg mx-auto mt-10">
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button
          onClick={loadKyc}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">KYC Review</h1>
          <span className="bg-[#FFD552] text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
            {submissions.length} pending
          </span>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No pending KYC submissions</p>
          <p className="text-sm text-gray-400 mt-1">All submissions have been reviewed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Documents</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr
                  key={sub.userId}
                  onClick={() => setSelectedSubmission(sub)}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {sub.firstName} {sub.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{sub.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {sub.documents.length} files
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-yellow-600 font-medium">Review →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSubmission && (
        <KycReviewPanel
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onApproved={() => { setSelectedSubmission(null); loadKyc(); }}
          onRejected={() => { setSelectedSubmission(null); loadKyc(); }}
        />
      )}
    </div>
  );
}
