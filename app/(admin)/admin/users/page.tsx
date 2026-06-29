/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Loader2, UserX } from 'lucide-react';
import { AdminUser, getAdminUsers } from '@/lib/api/admin';
import { AdminUserTable } from '@/components/admin/AdminUserTable';
import { BulkActionBar } from '@/components/admin/bulk-action-bar';
import { UserDetailPanel } from '@/components/admin/UserDetailPanel';
import { EmptyState } from '@/components/shared/empty-state';

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getAdminUsers({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
      });
      setUsers(res.data);
      setTotalCount(res.total);
      setError(null);
      setSelectedIds([]);
    } catch (err: any) {
      console.error('Failed to load admin users', err);
      setError(err?.message || 'Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.email.toLowerCase().includes(query) ||
      (user.username && user.username.toLowerCase().includes(query))
    );
  }, [users, searchQuery]);

  // Paginate filtered users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endEntry = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSeeAll = () => {
    setCurrentPage(1);
    setSearchQuery('');
  };

  const handleBulkActivate = () => {
    setUsers((prev) =>
      prev.map((u) => (selectedIds.includes(u.id) ? { ...u, isActive: true } : u)),
    );
    setSelectedIds([]);
  };

  const handleBulkDeactivate = () => {
    setUsers((prev) =>
      prev.map((u) => (selectedIds.includes(u.id) ? { ...u, isActive: false } : u)),
    );
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
    setSelectedIds([]);
    setConfirmDelete(false);
  };

  return (
    <div className="space-y-6">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button className="p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">User list</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center">
          <span className="text-white text-sm font-medium">A</span>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">User-list</h1>

        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#FFD552] text-gray-900 px-4 py-2 rounded-full text-sm font-medium">
              All {totalCount}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">FILTER</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search and Filter */}
      <div className="lg:hidden flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>
        <div className="bg-[#FFD552] text-gray-900 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">
          All {totalCount}
        </div>
        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Empty state for search with no results */}
      {!loading && !error && users.length === 0 && searchQuery ? (
        <EmptyState
          icon={<UserX className="h-16 w-16" />}
          title="No users found"
          description="No users match your search. Try a different email or username."
          action={{ label: "Clear search", onClick: () => { setSearchQuery(""); loadUsers(); } }}
        />
      ) : !loading && !error && users.length === 0 && !searchQuery ? (
        <EmptyState
          icon={<UserX className="h-16 w-16" />}
          title="No users yet"
          description="Users will appear here once they sign up."
        />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-600">
          <p className="font-semibold">{error}</p>
          <button 
            onClick={loadUsers} 
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <AdminUserTable 
              users={users} 
              onUserClick={setSelectedUser}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </div>

          {/* Mobile List */}
          <div className="lg:hidden bg-white rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                <span className="text-xs font-medium text-gray-600 uppercase">User Email</span>
              </div>
              <span className="text-xs font-medium text-gray-600 uppercase">Added On</span>
            </div>
            
            {users.length === 0 ? (
              <div className="px-4 py-10 text-center text-gray-500">
                No users found.
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="border-b border-gray-100 px-4 py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <span className="text-sm text-gray-900 truncate">{user.email}</span>
                  </div>
                  <span className="text-sm text-gray-600 ml-4 shrink-0">{user.createdAt}</span>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Showing {startEntry} to {endEntry} of {totalCount} entries
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleSeeAll}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                See All
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || totalCount === 0}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
        onSuccess={loadUsers}
      />

      {/* User Detail Panel */}
      {selectedUser && (
        <UserDetailPanel 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)}
          onSuccess={loadUsers}
        />
      )}
    </div>
  );
}
