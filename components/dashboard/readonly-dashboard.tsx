"use client";
import React, { useEffect, useState } from 'react';
import { getProfile } from '@/lib/api/users';
import { getTransactions } from '@/lib/api/transactions';
import { AccountOverview } from '@/components/dashboard/account-overview';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';

export default function DashboardView({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<any>(null);
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const p = await getProfile();
        if (!mounted) return;
        setProfile(p);
        const t = await getTransactions({ limit: 20 });
        if (!mounted) return;
        setTxs(t.data);
      } catch (e) {
        // ignore
      }
    }
    load();
    return () => { mounted = false; };
  }, [userId]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Render key dashboard pieces but ensure controls are hidden/disabled */}
      <AccountOverview openDeposit={false} onDepositClick={() => {}} onWithdrawClick={() => {}} readOnly />
      <RecentTransactions readOnly transactions={txs} />
    </div>
  );
}
