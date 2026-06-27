'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AddIpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { ipAddress: string; label: string }) => Promise<void>;
}

export function AddIpModal({ isOpen, onClose, onSubmit }: AddIpModalProps) {
  const [ipAddress, setIpAddress] = useState('');
  const [label, setLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ipAddress.trim()) {
      setError('IP address is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ ipAddress: ipAddress.trim(), label: label.trim() });
      setIpAddress('');
      setLabel('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add IP address');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Add IP Address</h3>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IP Address / CIDR
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="e.g. 192.168.1.1 or 10.0.0.0/24"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label / Description
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Office VPN"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-lg bg-[#F0BB16] hover:bg-yellow-500 text-black text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add IP'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
