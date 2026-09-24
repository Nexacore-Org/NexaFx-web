import React from 'react';
import { notFound } from 'next/navigation';
import { UserDetailPanel } from '@/components/admin/UserDetailPanel';
import { getAdminUserById } from '@/lib/api/admin';
import DashboardView from '@/components/dashboard/readonly-dashboard';

export default async function ViewAsPage({ params }: { params: { id: string } }) {
  const userId = params.id;
  // Attempt to fetch admin user; if missing, show notFound
  let adminUser;
  try {
    adminUser = await getAdminUserById(userId);
  } catch (e) {
    return notFound();
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h2 className="text-lg font-semibold mb-4">View as user — read-only</h2>
      <p className="text-sm text-gray-500 mb-6">This view is read-only. Actions are disabled and this session is audited.</p>
      <DashboardView userId={userId} />
    </div>
  );
}
