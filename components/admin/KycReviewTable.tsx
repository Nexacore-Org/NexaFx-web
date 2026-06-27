"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

export type KycStatus = "Pending" | "Approved" | "Rejected";

export interface KycSubmission {
  id: string;
  userId: string;
  userName: string;
  email: string;
  documentType: string;
  documentUrl: string;
  submissionDate: string;
  status: KycStatus;
}

type Props = {
  submissions: KycSubmission[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  loadingAction: string | null;
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: KycStatus | "All";
  onStatusFilterChange: (v: KycStatus | "All") => void;
};

export function KycReviewTable({
  submissions,
  onApprove,
  onReject,
  loadingAction,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusBadge = (status: KycStatus) => {
    const colors: Record<string, string> = {
      Pending: "bg-amber-100 text-amber-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}
      >
        {status}
      </span>
    );
  };

  const filters: (KycStatus | "All")[] = ["All", "Pending", "Approved", "Rejected"];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f5f5f5] text-[#595959] rounded-md min-w-64">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="outline-0 py-2 h-full bg-transparent w-full text-sm"
          />
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => onStatusFilterChange(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "All" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
          <p className="text-lg font-medium">No KYC submissions found</p>
          <p className="text-sm mt-1">
            {search || statusFilter !== "All"
              ? "Try adjusting your search or filter."
              : "No pending KYC submissions to review."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Document Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <>
                  <tr
                    key={sub.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-900 font-medium">{sub.userName}</p>
                        <p className="text-gray-500 text-xs">{sub.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{sub.documentType}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(sub.submissionDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{statusBadge(sub.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        {expandedId === sub.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedId === sub.id && (
                    <tr key={`${sub.id}-details`}>
                      <td colSpan={5} className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              User Information
                            </h4>
                            <p className="text-sm text-gray-900">
                              <span className="text-gray-500">Name:</span> {sub.userName}
                            </p>
                            <p className="text-sm text-gray-900">
                              <span className="text-gray-500">Email:</span> {sub.email}
                            </p>
                            <p className="text-sm text-gray-900">
                              <span className="text-gray-500">User ID:</span> {sub.userId}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Document Preview
                            </h4>
                            <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-center h-32 text-gray-400 text-sm">
                              Document preview placeholder
                            </div>
                            <p className="text-xs text-gray-500">
                              Document: {sub.documentType}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4 pt-3 border-t border-gray-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onApprove(sub.id);
                            }}
                            disabled={loadingAction === sub.id || sub.status !== "Pending"}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingAction === sub.id ? "Processing..." : "Approve"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onReject(sub.id);
                            }}
                            disabled={loadingAction === sub.id || sub.status !== "Pending"}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingAction === sub.id ? "Processing..." : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
