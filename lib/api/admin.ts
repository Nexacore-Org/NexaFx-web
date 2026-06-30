/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '../api-client';

export interface AdminUser {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    walletAddress: string;
    username: string;
    avatarUrl: string | null;
    transactions: number;
    totalDeposit: number;
    totalWithdraw: number;
    kycStatus: 'Verified' | 'Unverified';
    createdAt: string;
    isActive: boolean;
}

export interface AdminMetrics {
    registeredUsers: number;
    totalTransactions: number;
    pendingKyc: number;
    currencies: number;
    totalDeposits: number;
    totalWithdrawals: number;
}

export interface AdminTransaction {
    id: string;
    amount: number;
    currency: string;
    type: string;
    username: string;
    date: string;
    txId: string;
    status: string;
    toAmount?: number;
    toCurrency?: string;
}

export interface AdminUsersQuery {
    page?: number;
    limit?: number;
    search?: string;
}

export interface AdminTransactionsQuery {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
}

export function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    return token ? { 'x-client-token': token } : {};
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
    const response = await apiClient<any>('/admin/metrics', {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return {
        registeredUsers: response?.registeredUsers ?? response?.totalUsers ?? 0,
        totalTransactions: response?.totalTransactions ?? 0,
        pendingKyc: response?.pendingKyc ?? 0,
        currencies: response?.currencies ?? 0,
        totalDeposits: response?.totalDeposits ?? response?.totalVolume ?? 0,
        totalWithdrawals: response?.totalWithdrawals ?? 0,
    };
}

export async function getAdminUsers(query: AdminUsersQuery = {}): Promise<{ data: AdminUser[]; total: number }> {
    const params: Record<string, string> = {};
    if (query.page) params.page = String(query.page);
    if (query.limit) params.limit = String(query.limit);
    if (query.search) params.search = query.search;

    const response = await apiClient<any>('/admin/users', {
        method: 'GET',
        headers: getAuthHeaders(),
        params,
    });

    const data = (response?.data ?? response?.users ?? response?.items ?? (Array.isArray(response) ? response : [])) as any[];
    const total = response?.total ?? response?.count ?? data.length;

    const mappedData = data.map((user: any) => ({
        id: user.id ?? user._id ?? '',
        email: user.email ?? '',
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        phone: user.phone ?? null,
        walletAddress: user.walletAddress ?? user.wallet_address ?? '',
        username: user.username ?? user.email?.split('@')[0] ?? '',
        avatarUrl: user.avatarUrl ?? null,
        transactions: Number(user.transactions) || 0,
        totalDeposit: Number(user.totalDeposit ?? user.total_deposit) || 0,
        totalWithdraw: Number(user.totalWithdraw ?? user.total_withdraw) || 0,
        kycStatus: ((user.kycStatus === 'Verified' || user.kycStatus === 'verified') ? 'Verified' : 'Unverified') as 'Verified' | 'Unverified',
        createdAt: user.createdAt
            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
              })
            : '',
        isActive: user.isActive ?? true,
    }));

    return { data: mappedData, total };
}

