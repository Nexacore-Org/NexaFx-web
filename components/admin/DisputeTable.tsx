"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import type { Dispute } from "@/lib/api/admin";
import { DisputeDetailPanel } from "./DisputeDetailPanel";

interface DisputeTableProps {
  disputes: Dispute[];
  loading: boolean;
  onRefresh: () => void;
}

export function DisputeTable({ disputes, loading, onRefresh }: DisputeTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">No disputes found</p>
        <p className="text-sm text-gray-400 mt-1">
          All flagged transactions have been resolved.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {disputes.map((dispute) => {
        const isExpanded = expandedId === dispute.id;
        return (
          <div
            key={dispute.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-sm"
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : dispute.id)}
              className="w-full flex items-center justify-between px-6 py-4 text-left"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-shrink-0">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      dispute.status === "open" ? "bg-amber-500" : "bg-green-500"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {dispute.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {dispute.currency} {dispute.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="hidden sm:block text-xs text-gray-500">
                  {dispute.flagReason}
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    dispute.status === "open"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {dispute.status === "open" ? "Open" : "Resolved"}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
              )}
            </button>
            {isExpanded && (
              <DisputeDetailPanel
                dispute={dispute}
                onRefresh={onRefresh}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
