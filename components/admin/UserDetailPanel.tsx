'use client';

import { useState } from 'react';
import { AdminUser } from '@/lib/admin-mock-data';
import { X, Eye, EyeOff, Copy, MoreVertical, Trash2 } from 'lucide-react';

interface UserDetailPanelProps {
  user: AdminUser;
  onClose: () => void;
}

export function UserDetailPanel({ user, onClose }: UserDetailPanelProps) {
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(user.walletAddress);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    console.log('User deleted:', user.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Mobile: Bottom sheet | Desktop: Side panel */}
      <div className="fixed inset-x-0 bottom-0 lg:right-0 lg:top-10 lg:inset-x-auto max-h-[85vh] lg:h-[590px] w-full lg:w-[710px] bg-white shadow-2xl z-50 overflow-y-auto rounded-t-3xl lg:rounded-lg lg:mr-4">
        {/* Header */}
        <div className="sticky top-0 bg-white px-4 lg:px-5 py-4 flex items-center justify-center lg:justify-between border-b border-gray-200">
          <h2 className="text-base font-medium text-gray-900">User Details</h2>
          <button onClick={onClose} className="hidden lg:block p-1 hover:bg-gray-100 rounded-full transition-colors absolute right-4">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 lg:p-5 pb-24 lg:pb-5">
          {/* Mobile: Single Column | Desktop: Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr] gap-6">
            {/* Avatar */}
            <div className="flex justify-center lg:block">
              <div className="w-[160px] h-[160px] rounded-lg bg-purple-400 flex items-center justify-center text-4xl font-bold text-white">
                {getInitials()}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-5">
              {/* Personal Info */}
              <div className="bg-white lg:rounded-lg lg:border lg:border-gray-200 lg:p-5">
                <div className="flex items-center gap-2 mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Personal Info</h3>
                  <button onClick={() => setShowSensitiveInfo(!showSensitiveInfo)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                    {showSensitiveInfo ? <Eye className="w-5 h-5 text-gray-400" /> : <EyeOff className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {showSensitiveInfo ? (user.firstName && user.lastName ? `${user.firstName} , ${user.lastName}` : 'No name') : '••••••••'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Email address</p>
                    <p className="text-sm text-gray-900 font-medium">{showSensitiveInfo ? user.email : '••••••••'}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-sm text-gray-900 font-medium">{showSensitiveInfo ? (user.phone || 'No phone number') : '••••••••'}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Wallet address</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-900 font-medium">{showSensitiveInfo ? user.walletAddress : '••••••••'}</p>
                      {showSensitiveInfo && (
                        <button onClick={handleCopyWallet} className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="text-sm text-gray-900 font-medium">{showSensitiveInfo ? user.username : '••••••••'}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 lg:gap-8 pt-6 mt-6 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Transactions</p>
                    <p className="text-xl lg:text-2xl font-semibold text-gray-900">{user.transactions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Total deposit</p>
                    <p className="text-xl lg:text-2xl font-semibold text-gray-900">NGN{user.totalDeposit.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Total withdraw</p>
                    <p className="text-xl lg:text-2xl font-semibold text-gray-900">NGN{user.totalWithdraw.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* KYC */}
              <div className="bg-white lg:rounded-lg lg:border lg:border-gray-200 lg:p-5">
                <h3 className="text-xs font-medium text-gray-400 uppercase mb-3 tracking-wider">KYC Verification</h3>
                <div className="bg-orange-50 rounded-lg px-4 py-3 flex items-center justify-between">
                  <span className="text-base font-medium text-orange-700">{user.kycStatus}</span>
                  <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Delete */}
              <div className="bg-white lg:rounded-lg lg:border lg:border-gray-200 lg:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Delete User</span>
                  <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Account Created */}
              <div className="bg-white lg:rounded-lg lg:border lg:border-gray-200 lg:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Account created</span>
                  <span className="text-sm font-semibold text-gray-900">{user.createdAt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        <div className="lg:hidden fixed bottom-0  right-0 p-4 bg-white border-t border-gray-200">
          <button onClick={onClose} className="w-[186px]  py-3 border-2 border-gray-900 text-gray-900 rounded-full font-medium hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-[70] w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Confirm</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
