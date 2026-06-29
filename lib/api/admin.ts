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

export async function updateUserKyc(id: string, status: 'Verified' | 'Unverified'): Promise<void> {
    await apiClient<void>(`/admin/users/${id}/kyc`, {
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
            toAmount: Number(tx.toAmount ?? tx.to_amount) || undefined,
            toCurrency: tx.toCurrency ?? tx.to_currency ?? undefined,
        };
    });

    return { data: mappedData, total };
}

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

// ==================== Audit Log ====================

export type AuditAction =
  | 'user.deactivated'
  | 'user.reactivated'
  | 'user.role_changed'
  | 'user.email_sent'
  | 'kyc.approved'
  | 'kyc.rejected'
  | 'transaction.flagged'
  | 'transaction.unflagged'
  | 'dispute.resolved'
  | 'fee.updated'
  | 'announcement.created'
  | 'maintenance.enabled'
  | 'maintenance.disabled'
  | 'ip_allowlist.added'
  | 'ip_allowlist.removed';

export interface AuditLogEntry {
  id: string;
  actorEmail: string;
  action: AuditAction;
  targetId?: string;
  targetLabel?: string;
  metadata?: Record<string, string>;
  createdAt: string;
  ipAddress: string;
}

export async function getAuditLog(filters?: { 
    action?: AuditAction | string; 
    actorEmail?: string; 
    page?: number; 
    limit?: number; 
    from?: string; 
    to?: string; 
}): Promise<{ data: AuditLogEntry[]; total: number }> {
    const params: Record<string, string> = {};
    if (filters?.page) params.page = String(filters.page);
    if (filters?.limit) params.limit = String(filters.limit);
    if (filters?.action && filters.action !== 'all') params.action = filters.action;
    if (filters?.actorEmail) params.actorEmail = filters.actorEmail;
    if (filters?.from) params.from = filters.from;
    if (filters?.to) params.to = filters.to;

    const response = await apiClient<any>('/admin/audit-log', {
        method: 'GET',
        headers: getAuthHeaders(),
        params,
    });
    
    const data = (response?.data ?? response?.items ?? (Array.isArray(response) ? response : [])) as any[];
    const total = response?.total ?? response?.count ?? data.length;

    const mappedData: AuditLogEntry[] = data.map((log: any) => ({
        id: log.id ?? log._id ?? '',
        actorEmail: log.actorEmail ?? log.actor_email ?? '',
        action: log.action as AuditAction,
        targetId: log.targetId ?? log.target_id,
        targetLabel: log.targetLabel ?? log.target_label,
        metadata: log.metadata,
        createdAt: log.createdAt ?? log.created_at ?? '',
        ipAddress: log.ipAddress ?? log.ip_address ?? '',
    }));

    return { data: mappedData, total };
}
