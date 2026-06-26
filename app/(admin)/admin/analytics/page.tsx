"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, UserPlus, ArrowUpDown, Clock, Coins } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import {
  getAdminMetrics,
  getAdminUsers,
  type AdminMetrics,
  type AdminUser,
} from "@/lib/api/admin";
import { getRequestErrorMessage, isOfflineError } from "@/lib/api-client";

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const hasCachedAnalyticsRef = useRef(false);

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setLoading(true);
        setError(null);
        const [fetchedMetrics, fetchedUsers] = await Promise.all([
          getAdminMetrics(),
          getAdminUsers(),
        ]);
        hasCachedAnalyticsRef.current = true;
        setOfflineNotice(null);
        setMetrics(fetchedMetrics);
        setRecentUsers(fetchedUsers.slice(0, 5));
      } catch (err: unknown) {
        console.error("Error fetching analytics data:", err);
        const hasCachedData = hasCachedAnalyticsRef.current;
        const message = getRequestErrorMessage(err, {
          fallback: "Failed to load analytics data.",
          hasCachedData,
        });

        if (isOfflineError(err) && hasCachedData) {
          setOfflineNotice(message);
        } else {
          setOfflineNotice(null);
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-lg mx-auto mt-8">
        <p className="font-semibold">Error Loading Analytics</p>
        <p className="text-sm">{error || "Could not retrieve metrics"}</p>
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
      {offlineNotice && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {offlineNotice}
        </div>
      )}

      {/* Overview section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Overview</h2>
        <button className="flex items-center gap-1.5 text-sm text-gray-600">
          <span className="text-gray-400">Show</span>
          <span className="font-semibold text-gray-900">This Year</span>
          <ChevronDown size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Metric cards */}
      <div className="flex flex-wrap gap-4">
        <AdminMetricCard
          label="Registered Users"
          value={metrics.registeredUsers}
          icon={UserPlus}
        />
        <AdminMetricCard
          label="Total Transaction"
          value={metrics.totalTransactions}
          icon={ArrowUpDown}
        />
        <AdminMetricCard
          label="Pending KYC"
          value={metrics.pendingKyc}
          icon={Clock}
        />
        <AdminMetricCard
          label="Currency"
          value={metrics.currencies}
          icon={Coins}
        />
      </div>

      {/* Revenue chart + deposits/withdrawals */}
      <div className="flex gap-4 overflow-x-auto">
        <RevenueChart />

        {/* Deposit / Withdrawal summary */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 w-[43%] shrink-0">
          <div className="h-[126px] flex items-center pl-6 border-b border-gray-200">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium leading-none text-gray-500">
                Total Deposits
              </p>
              <p className="text-[32px] font-semibold leading-none text-gray-900">
                {metrics.totalDeposits.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="h-[126px] flex items-center pl-6">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium leading-none text-gray-500">
                Total Withdrawals
              </p>
              <p className="text-[32px] font-semibold leading-none text-gray-900">
                {metrics.totalWithdrawals.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent users table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-left">
                <span className="inline-block h-3 w-3 rounded-full bg-gray-800" />
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 tracking-wide uppercase">
                User Email
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 tracking-wide uppercase">
                Full Name
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 tracking-wide uppercase">
                Phone Number
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 tracking-wide uppercase">
                Added On
              </th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((user) => {
              const fullName =
                user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : null;
              return (
                <tr
                  key={user.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${
                        user.isActive ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  </td>
                  <td className="px-4 py-4 text-gray-900">{user.email}</td>
                  <td className="px-4 py-4 text-gray-400">
                    {fullName ?? "No name"}
                  </td>
                  <td className="px-4 py-4 text-gray-400">
                    {user.phone ?? "No Phone number"}
                  </td>
                  <td className="px-4 py-4 font-semibold text-gray-900">
                    {user.createdAt}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
