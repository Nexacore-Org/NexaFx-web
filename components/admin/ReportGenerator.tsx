"use client";

import { useState } from "react";
import { Loader2, FileSpreadsheet } from "lucide-react";
import { generateReport } from "@/lib/api/admin";

interface ReportGeneratorProps {
  onGenerated: () => void;
}

const REPORT_TYPES = [
  { value: "transaction", label: "Transaction Report" },
  { value: "user-growth", label: "User Growth Report" },
  { value: "revenue", label: "Revenue Report" },
];

const FORMATS = [
  { value: "CSV", label: "CSV" },
  { value: "PDF", label: "PDF" },
  { value: "Excel", label: "Excel" },
];

export function ReportGenerator({ onGenerated }: ReportGeneratorProps) {
  const [type, setType] = useState("transaction");
  const [format, setFormat] = useState("CSV");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      setError("Please select start and end dates");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be after start date");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      await generateReport({ type, format, startDate, endDate });
      setType("transaction");
      setFormat("CSV");
      setStartDate("");
      setEndDate("");
      onGenerated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileSpreadsheet className="w-5 h-5 text-gray-700" />
        <h3 className="text-base font-semibold text-gray-900">
          Generate New Report
        </h3>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Report Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-white"
          >
            {REPORT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-white"
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Report"
        )}
      </button>
    </div>
  );
}
