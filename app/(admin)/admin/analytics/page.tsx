"use client";

import { ChevronDown } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { mockAdminMetrics, mockAdminUsers } from "@/lib/admin-mock-data";

const recentUsers = mockAdminUsers.slice(0, 5);

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
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
                    value={mockAdminMetrics.registeredUsers}
                    iconSrc="/icons/register.svg.svg"
                />
                <AdminMetricCard
                    label="Total Transaction"
                    value={mockAdminMetrics.totalTransactions}
                    iconSrc="/icons/total.svg.svg"
                />
                <AdminMetricCard
                    label="Pending KYC"
                    value={mockAdminMetrics.pendingKyc}
                    iconSrc="/icons/pending.svg.svg"
                />
                <AdminMetricCard
                    label="Currency"
                    value={mockAdminMetrics.currencies}
                    iconSrc="/icons/currency.svg.svg"
                />
            </div>

            {/* Revenue chart + deposits/withdrawals */}
            <div className="flex gap-4 overflow-x-auto">
                <RevenueChart />

                {/* Deposit / Withdrawal summary */}
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 w-[43%] shrink-0">
                    <div className="h-[126px] flex items-center pl-6 border-b border-gray-200">
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-medium leading-none text-gray-500">Total Deposits</p>
                            <p className="text-[32px] font-semibold leading-none text-gray-900">{mockAdminMetrics.totalDeposits.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="h-[126px] flex items-center pl-6">
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-medium leading-none text-gray-500">Total Withdrawals</p>
                            <p className="text-[32px] font-semibold leading-none text-gray-900">{mockAdminMetrics.totalWithdrawals.toLocaleString()}</p>
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