export async function getAdminUserById(id: string): Promise<AdminUser> {
    const response = await apiClient<any>(`/admin/users/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    const user = response?.data ?? response;
    return {
        id: user.id ?? user._id ?? '',
        email: user.email ?? '',
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        phone: user.phone ?? null,
        walletAddress: user.walletAddress ?? user.wallet_address ?? '',
        username: user.username ?? user.email?.split('@')[0] ?? '',
        avatarUrl: user.avatarUrl ?? null,
        transactions: Number(user.transactions) || 0,
        totalDeposit: Number(user.totalDeposit ?? user.total_deposit) || 0,
        totalWithdraw: Number(user.totalWithdraw ?? user.total_withdraw) || 0,
        kycStatus: ((user.kycStatus === 'Verified' || user.kycStatus === 'verified') ? 'Verified' : 'Unverified') as 'Verified' | 'Unverified',
        createdAt: user.createdAt
            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
              })
            : '',
        isActive: user.isActive ?? true,
    };
}

export async function deleteAdminUser(id: string): Promise<void> {
    await apiClient<void>(`/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
}

export interface KycSubmission {
  id: string;
  userName: string;
  email: string;
  documentType: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
  reviewedAt?: string;
}

export async function getAdminKycSubmissions(): Promise<KycSubmission[]> {
  const response = await apiClient<any>('/admin/kyc', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = response?.data ?? response?.submissions ?? response ?? [];
  return (Array.isArray(data) ? data : []).map((item: any) => ({
    id: item.id ?? item._id ?? '',
    userName: item.userName ?? item.username ?? item.user?.name ?? '',
    email: item.email ?? item.user?.email ?? '',
    documentType: item.documentType ?? item.document_type ?? 'Unknown',
    status: item.status ?? 'Pending',
    submittedAt: item.submittedAt ?? item.createdAt ?? new Date().toISOString(),
    reviewedAt: item.reviewedAt ?? undefined,
  }));
}

export async function updateKycStatus(id: string, status: 'Approved' | 'Rejected'): Promise<void> {
  await apiClient<void>(`/admin/kyc/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
}

export async function updateUserKyc(id: string, status: 'Verified' | 'Unverified'): Promise<void> {
    await apiClient<void>(`/admin/users/${id}/kyc`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
}

export const flagTransaction = (id: string, reason: string): Promise<void> =>
  apiClient(`/admin/transactions/${id}/flag`, { method: 'POST', body: JSON.stringify({ reason }), headers: getAuthHeaders() });

export const unflagTransaction = (id: string): Promise<void> =>
  apiClient(`/admin/transactions/${id}/unflag`, { method: 'POST', headers: getAuthHeaders() });

export interface Dispute {
  id: string
  userId: string
  userEmail: string
  transactionId: string
  description: string
  status: 'Open' | 'Under Review' | 'Resolved'
  notes: DisputeNote[]
  createdAt: string
  resolvedAt?: string
}

export interface DisputeNote {
  id: string
  adminEmail: string
  content: string
  createdAt: string
}

export const getDisputes = (): Promise<Dispute[]> =>
  apiClient('/admin/disputes', { headers: getAuthHeaders() });

export const resolveDispute = (id: string, resolution: string): Promise<void> =>
  apiClient(`/admin/disputes/${id}/resolve`, { method: 'POST', body: JSON.stringify({ resolution }), headers: getAuthHeaders() });

export const addDisputeNote = (id: string, content: string): Promise<DisputeNote> =>
  apiClient(`/admin/disputes/${id}/notes`, { method: 'POST', body: JSON.stringify({ content }), headers: getAuthHeaders() });

export async function getAdminTransactions(query: AdminTransactionsQuery = {}): Promise<{ data: AdminTransaction[]; total: number }> {
    const params: Record<string, string> = {};
    if (query.page) params.page = String(query.page);
    if (query.limit) params.limit = String(query.limit);
    if (query.search) params.search = query.search;
    if (query.type && query.type !== 'All') {
        params.type = query.type === 'Withdrawal' ? 'withdraw' : query.type.toLowerCase();
    }

    const response = await apiClient<any>('/admin/transactions', {
        method: 'GET',
        headers: getAuthHeaders(),
        params,
    });

    const data = (response?.data ?? response?.transactions ?? response?.items ?? (Array.isArray(response) ? response : [])) as any[];
    const total = response?.total ?? response?.count ?? data.length;

    const mappedData = data.map((tx: any) => {
        const rawDate = tx.createdAt ?? tx.date ?? '';
        const formattedDate = rawDate
            ? new Date(rawDate).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
              })
            : '';

        return {
            id: tx.id ?? tx._id ?? '',
            amount: Number(tx.amount) || 0,
            currency: tx.currency ?? '',
            type: tx.type ?? '',
            username: tx.username ?? tx.user?.email ?? tx.email ?? '',
            date: formattedDate,
            txId: tx.txId ?? tx.reference ?? tx.transactionRef ?? '',
            status: tx.status ?? 'Pending',
            toAmount: Number(tx.toAmount ?? tx.to_amount) || undefined,
            toCurrency: tx.toCurrency ?? tx.to_currency ?? undefined,
        };
    });

    return { data: mappedData, total };
}

// Feature branch: PushNotifications (for push-notifications admin page)
export interface PushNotification {
    id: string;
    title: string;
    message: string;
    status: 'Active' | 'Inactive';
    createdAt: string;
}

export async function getAdminPushNotifications(): Promise<PushNotification[]> {
    const response = await apiClient<any>('/admin/push-notifications', {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    const data = (response?.data ?? response ?? []) as any[];
    return data.map((n: any) => ({
        id: n.id ?? n._id ?? '',
        title: n.title ?? '',
        message: n.message ?? '',
        status: n.status ?? 'Active',
        createdAt: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '',
    }));
}

export async function createAdminPushNotification(payload: { title: string; message: string }): Promise<PushNotification> {
    const response = await apiClient<any>('/admin/push-notifications', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    const n = response?.data ?? response ?? {};
    return {
        id: n.id ?? n._id ?? '',
        title: n.title ?? payload.title,
        message: n.message ?? payload.message,
        status: n.status ?? 'Active',
        createdAt: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
    };
}

// Upstream: Announcements (for announcements admin page)
export interface Announcement {
    id: string;
    title: string;
    message: string;
    status: 'Active' | 'Inactive';
    colorTheme: string;
    targetPage: string;
    createdAt: string;
}

export async function getAnnouncements(): Promise<Announcement[]> {
    const response = await apiClient<any>('/admin/announcements', {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    const data = response?.data ?? response?.announcements ?? (Array.isArray(response) ? response : []);
    return data.map((item: any) => ({
        id: item.id ?? item._id ?? '',
        title: item.title ?? '',
        message: item.message ?? '',
        status: item.status === 'Active' || item.status === 'active' ? 'Active' as const : 'Inactive' as const,
        colorTheme: item.colorTheme ?? 'yellow',
        targetPage: item.targetPage ?? 'all',
        createdAt: item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
              })
            : '',
    }));
}

export async function createAnnouncement(data: {
    title: string;
    message: string;
    colorTheme: string;
    targetPage: string;
}): Promise<Announcement> {
    const response = await apiClient<any>('/admin/announcements', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    const item = response?.data ?? response;
    return {
        id: item.id ?? item._id ?? '',
        title: item.title ?? data.title,
        message: item.message ?? data.message,
        status: 'Active',
        colorTheme: item.colorTheme ?? data.colorTheme,
        targetPage: item.targetPage ?? data.targetPage,
        createdAt: item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
              })
            : new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
              }),
    };
}

export async function toggleAnnouncement(id: string, status: 'Active' | 'Inactive'): Promise<void> {
    await apiClient<void>(`/admin/announcements/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
}

export async function deleteAnnouncement(id: string): Promise<void> {
    await apiClient<void>(`/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
}
