'use client';

import { useState } from 'react';
import { Users, ArrowUpDown } from 'lucide-react';
import { AdminUser } from '@/lib/api/admin';
import { EmptyState } from '@/components/shared/empty-state';
import { Checkbox } from '@/components/ui/checkbox';
import { TrustScoreBadge } from '@/components/admin/trust-score-badge';
import { calculateTrustScore } from '@/lib/utils/trust-score';

type SortField = 'email' | 'name' | 'phone' | 'createdAt' | 'trustScore';
type SortDirection = 'asc' | 'desc';

interface AdminUserTableProps {
  users: AdminUser[];
  onUserClick: (user: AdminUser) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  maxItems?: number;
}

// Parent pages paginate server-side (typically 10 items/page).
// maxItems is a safety net to cap rendering in case of stale/incorrect API response.
export function AdminUserTable({ users, onUserClick, selectedIds = [], onSelectionChange, maxItems = 50 }: AdminUserTableProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  if (users.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-16 w-16" />}
        title="No users yet"
        description="Users will appear here once they sign up."
      />
    );
  }

  const allSelected = cappedUsers.length > 0 && selectedIds.length === cappedUsers.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(cappedUsers.map(u => u.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(sid => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleRowClick = (user: AdminUser) => {
    onUserClick(user);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const cappedUsers = users.slice(0, maxItems);

  const sortedUsers = [...cappedUsers].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';

    switch (sortField) {
      case 'email':
        aVal = a.email.toLowerCase();
        bVal = b.email.toLowerCase();
        break;
      case 'name':
        aVal = `${a.firstName ?? ''} ${a.lastName ?? ''}`.toLowerCase();
        bVal = `${b.firstName ?? ''} ${b.lastName ?? ''}`.toLowerCase();
        break;
      case 'phone':
        aVal = a.phone ?? '';
        bVal = b.phone ?? '';
        break;
      case 'createdAt':
        aVal = a.createdAt;
        bVal = b.createdAt;
        break;
      case 'trustScore':
        aVal = calculateTrustScore(a).total;
        bVal = calculateTrustScore(b).total;
        break;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
    return sortDirection === 'asc' 
      ? <ArrowUpDown className="w-3.5 h-3.5 text-gray-900 rotate-180" /> 
      : <ArrowUpDown className="w-3.5 h-3.5 text-gray-900" />;
  };

  return (
    <div className="bg-white rounded-lg overflow-x-auto w-full max-w-[100vw]">
      <table className="w-full min-w-[1000px] text-left">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-4 px-4 w-10">
              <Checkbox
                checked={allSelected || (someSelected ? "indeterminate" : false)}
                onCheckedChange={handleSelectAll}
                aria-label={allSelected ? "Deselect all" : "Select all"}
              />
            </th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                User Email
              </div>
            </th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">
              <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-gray-900">
                Full Name
                <SortIcon field="name" />
              </button>
            </th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">
              <button onClick={() => handleSort('phone')} className="flex items-center gap-1 hover:text-gray-900">
                Phone Number
                <SortIcon field="phone" />
              </button>
            </th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">
              <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:text-gray-900">
                Added On
                <SortIcon field="createdAt" />
              </button>
            </th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">
              <button onClick={() => handleSort('trustScore')} className="flex items-center gap-1 hover:text-gray-900">
                Trust Score
                <SortIcon field="trustScore" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => {
            const trustScore = calculateTrustScore(user);
            return (
              <tr
                key={user.id}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(user.id)}
                    onCheckedChange={() => handleSelectOne(user.id)}
                    aria-label={`Select ${user.email}`}
                  />
                </td>
                <td className="py-4 px-6" onClick={() => handleRowClick(user)}>
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <span className="text-sm text-gray-900">{user.email}</span>
                  </div>
                </td>
                <td className="py-4 px-6" onClick={() => handleRowClick(user)}>
                  <span className={`text-sm ${user.firstName && user.lastName ? 'text-gray-900' : 'text-gray-400'}`}>
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'No name'}
                  </span>
                </td>
                <td className="py-4 px-6" onClick={() => handleRowClick(user)}>
                  <span className={`text-sm ${user.phone ? 'text-gray-900' : 'text-gray-400'}`}>
                    {user.phone || 'No Phone number'}
                  </span>
                </td>
                <td className="py-4 px-6" onClick={() => handleRowClick(user)}>
                  <span className="text-sm font-semibold text-gray-900">{user.createdAt}</span>
                </td>
                <td className="py-4 px-6" onClick={() => handleRowClick(user)}>
                  <TrustScoreBadge score={trustScore.total} breakdown={trustScore} size="sm" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
