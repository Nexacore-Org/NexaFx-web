/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Flag, ShieldCheck, AlertTriangle, ChevronUp, ChevronDown, Search, Send } from 'lucide-react';
import { getFlaggedTransactions, whitelistTransaction, type FlaggedTransaction } from '@/lib/api/admin';

export default function FlaggedTransactionsPage() {
  const [transactions, setTransactions] = useState<FlaggedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [whitelistDialog, setWhitelistDialog] = useState<{ id: string; username: string } | null>(null);
  const [whitelistNotes, setWhitelistNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadFlagged = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFlaggedTransactions();
      setTransactions(data);
    } catch (err: any) {
      console.error('Failed to load flagged transactions', err);
      setError(err?.message || 'Failed to load flagged transactions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlagged();
  }, [loadFlagged]);

  const handleWhitelist = async () => {
    if (!whitelistDialog || !whitelistNotes.trim()) return;
    setSubmitting(true);
    try {
      await whitelistTransaction(whitelistDialog.id, whitelistNotes);
      setTransactions(prev => prev.filter(tx => tx.id !== whitelistDialog.id));
      setWhitelistDialog(null);
      setWhitelistNotes('');
      setActionFeedback({ type: 'success', message: `Transaction whitelisted successfully.` });
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      console.error('Failed to whitelist transaction', err);
      setActionFeedback({ type: 'error', message: err?.message || 'Failed to whitelist transaction.' });
      setTimeout(() => setActionFeedback(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEscalate = async (tx: FlaggedTransaction) => {
    // No escalate endpoint exists yet — mark as still needing attention
    setActionFeedback({
      type: 'success',
      message: `Transaction ${tx.txId || tx.id} remains flagged for senior review.`,
    });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const filtered = transactions.filter(tx => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.username.toLowerCase().includes(q) ||
      tx.email.toLowerCase().includes(q) ||
      tx.txId.toLowerCase().includes(q) ||
      tx.id.toLowerCase().includes(q) ||
      tx.flagReason.toLowerCase().includes(q)
    );
  });

  // ─── Loading state ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        <p className="mt-4 text-sm text-gray-500">Loading flagged transactions...</p>
      </div>
    );
  }

  // ─── Error state ─────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-600 max-w-lg mx-auto mt-8">
        <AlertTriangle className="h-10 w-10 mx-auto mb-3" />
        <p className="font-semibold">{error}</p>
        <button
          onClick={loadFlagged}
          className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Flagged Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review, whitelist, or escalate transactions flagged by the system or admins.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by user, email, or reason..."
              className="w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
            />
          </div>
          <button
            onClick={loadFlagged}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Feedback toast */}
      {actionFeedback && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all animate-in slide-in-from-top-2 ${
            actionFeedback.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {actionFeedback.message}
        </div>
      )}

      {/* Whitelist confirmation dialog */}
      {whitelistDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Whitelist Transaction</h3>
                <p className="text-sm text-gray-500">
                  Mark <span className="font-medium text-gray-700">{whitelistDialog.username}</span>'s transaction as trusted.
                  It will be removed from the flagged queue.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="whitelist-notes" className="block text-sm font-medium text-gray-700 mb-1.5">
                Review notes <span className="text-red-500">*</span>
              </label>
              <textarea
                id="whitelist-notes"
                value={whitelistNotes}
                onChange={e => setWhitelistNotes(e.target.value)}
                placeholder="Explain why this transaction is being whitelisted..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all resize-none"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => {
                  setWhitelistDialog(null);
                  setWhitelistNotes('');
                }}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWhitelist}
                disabled={!whitelistNotes.trim() || submitting}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                Confirm Whitelist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && !loading && (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">All Clear</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No flagged transactions match your search.'
              : 'No flagged transactions awaiting review. Everything looks good!'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Flagged transactions list */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(tx => (
            <div
              key={tx.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all hover:shadow-sm"
            >
              {/* Summary row */}
              <div className="flex items-center gap-4 px-6 py-4">
                {/* Flag indicator */}
                <div className="shrink-0">
                  <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                    <Flag className="w-4 h-4 text-red-500" />
                  </div>
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">User</p>
                    <p className="font-medium text-gray-900 truncate">{tx.username}</p>
                    <p className="text-xs text-gray-400 truncate">{tx.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Transaction</p>
                    <p className="font-medium text-gray-900">
                      {tx.currency} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-400">{tx.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Flag Reason</p>
                    <p className="text-gray-700 truncate">{tx.flagReason}</p>
                    <p className="text-xs text-gray-400">
                      by {tx.flaggedBy} &middot; {tx.flaggedAt ? new Date(tx.flaggedAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">TX ID</p>
                    <p className="text-xs text-gray-600 font-mono truncate">{tx.txId || tx.id}</p>
                    <p className="text-xs text-gray-400">{tx.date ? new Date(tx.date).toLocaleDateString() : ''}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setWhitelistDialog({ id: tx.id, username: tx.username })}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    title="Mark as trusted and remove from queue"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span className="hidden sm:inline">Whitelist</span>
                  </button>
                  <button
                    onClick={() => handleEscalate(tx)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                    title="Flag for senior admin review"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span className="hidden sm:inline">Escalate</span>
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {expandedId === tx.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {expandedId === tx.id && (
                <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Transaction ID</span>
                      <p className="text-gray-800 font-mono text-xs mt-0.5">{tx.id}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Flagged By</span>
                      <p className="text-gray-800 mt-0.5">{tx.flaggedBy}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Flagged At</span>
                      <p className="text-gray-800 mt-0.5">
                        {tx.flaggedAt ? new Date(tx.flaggedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <span className="text-xs font-medium text-gray-500">Flag Reason</span>
                      <p className="text-gray-800 mt-0.5 bg-white rounded-lg p-3 border border-gray-200">
                        {tx.flagReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary footer */}
      {filtered.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Showing {filtered.length} of {transactions.length} flagged transaction{transactions.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
