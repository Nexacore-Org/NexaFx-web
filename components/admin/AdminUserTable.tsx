'use client';

import { AdminUser } from '@/lib/admin-mock-data';

interface AdminUserTableProps {
  users: AdminUser[];
  onUserClick: (user: AdminUser) => void;
}

export function AdminUserTable({ users, onUserClick }: AdminUserTableProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
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
              onClick={() => onUserClick(user)}
              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span className="text-sm text-gray-900">{user.email}</span>
                </div>
              </td>
              <td className="py-4 px-6">
                <span className={`text-sm ${user.firstName && user.lastName ? 'text-gray-900' : 'text-gray-400'}`}>
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'No name'}
                </span>
              </td>
              <td className="py-4 px-6">
                <span className={`text-sm ${user.phone ? 'text-gray-900' : 'text-gray-400'}`}>
                  {user.phone || 'No Phone number'}
                </span>
              </td>
              <td className="py-4 px-6">
                <span className="text-sm font-semibold text-gray-900">{user.createdAt}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
