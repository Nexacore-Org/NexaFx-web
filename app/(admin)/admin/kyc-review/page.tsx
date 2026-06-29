/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  KycReviewTable,
  type KycSubmission,
  type KycStatus,
} from "@/components/admin/KycReviewTable";
import { getAdminKycSubmissions, updateKycStatus } from "@/lib/api/admin";
import { getRequestErrorMessage } from "@/lib/api-client";

export default function KycReviewPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<KycStatus | "All">("Pending");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminKycSubmissions();
        setSubmissions(data);
      } catch (err: unknown) {
        console.error("Error fetching KYC submissions:", err);
        setError(
          getRequestErrorMessage(err, {
            fallback: "Failed to load KYC submissions.",
          }),
        );
      } finally {
        setLoading(false);
      }
    }
    fetchSubmissions();
  }, []);

  const filtered = submissions.filter((s) => {
    if (statusFilter !== "All" && s.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !s.userName.toLowerCase().includes(q) &&
        !s.email.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const handleApprove = async (id: string) => {
    setLoadingAction(id);
    try {
      await updateKycStatus(id, "Approved");
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "Approved" as const } : s)),
      );
    } catch (err: unknown) {
      console.error("Error approving KYC:", err);
      alert(
        getRequestErrorMessage(err, { fallback: "Failed to approve KYC." }),
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoadingAction(id);
    try {
      await updateKycStatus(id, "Rejected");
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "Rejected" as const } : s)),
      );
    } catch (err: unknown) {
      console.error("Error rejecting KYC:", err);
      alert(
        getRequestErrorMessage(err, { fallback: "Failed to reject KYC." }),
      );
    } finally {
      setLoadingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-lg mx-auto mt-8">
        <p className="font-semibold">Error Loading KYC Submissions</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs font-semibold underline hover:text-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">KYC Review</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and manage KYC document submissions
        </p>
      </div>

      <KycReviewTable
        submissions={filtered}
        onApprove={handleApprove}
        onReject={handleReject}
        loadingAction={loadingAction}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  );
}
