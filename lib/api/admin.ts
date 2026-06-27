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

export async function updateUserKyc(id: string, status: 'Verified' | 'Unverified'): Promise<void> {
    await apiClient<void>(`/admin/users/${id}/kyc`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
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
        };
    });

    return { data: mappedData, total };
}

export interface Dispute {
  id: string;
  transactionId: string;
  userId: string;
  username: string;
  amount: number;
  currency: string;
  flagReason: string;
  status: 'open' | 'resolved';
  resolution: 'refunded' | 'cancelled' | 'approved' | null;
  date: string;
  notes: DisputeNote[];
}

interface DisputeNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export async function getDisputes(params: { status?: string } = {}): Promise<Dispute[]> {
  const queryParams: Record<string, string> = {};
  if (params.status && params.status !== 'All') queryParams.status = params.status.toLowerCase();

  const response = await apiClient<any>('/admin/disputes', {
    method: 'GET',
    headers: getAuthHeaders(),
    params: queryParams,
  });

  const data = response?.data ?? response?.disputes ?? response ?? [];
  return (Array.isArray(data) ? data : []).map((d: any) => ({
    id: d.id ?? d._id ?? '',
    transactionId: d.transactionId ?? d.transaction_id ?? '',
    userId: d.userId ?? d.user_id ?? '',
    username: d.username ?? d.user?.email ?? '',
    amount: Number(d.amount) || 0,
    currency: d.currency ?? '',
    flagReason: d.flagReason ?? d.reason ?? '',
    status: (d.status === 'resolved' ? 'resolved' : 'open') as 'open' | 'resolved',
    resolution: d.resolution ?? null,
    date: d.createdAt ?? d.date ?? new Date().toISOString(),
    notes: (d.notes ?? []).map((n: any) => ({
      id: n.id ?? n._id ?? '',
      author: n.author ?? '',
      content: n.content ?? '',
      createdAt: n.createdAt ?? '',
    })),
  }));
}

export async function addDisputeNote(disputeId: string, content: string): Promise<void> {
  await apiClient<void>(`/admin/disputes/${disputeId}/notes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
}

export async function resolveDispute(disputeId: string, resolution: string): Promise<void> {
  await apiClient<void>(`/admin/disputes/${disputeId}/resolve`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ resolution }),
  });
}

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

export interface Report {
  id: string;
  title: string;
  type: string;
  format: string;
  createdAt: string;
  url?: string;
}

export async function generateReport(params: {
  type: string;
  format: string;
  startDate: string;
  endDate: string;
}): Promise<Report> {
  const response = await apiClient<any>('/admin/reports/generate', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  return {
    id: response.id ?? response._id ?? '',
    title: response.title ?? `${params.type} Report`,
    type: response.type ?? params.type,
    format: response.format ?? params.format,
    createdAt: response.createdAt ?? new Date().toISOString(),
    url: response.url ?? null,
  };
}

export async function getReports(): Promise<Report[]> {
  const response = await apiClient<any>('/admin/reports', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = response?.data ?? response?.reports ?? response ?? [];
  return (Array.isArray(data) ? data : []).map((r: any) => ({
    id: r.id ?? r._id ?? '',
    title: r.title ?? 'Report',
    type: r.type ?? '',
    format: r.format ?? 'CSV',
    createdAt: r.createdAt ?? '',
    url: r.url ?? null,
  }));
}
