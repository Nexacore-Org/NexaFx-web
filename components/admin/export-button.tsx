"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Transaction } from "@/lib/api/admin";
import { exportTransactionsToCsv } from "@/lib/utils/export";

interface ExportButtonProps {
  transactions: Transaction[];
}

export function ExportButton({ transactions }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate slight delay for large datasets to show the loader
    await new Promise((resolve) => setTimeout(resolve, 300));
    exportTransactionsToCsv(transactions);
    setIsExporting(false);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || transactions.length === 0}
      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Export CSV
    </button>
  );
}
