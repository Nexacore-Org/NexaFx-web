'use client';

import React, { useState, useEffect } from 'react';
import { getAuditLog, AuditLogEntry, AuditAction } from '@/lib/api/admin';
import { exportAuditLogToCSV } from '@/lib/utils/csv-export';
import { ChevronDown, ChevronUp, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const AUDIT_ACTIONS: AuditAction[] = [
  'user.deactivated',
  'user.reactivated',
  'user.role_changed',
  'user.email_sent',
  'kyc.approved',
  'kyc.rejected',
  'transaction.flagged',
  'transaction.unflagged',
  'dispute.resolved',
  'fee.updated',
  'announcement.created',
  'maintenance.enabled',
  'maintenance.disabled',
  'ip_allowlist.added',
  'ip_allowlist.removed'
];

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [emailFilter, setEmailFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Expansion state
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAuditLog({
        action: actionFilter,
        actorEmail: emailFilter,
        from: dateFrom,
        to: dateTo,
        page,
        limit,
      });
      setLogs(res.data);
      setTotal(res.total);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, page]); // Only re-fetch on action or page change (or we could add a submit button for text inputs)

  const handleApplyFilters = () => {
    setPage(1);
    fetchLogs();
  };

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedRows(newSet);
  };

  const handleExportCsv = async () => {
    try {
      // Fetch all logs matching current filters without pagination to export
      // Wait, getAuditLog might not support fetching all if limit isn't huge.
      // We'll pass a large limit to grab them or just export what we have.
      const res = await getAuditLog({
        action: actionFilter,
        actorEmail: emailFilter,
        from: dateFrom,
        to: dateTo,
        limit: 10000, 
      });
      exportAuditLogToCSV(res.data);
    } catch (err) {
      console.error("Failed to export logs", err);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-500 text-sm mt-1">Review all administrative actions taken on the platform.</p>
        </div>
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-gray-500">Action Type</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD552]"
          >
            <option value="all">All Actions</option>
            {AUDIT_ACTIONS.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-gray-500">Admin Email</label>
          <input
            type="email"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            placeholder="Search by email..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD552]"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-gray-500">From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD552]"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-gray-500">To Date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD552]"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleApplyFilters}
            className="px-6 py-2 bg-[#FFD552] text-black font-medium rounded-lg hover:bg-[#F39A00] transition-colors text-sm w-full md:w-auto"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Admin Email</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Target</th>
                <th className="px-6 py-4 font-medium">IP Address</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading audit logs...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No audit logs found matching your filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedRows.has(log.id);
                  return (
                    <React.Fragment key={log.id}>
                      <tr 
                        className={cn(
                          "hover:bg-gray-50 transition-colors cursor-pointer",
                          isExpanded && "bg-gray-50"
                        )}
                        onClick={() => toggleRow(log.id)}
                      >
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {log.actorEmail}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {log.targetLabel || log.targetId || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-mono text-xs">
                          {log.ipAddress}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                            aria-label="Toggle details"
                          >
                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                              <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider font-semibold">Metadata</p>
                              {log.metadata ? (
                                <pre className="text-gray-300 text-xs font-mono m-0">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              ) : (
                                <p className="text-gray-500 text-sm italic">No metadata available for this action.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, total)}</span> of <span className="font-medium">{total}</span> results
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
