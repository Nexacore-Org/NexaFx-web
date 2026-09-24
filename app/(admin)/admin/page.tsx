"use client";

import Link from "next/link";
import {
  UserPlus,
  ArrowUpDown,
  Clock,
  Coins,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function AdminOverviewPage() {
  // Placeholder metrics as requested
  const metrics = [
    { label: "Registered Users", value: "1,524", icon: UserPlus, color: "bg-blue-50 text-blue-600" },
    { label: "Total Transactions", value: "15,000", icon: ArrowUpDown, color: "bg-green-50 text-green-600" },
    { label: "Pending KYC", value: "25", icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Currencies Active", value: "8", icon: Coins, color: "bg-purple-50 text-purple-600" },
  ];

  const quickLinks = [
    { name: "Analytics Dashboard", href: "/admin/analytics", desc: "View system revenue charts and transaction growth statistics." },
    { name: "User Management", href: "/admin/users", desc: "Manage registered users, review profiles, and approve KYC status." },
    { name: "Transaction History", href: "/admin/transactions", desc: "Inspect depositories, withdrawal records, and conversion logs." },
    { name: "Push Notifications", href: "/admin/push-notifications", desc: "Schedule and dispatch push notification alerts to clients." },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-md space-y-2">
          <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            Control Center
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back to Admin Portal
          </h1>
          <p className="text-sm text-gray-300">
            Monitor, manage, and scale the NexaFX financial infrastructure from a single dashboard.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <TrendingUp className="w-48 h-48" />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md"
            >
              <div className={`p-3 rounded-xl ${metric.color} shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {metric.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Navigation Section */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900">
          Quick Administration Links
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="group bg-white p-5 rounded-2xl border border-gray-200 hover:border-yellow-400 shadow-sm flex flex-col justify-between transition-all hover:-translate-y-0.5"
            >
              <div className="space-y-1.5">
                <h4 className="font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">
                  {link.name}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {link.desc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-yellow-600 mt-4">
                Access Panel
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
