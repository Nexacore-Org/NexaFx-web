"use client";

import { useState, useEffect } from "react";
import { ArrowLeftRight, Download, Upload, Loader2 } from "lucide-react";
import {
  FeeConfigSection,
  UpdateHistory,
} from "@/components/admin/FeeConfigSection";

type FeeConfig = {
  id: string;
  label: string;
  percentage: number;
  minFee: number;
  maxFee: number;
  currency: string;
  applicablePairs?: string[];
};

type HistoryEntry = {
  id: string;
  action: string;
  field: string;
  oldValue: string;
  newValue: string;
  updatedBy: string;
  updatedAt: string;
};

const mockConversionFees: FeeConfig[] = [
  {
    id: "conv-1",
    label: "NGN → USD",
    percentage: 1.5,
    minFee: 100,
    maxFee: 5000,
    currency: "NGN",
    applicablePairs: ["NGN/USD", "NGN/GBP", "NGN/EUR"],
  },
  {
    id: "conv-2",
    label: "USD → NGN",
    percentage: 1.0,
    minFee: 2,
    maxFee: 50,
    currency: "USD",
    applicablePairs: ["USD/NGN", "USD/EUR"],
  },
];

const mockDepositFees: FeeConfig[] = [
  {
    id: "dep-1",
    label: "Bank Transfer",
    percentage: 0.0,
    minFee: 0,
    maxFee: 0,
    currency: "NGN",
  },
  {
    id: "dep-2",
    label: "Card Payment",
    percentage: 1.75,
    minFee: 50,
    maxFee: 2000,
    currency: "NGN",
  },
];

const mockWithdrawalFees: FeeConfig[] = [
  {
    id: "wit-1",
    label: "Bank Withdrawal",
    percentage: 0.5,
    minFee: 50,
    maxFee: 1500,
    currency: "NGN",
  },
  {
    id: "wit-2",
    label: "Crypto Withdrawal",
    percentage: 0.25,
    minFee: 1,
    maxFee: 10,
    currency: "USD",
  },
];

const mockHistory: HistoryEntry[] = [
  {
    id: "h-1",
    action: "Updated",
    field: "Conversion Fee (NGN → USD)",
    oldValue: "2.0%",
    newValue: "1.5%",
    updatedBy: "Admin",
    updatedAt: "2026-06-25 14:30",
  },
  {
    id: "h-2",
    action: "Updated",
    field: "Deposit Fee (Card Payment)",
    oldValue: "2.0%",
    newValue: "1.75%",
    updatedBy: "Admin",
    updatedAt: "2026-06-24 10:15",
  },
];

export default function FeeConfigPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-lg mx-auto mt-10">
        <h3 className="text-red-800 font-semibold mb-2">
          Error Loading Fee Configuration
        </h3>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
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
        <h1 className="text-2xl font-bold text-gray-900">Fee Configuration</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeeConfigSection
          title="Conversion Fees"
          icon={<ArrowLeftRight className="w-5 h-5 text-gray-500" />}
          configs={mockConversionFees}
          isLoading={loading}
        />
        <FeeConfigSection
          title="Deposit Fees"
          icon={<Download className="w-5 h-5 text-gray-500" />}
          configs={mockDepositFees}
          isLoading={loading}
        />
      </div>

      <FeeConfigSection
        title="Withdrawal Fees"
        icon={<Upload className="w-5 h-5 text-gray-500" />}
        configs={mockWithdrawalFees}
        isLoading={loading}
      />

      <UpdateHistory entries={mockHistory} isLoading={loading} />
    </div>
  );
}
