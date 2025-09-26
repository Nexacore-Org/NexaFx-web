"use client";

import React from "react";
import { useAdminOverview } from "@/hooks/useAdminDashboard";


export function AdminDepositWithdrawalSummary() {
  const { data: overviewData, isLoading } = useAdminOverview();

  // Use real data if available, otherwise fallback to design values
  const totalDeposits = overviewData?.totalDeposits || 50000;
  const totalWithdrawals = overviewData?.totalWithdrawals || 30000;

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Total Deposits - Top Half */}
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-2">Total Deposits</div>
          {isLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto max-w-24"></div>
          ) : (
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(totalDeposits)}
            </div>
          )}
        </div>
      </div>

      {/* Middle Line */}
      <div className="border-t border-gray-200"></div>

      {/* Total Withdrawals - Bottom Half */}
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-2">Total Withdrawals</div>
          {isLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto max-w-24"></div>
          ) : (
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(totalWithdrawals)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
