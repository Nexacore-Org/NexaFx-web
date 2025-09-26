"use client";

import React from "react";
import { Gem, Package, SquareActivity } from "lucide-react";
import { useAdminOverview } from "@/hooks/useAdminDashboard";

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

function MetricCard({ title, value, icon, isLoading }: MetricCardProps) {
  return (
    <div className="bg-white flex justify-start items-start gap-3 rounded-lg p-3 pl-5 shadow-sm">
      <div className="flex items-center justify-center p-1 bg-bg-contact-orange rounded-full">
        <div className="w-6 h-6">
          {icon}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-text-tertiary font-medium">{title}</p>
        {isLoading ? (
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <p className="text-2xl font-bold text-text-primary">{value}</p>
        )}
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function AdminOverviewCards() {
  const { data: overviewData, isLoading } = useAdminOverview();

  const metrics = [
    {
      title: "Registered Users",
      value: overviewData ? formatNumber(overviewData.totalUsers) : "1,524",
      icon: <Gem className="w-6 h-6 text-white" />,
    },
    {
      title: "Total Transaction",
      value: overviewData ? formatNumber(overviewData.totalDeposits + overviewData.totalWithdrawals) : "105,845",
      icon: <Package className="w-6 h-6 text-white" />,
    },
    {
      title: "Pending KYC",
      value: "25", // This would come from a separate endpoint
      icon: <SquareActivity className="w-6 h-6 text-white" />,
    },
    {
      title: "Currency",
      value: "8", // This would come from a separate endpoint
      icon: <Package className="w-6 h-6 text-white" />,
    },
  ];

  // For mobile: create two sections - deposits/withdrawals and metric cards
  const depositWithdrawData = {
    totalDeposits: overviewData?.totalDeposits || 50000,
    totalWithdrawals: overviewData?.totalWithdrawals || 30000,
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="block md:hidden">
        {/* Gradient section with deposits/withdrawals */}
        <div 
          className="rounded-lg p-6 mb-4"
          style={{
            background: 'linear-gradient(135deg, #A0C3FD 0%, #FFE79C 100%)'
          }}
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Total Deposits</div>
              {isLoading ? (
                <div className="h-6 bg-white/30 rounded animate-pulse"></div>
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(depositWithdrawData.totalDeposits)}
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Total Withdrawals</div>
              {isLoading ? (
                <div className="h-6 bg-white/30 rounded animate-pulse"></div>
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(depositWithdrawData.totalWithdrawals)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metric cards in 2x2 grid */}
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </>
  );
}