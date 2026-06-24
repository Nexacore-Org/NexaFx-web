'use client';

import { type AdminUser } from '@/lib/api/admin';
import { cn } from '@/lib/utils';

interface AdminUserTableProps {
  users: AdminUser[];
  onUserClick: (userId: string) => void;
}

export function AdminUserTable({ users, onUserClick }: AdminUserTableProps) {
  const getFullName = (user: AdminUser) => {
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'N/A';
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-black"></span>
                Name
              </div>
            </th>
            <th className="py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">
              Email
            </th>
            <th className="py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">
              KYC Status
            </th>
            <th className="py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">
              Active Status
            </th>
            <th className="py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">
              Transactions
            </th>
            <th className="py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">
              Joined
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              onClick={() => onUserClick(user.id)}
              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="py-4 px-6">
                <span className="text-sm font-semibold text-gray-900">
                  {getFullName(user)}
                </span>
              </td>
              <td className="py-4 px-6">
                <span className="text-sm text-gray-900">{user.email}</span>
              </td>
              <td className="py-4 px-6">
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                    user.kycStatus === 'Verified'
                      ? "bg-green-500/10 text-green-600"
                      : "bg-amber-500/10 text-amber-600"
                  )}
                >
                  {user.kycStatus}
                </span>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      user.isActive ? "bg-green-500" : "bg-gray-400"
                    )}
                  ></span>
                  <span className="text-sm text-gray-900">
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </td>
              <td className="py-4 px-6">
                <span className="text-sm text-gray-900">{user.transactions}</span>
              </td>
              <td className="py-4 px-6">
                <span className="text-sm text-gray-600">{user.createdAt}</span>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-500 font-medium">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
