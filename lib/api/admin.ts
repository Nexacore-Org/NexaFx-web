import { apiClient } from '../api-client';

export interface AdminMetrics {
  registeredUsers: number;
  totalTransactions: number;
  pendingKyc: number;
  currencies: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

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

export interface AdminTransaction {
  id: string;
  amount: number;
  currency: string;
  type: 'Deposit' | 'Withdraw' | 'Convert';
  username: string;
  date: string;
  txId: string;
  status: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

interface AdminUserDto {
  id?: string | number;
  _id?: string | number;
  email?: string;
  firstName?: string | null;
  first_name?: string | null;
  lastName?: string | null;
  last_name?: string | null;
  phone?: string | null;
  walletAddress?: string | null;
  wallet_address?: string | null;
  address?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  transactions?: number | string | null;
  transactionCount?: number | string | null;
  totalDeposit?: number | string | null;
  total_deposit?: number | string | null;
  totalWithdraw?: number | string | null;
  total_withdraw?: number | string | null;
  kycStatus?: string | null;
  kyc_status?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
  isActive?: boolean | null;
  is_active?: boolean | null;
}

interface AdminMetricsDto {
  registeredUsers?: number | string | null;
  totalTransactions?: number | string | null;
  pendingKyc?: number | string | null;
  currencies?: number | string | null;
  totalDeposits?: number | string | null;
  totalWithdrawals?: number | string | null;
}

interface AdminMetricsResponse {
  data?: AdminMetricsDto;
  registeredUsers?: number | string | null;
  totalTransactions?: number | string | null;
  pendingKyc?: number | string | null;
  currencies?: number | string | null;
  totalDeposits?: number | string | null;
  totalWithdrawals?: number | string | null;
}

interface AdminUsersResponse {
  data?: AdminUserDto[];
}

interface AdminUserResponse {
  data?: AdminUserDto;
}

interface AdminTransactionDto {
  id?: string | number;
  _id?: string | number;
  amount?: number | string | null;
  currency?: string | null;
  type?: string | null;
  username?: string | null;
  email?: string | null;
  createdAt?: string | null;
  date?: string | null;
  txId?: string | null;
  transactionRef?: string | null;
  reference?: string | null;
  status?: string | null;
}

interface AdminTransactionsResponse {
  data?: AdminTransactionDto[];
}

interface PushNotificationDto {
  id?: string | number;
  _id?: string | number;
  title?: string | null;
  message?: string | null;
  status?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
}

interface PushNotificationsResponse {
  data?: PushNotificationDto[];
}

interface PushNotificationResponse {
  data?: PushNotificationDto;
}

// Safe normalization of Admin Users
export function mapAdminUser(dto: AdminUserDto): AdminUser {
  return {
    id: String(dto.id ?? dto._id ?? ''),
    email: String(dto.email ?? ''),
    firstName: dto.firstName ?? dto.first_name ?? null,
    lastName: dto.lastName ?? dto.last_name ?? null,
    phone: dto.phone ?? null,
    walletAddress: dto.walletAddress ?? dto.wallet_address ?? dto.address ?? '0x...',
    username: dto.username ?? dto.email?.split('@')[0] ?? 'user',
    avatarUrl: dto.avatarUrl ?? dto.avatar_url ?? null,
    transactions: Number(dto.transactions ?? dto.transactionCount ?? 0),
    totalDeposit: Number(dto.totalDeposit ?? dto.total_deposit ?? 0),
    totalWithdraw: Number(dto.totalWithdraw ?? dto.total_withdraw ?? 0),
    kycStatus: dto.kycStatus === 'Verified' || dto.kyc_status === 'Verified' ? 'Verified' : 'Unverified',
    createdAt: (() => {
      const dateVal = dto.createdAt ?? dto.created_at;
      return dateVal ? new Date(dateVal).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'N/A';
    })(),
    isActive: Boolean(dto.isActive ?? dto.is_active ?? true),
  };
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const response = await apiClient<AdminMetricsResponse>('/admin/metrics');
  const data = response?.data ?? (response as AdminMetricsDto) ?? {};
  return {
    registeredUsers: Number(data.registeredUsers ?? 0),
    totalTransactions: Number(data.totalTransactions ?? 0),
    pendingKyc: Number(data.pendingKyc ?? 0),
    currencies: Number(data.currencies ?? 0),
    totalDeposits: Number(data.totalDeposits ?? 0),
    totalWithdrawals: Number(data.totalWithdrawals ?? 0),
  };
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await apiClient<AdminUsersResponse | AdminUserDto[]>('/admin/users');
  const data = (Array.isArray(response) ? response : response?.data) ?? [];
  return data.map(mapAdminUser);
}

export async function getAdminUser(id: string): Promise<AdminUser> {
  const response = await apiClient<AdminUserResponse | AdminUserDto>(`/admin/users/${id}`);
  const data = ('data' in response && response.data ? response.data : response) as AdminUserDto;
  return mapAdminUser(data);
}

export const getAdminUserById = getAdminUser;

export async function getAdminTransactions(): Promise<AdminTransaction[]> {
  const response = await apiClient<AdminTransactionsResponse | AdminTransactionDto[]>('/admin/transactions');
  const data = (Array.isArray(response) ? response : response?.data) ?? [];
  const typeMap: Record<string, 'Deposit' | 'Withdraw' | 'Convert'> = {
    deposit: 'Deposit',
    withdrawal: 'Withdraw',
    withdraw: 'Withdraw',
    convert: 'Convert',
    conversion: 'Convert',
  };
  return data.map((dto) => {
    const rawDate = dto.createdAt ?? dto.date;
    return {
      id: String(dto.id ?? dto._id ?? ''),
      amount: Number(dto.amount ?? 0),
      currency: String(dto.currency ?? 'NGN'),
      type: typeMap[String(dto.type ?? '').toLowerCase()] ?? 'Deposit',
      username: dto.username ?? dto.email ?? 'Unknown User',
      date: rawDate ? new Date(rawDate).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A',
      txId: dto.txId ?? dto.transactionRef ?? dto.reference ?? String(dto.id ?? '0x...'),
      status: dto.status ?? 'active',
    };
  });
}

export async function getAdminPushNotifications(): Promise<PushNotification[]> {
  const response = await apiClient<PushNotificationsResponse | PushNotificationDto[]>('/admin/push-notifications');
  const data = (Array.isArray(response) ? response : response?.data) ?? [];
  return data.map((dto) => {
    const rawDate = dto.createdAt ?? dto.created_at;
    return {
      id: String(dto.id ?? dto._id ?? ''),
      title: String(dto.title ?? ''),
      message: String(dto.message ?? ''),
      status: dto.status === 'Active' || dto.status === 'active' ? 'Active' : 'Inactive',
      createdAt: rawDate ? new Date(rawDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'N/A',
    };
  });
}

export async function createAdminPushNotification(payload: { title: string; message: string }): Promise<PushNotification> {
  const response = await apiClient<PushNotificationResponse | PushNotificationDto>('/admin/push-notifications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const data = ('data' in response && response.data ? response.data : response) as PushNotificationDto;
  const rawDate = data.createdAt ?? data.created_at;
  return {
    id: String(data.id ?? data._id ?? ''),
    title: String(data.title ?? ''),
    message: String(data.message ?? ''),
    status: data.status === 'Active' || data.status === 'active' ? 'Active' : 'Inactive',
    createdAt: rawDate ? new Date(rawDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'N/A',
  };
}
