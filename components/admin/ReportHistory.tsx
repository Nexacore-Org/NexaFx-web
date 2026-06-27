"use client";

import { Download, FileText, Loader2 } from "lucide-react";
import type { Report } from "@/lib/api/admin";

interface ReportHistoryProps {
  reports: Report[];
  loading: boolean;
}

export function ReportHistory({ reports, loading }: ReportHistoryProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 bg-white rounded-2xl border border-gray-200">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
          <FileText className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 font-medium">No reports generated yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Generate your first report above
        </p>
      </div>
    );
  }

  const formatLabel = (fmt: string) => {
    switch (fmt) {
      case "CSV": return "CSV";
      case "PDF": return "PDF";
      case "Excel": return "XLSX";
      default: return fmt;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">
          Generated Reports
        </h3>
      </div>
      <div className="divide-y divide-gray-100">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex items-center justify-between px-6 py-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {report.title}
                </p>
                <p className="text-xs text-gray-500">
                  {report.type} &middot; {formatLabel(report.format)} &middot;{" "}
                  {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {report.url && (
              <a
                href={report.url}
                download
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
