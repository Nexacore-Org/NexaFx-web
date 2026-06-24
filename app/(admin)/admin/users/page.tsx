'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Filter } from 'lucide-react';
import { AdminUserTable } from '@/components/admin/AdminUserTable';
import { UserDetailPanel } from '@/components/admin/user-detail-panel';
import { getAdminUsers, type AdminUser } from '@/lib/api/admin';

const ITEMS_PER_PAGE = 10;

function AdminUserTableSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden animate-pulse">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/50">
            {['Name', 'Email', 'KYC Status', 'Active Status', 'Transactions', 'Joined'].map((header) => (
              <th key={header} className="py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-5 px-6">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </td>
              <td className="py-5 px-6">
                <div className="h-4 bg-gray-200 rounded w-36"></div>
              </td>
              <td className="py-5 px-6">
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </td>
              <td className="py-5 px-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </td>
              <td className="py-5 px-6">
                <div className="h-4 bg-gray-200 rounded w-10"></div>
              </td>
              <td className="py-5 px-6">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MobileListSkeleton() {
  return (
    <div className="lg:hidden bg-white rounded-lg overflow-hidden animate-pulse">
      <div className="border-b border-gray-200 px-4 py-3 bg-gray-50/50 flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b border-gray-100 px-4 py-4 flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg border border-dashed border-gray-300">
      <svg className="w-12 h-12 text-gray-400 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <h3 className="text-gray-900 font-semibold text-lg mb-1">No users found</h3>
      <p className="text-gray-500 text-sm text-center max-w-sm">
        {query.trim()
          ? `We couldn't find any user matching "${query}". Try refining your search.`
          : "There are currently no users in the system."}
      </p>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedUsers = await getAdminUsers();
      setUsers(fetchedUsers);
    } catch (err: unknown) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startEntry = filteredUsers.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endEntry = Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSeeAll = () => {
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button className="p-2 border-0 bg-transparent cursor-pointer">
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
          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email or username"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm text-gray-950"
            />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Count Badge */}
            <div className="bg-[#FFD552] text-gray-900 px-4 py-2 rounded-full text-sm font-medium">
              All {filteredUsers.length}
            </div>

            {/* Filter Button */}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white cursor-pointer">
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
            placeholder="Search by email or username"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm text-gray-950"
          />
        </div>
        <div className="bg-[#FFD552] text-gray-900 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">
          All {filteredUsers.length}
        </div>
        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white cursor-pointer">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Error UI */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-lg max-w-lg mx-auto mt-8 flex flex-col items-center gap-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <p className="font-semibold text-lg text-red-800">Error Loading Users</p>
          <p className="text-sm text-red-600 text-center max-w-xs">{error}</p>
          <button 
            onClick={fetchUsers} 
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm cursor-pointer border-0"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main Content Area (renders if no error) */}
      {!error && (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            {loading ? (
              <AdminUserTableSkeleton />
            ) : filteredUsers.length === 0 ? (
              <EmptyState query={searchQuery} />
            ) : (
              <AdminUserTable 
                users={paginatedUsers} 
                onUserClick={(id) => setSelectedUserId(id)}
              />
            )}
          </div>

          {/* Mobile List */}
          <div className="lg:hidden">
            {loading ? (
              <MobileListSkeleton />
            ) : filteredUsers.length === 0 ? (
              <EmptyState query={searchQuery} />
            ) : (
              <div className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    <span className="text-xs font-semibold text-gray-500 uppercase">User Email</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Added On</span>
                </div>
                
                {paginatedUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className="border-b border-gray-100 px-4 py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span className="text-sm font-medium text-gray-900 truncate">{user.email}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600 ml-4 shrink-0">{user.createdAt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && !loading && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500 font-medium">
                Showing {startEntry} to {endEntry} of {filteredUsers.length} entries
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSeeAll}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  See All
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Detail Panel */}
      {selectedUserId && (
        <UserDetailPanel 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}
