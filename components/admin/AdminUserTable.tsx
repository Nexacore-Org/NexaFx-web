'use client';

import { Users } from 'lucide-react';
import { AdminUser } from '@/lib/api/admin';
import { EmptyState } from '@/components/shared/empty-state';

interface AdminUserTableProps {
  users: AdminUser[];
  onUserClick: (user: AdminUser) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function AdminUserTable({ users, onUserClick }: AdminUserTableProps) {
  if (users.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-16 w-16" />}
        title="No users yet"
        description="Users will appear here once they sign up."
      />
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-x-auto w-full max-w-[100vw]">
      <table className="w-full min-w-[900px] text-left">
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
              Full Name
            </th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">
              Phone Number
            </th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">
              Added On
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
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
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
