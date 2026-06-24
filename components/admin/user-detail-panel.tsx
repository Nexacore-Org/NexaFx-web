'use client';

import React, { useEffect, useState } from 'react';
import { type AdminUser, getAdminUser } from '@/lib/api/admin';
import { X, Copy, Mail, Phone, User, Shield, Calendar, Landmark, Hash, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserDetailPanelProps {
  userId: string;
  onClose: () => void;
}

export function UserDetailPanel({ userId, onClose }: UserDetailPanelProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminUser(userId);
      setUser(data);
    } catch (err: unknown) {
      console.error('Error fetching user details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [userId]);

  const handleCopy = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getInitials = (u: AdminUser) => {
    const first = u.firstName ? u.firstName[0] : '';
    const last = u.lastName ? u.lastName[0] : '';
    const initials = (first + last).toUpperCase();
    return initials || u.email[0].toUpperCase();
  };

  const getFullName = (u: AdminUser) => {
    const parts = [u.firstName, u.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'N/A';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal/Drawer Content */}
      <div
        className={cn(
          "relative z-50 w-full bg-white shadow-lg flex flex-col",
          "md:fixed md:top-4 md:right-4 md:bottom-4 md:w-[480px] md:rounded-xl",
          "rounded-t-3xl h-[85vh] md:h-[calc(100vh-2rem)]",
          "animate-in slide-in-from-bottom duration-300 md:slide-in-from-right md:duration-300"
        )}
      >
        {/* Header */}
        <div className="flex-none flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors ml-auto text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
              <span className="text-sm text-gray-500 font-medium">Fetching details...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <span className="text-red-500 font-medium">Error loading user details</span>
              <p className="text-sm text-gray-600 max-w-xs">{error}</p>
              <button
                onClick={fetchDetails}
                className="px-4 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg text-xs hover:bg-yellow-500 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : user ? (
            <>
              {/* Hero Profile Info */}
              <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow-sm">
                  {getInitials(user)}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900">{getFullName(user)}</h3>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>

                <div className="flex gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold",
                      user.isActive
                        ? "bg-green-500/10 text-green-600"
                        : "bg-gray-500/10 text-gray-600"
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", user.isActive ? "bg-green-500" : "bg-gray-400")} />
                    {user.isActive ? "Active" : "Inactive"}
                  </span>

                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold",
                      user.kycStatus === 'Verified'
                        ? "bg-green-500/10 text-green-600"
                        : "bg-amber-500/10 text-amber-600"
                    )}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {user.kycStatus}
                  </span>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Personal Information</h4>
                <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3.5 shadow-sm">
                  <DetailRow icon={<User className="w-4 h-4 text-gray-400" />} label="First Name" value={user.firstName} />
                  <DetailRow icon={<User className="w-4 h-4 text-gray-400" />} label="Last Name" value={user.lastName} />
                  <DetailRow icon={<Mail className="w-4 h-4 text-gray-400" />} label="Email Address" value={user.email} />
                  <DetailRow icon={<Phone className="w-4 h-4 text-gray-400" />} label="Phone Number" value={user.phone} />
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Financial Overview</h4>
                <div className="grid grid-cols-3 gap-3">
                  <MetricCard label="Transactions" value={user.transactions} />
                  <MetricCard label="Total Deposit" value={`NGN ${user.totalDeposit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                  <MetricCard label="Total Withdraw" value={`NGN ${user.totalWithdraw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                </div>
              </div>

              {/* System & Wallet */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Security & Wallet</h4>
                <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3.5 shadow-sm">
                  <div className="flex justify-between items-start py-1">
                    <span className="text-sm text-gray-500 font-medium flex items-center gap-2 bg-transparent">
                      <Landmark className="w-4 h-4 text-gray-400" />
                      Wallet Address:
                    </span>
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-sm font-semibold text-gray-900 break-all max-w-[200px]">
                        {user.walletAddress || 'N/A'}
                      </span>
                      {user.walletAddress && (
                        <button
                          onClick={() => handleCopy(user.walletAddress, 'wallet')}
                          className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer"
                        >
                          {copiedField === 'wallet' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-start py-1">
                    <span className="text-sm text-gray-500 font-medium flex items-center gap-2 bg-transparent">
                      <Hash className="w-4 h-4 text-gray-400" />
                      User ID:
                    </span>
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-sm font-semibold text-gray-900 break-all max-w-[200px]">
                        {user.id}
                      </span>
                      <button
                        onClick={() => handleCopy(user.id, 'id')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer"
                      >
                        {copiedField === 'id' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-500 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Account Created:
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {user.createdAt}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex-none p-6 border-t border-gray-100 bg-gray-50 md:rounded-b-xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-center border-0 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-500 font-medium flex items-center gap-2">
        {icon}
        {label}:
      </span>
      <span className={cn("text-sm font-semibold", value ? "text-gray-900" : "text-gray-400")}>
        {value || 'N/A'}
      </span>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100/50 flex flex-col justify-center">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 text-center">{label}</span>
      <span className="text-sm font-bold text-gray-900 text-center truncate">{value}</span>
    </div>
  );
}
