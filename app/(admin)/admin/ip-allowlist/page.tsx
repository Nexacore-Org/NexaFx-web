'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Shield, Plus, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { IpAllowlistTable } from '@/components/admin/IpAllowlistTable';
import { AddIpModal } from '@/components/admin/AddIpModal';
import {
  getIpAllowlist,
  addIpToAllowlist,
  removeIpFromAllowlist,
  toggleIpRestriction,
  type IpAllowlistEntry,
} from '@/lib/api/admin';

export default function IpAllowlistPage() {
  const [entries, setEntries] = useState<IpAllowlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [ipRestrictionEnabled, setIpRestrictionEnabled] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getIpAllowlist();
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load IP allowlist');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleAddIp = async (data: { ipAddress: string; label: string }) => {
    await addIpToAllowlist(data);
    await loadEntries();
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await toggleIpRestriction(id, isActive);
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isActive } : e)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle IP');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeIpFromAllowlist(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove IP');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">IP Allowlist</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage IP addresses allowed to access the admin panel
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#F0BB16] hover:bg-yellow-500 text-black rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="size-4" />
          Add IP
        </button>
      </div>

      <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
        <Shield className="size-5 text-gray-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Enable IP Restriction</p>
          <p className="text-xs text-gray-500">
            When enabled, only allowlisted IPs can access the admin panel
          </p>
        </div>
        <Switch
          checked={ipRestrictionEnabled}
          onCheckedChange={setIpRestrictionEnabled}
          size="lg"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
          <Shield className="size-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No IPs configured</h3>
          <p className="text-sm text-gray-500 mb-6">
            Add IP addresses to restrict admin panel access
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F0BB16] hover:bg-yellow-500 text-black rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="size-4" />
            Add IP Address
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <IpAllowlistTable
            entries={entries}
            onToggle={handleToggle}
            onDelete={(id) => setDeleteConfirmId(id)}
          />
        </div>
      )}

      <AddIpModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddIp}
      />

      {deleteConfirmId && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setDeleteConfirmId(null)} />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Remove IP Address</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to remove this IP address from the allowlist?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
