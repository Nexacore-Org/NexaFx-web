"use client";

import { Users, UserCheck, DollarSign } from "lucide-react";

interface ReferralStatsProps {
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number;
}

export function ReferralStats({
  totalReferrals,
  activeReferrals,
  totalEarned,
}: ReferralStatsProps) {
  const stats = [
    {
      label: "Total Referrals",
      value: totalReferrals,
      icon: Users,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      label: "Active Referrals",
      value: activeReferrals,
      icon: UserCheck,
      color: "text-green-500 bg-green-500/10",
    },
    {
      label: "Total Earned",
      value: `$${totalEarned.toLocaleString()}`,
      icon: DollarSign,
      color: "text-yellow-500 bg-yellow-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5 flex items-center gap-4"
          >
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${stat.color}`}
            >
              <Icon className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-foreground mt-0.5">
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
