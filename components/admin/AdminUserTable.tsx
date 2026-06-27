'use client';

import { AdminUser } from '@/lib/api/admin';

interface AdminUserTableProps {
  users: AdminUser[];
  onUserClick: (user: AdminUser) => void;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
}

export function AdminUserTable({ users, onUserClick, selectedIds, onSelectedIdsChange }: AdminUserTableProps) {
  const allSelected = users.length > 0 && selectedIds.length === users.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectedIdsChange([]);
    } else {
      onSelectedIdsChange(users.map((u) => u.id));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      onSelectedIdsChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectedIdsChange([...selectedIds, id]);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-x-auto w-full max-w-[100vw]">
      <table className="w-full min-w-[800px] text-left">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-4 px-4 w-12">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400 cursor-pointer"
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
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-10 text-center text-gray-500">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                onClick={() => onUserClick(user)}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(user.id)}
                    onChange={() => {}}
                    onClick={(e) => toggleSelect(user.id, e)}
                    className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400 cursor-pointer"
                  />
                </td>
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
