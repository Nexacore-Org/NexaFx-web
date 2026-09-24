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

// Returns the first non-null value from a list of candidates.
function pickFirst<T>(...values: T[]): T | undefined {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

// Converts a value to a number, applying a fallback when it is absent.
function toNumber(value: unknown, fallback = 0): number {
  if (value === undefined || value === null) return fallback;
  return Number(value);
}

// Safe normalization of Admin Users
export function mapAdminUser(dto: AdminUserDto): AdminUser {
  return {
    id: String(pickFirst(dto.id, dto._id, '')),
    email: String(pickFirst(dto.email, '')),
    firstName: pickFirst(dto.firstName, dto.first_name) ?? null,
    lastName: pickFirst(dto.lastName, dto.last_name) ?? null,
    phone: dto.phone ?? null,
    walletAddress: String(pickFirst(dto.walletAddress, dto.wallet_address, dto.address, '0x...')),
    username: String(pickFirst(dto.username, dto.email?.split('@')[0], 'user')),
    avatarUrl: pickFirst(dto.avatarUrl, dto.avatar_url) ?? null,
    transactions: toNumber(pickFirst(dto.transactions, dto.transactionCount), 0),
    totalDeposit: toNumber(pickFirst(dto.totalDeposit, dto.total_deposit), 0),
    totalWithdraw: toNumber(pickFirst(dto.totalWithdraw, dto.total_withdraw), 0),
    kycStatus: dto.kycStatus === 'Verified' || dto.kyc_status === 'Verified' ? 'Verified' : 'Unverified',
    createdAt: (() => {
      const dateVal = pickFirst(dto.createdAt, dto.created_at);
      return dateVal ? new Date(dateVal).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'N/A';
    })(),
    isActive: Boolean(pickFirst(dto.isActive, dto.is_active, true)),
  };
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const response = await apiClient<AdminMetricsResponse>('/admin/metrics');
  const data = response?.data ?? (response as AdminMetricsDto) ?? {};
  return {
    registeredUsers: toNumber(data.registeredUsers, 0),
    totalTransactions: toNumber(data.totalTransactions, 0),
    pendingKyc: toNumber(data.pendingKyc, 0),
    currencies: toNumber(data.currencies, 0),
    totalDeposits: toNumber(data.totalDeposits, 0),
    totalWithdrawals: toNumber(data.totalWithdrawals, 0),
  };
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await apiClient<AdminUsersResponse | AdminUserDto[]>('/admin/users');
  const data = (Array.isArray(response) ? response : response?.data) ?? [];
  return data.map(mapAdminUser);
}

export async function getAdminUserById(id: string): Promise<AdminUser> {
  const response = await apiClient<AdminUserResponse | AdminUserDto>(`/admin/users/${id}`);
  const data = ('data' in response && response.data ? response.data : response) as AdminUserDto;
  return mapAdminUser(data);
}

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
    const rawDate = pickFirst(dto.createdAt, dto.date);
    return {
      id: String(pickFirst(dto.id, dto._id, '')),
      amount: toNumber(pickFirst(dto.amount), 0),
      currency: String(pickFirst(dto.currency, 'NGN')),
      type: typeMap[String(pickFirst(dto.type, '')).toLowerCase()] ?? 'Deposit',
      username: pickFirst(dto.username, dto.email) ?? 'Unknown User',
      date: rawDate ? new Date(rawDate).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A',
      txId: String(pickFirst(dto.txId, dto.transactionRef, dto.reference, dto.id, '0x...')),
      status: pickFirst(dto.status) ?? 'active',
    };
  });
}

export async function getAdminPushNotifications(): Promise<PushNotification[]> {
  const response = await apiClient<PushNotificationsResponse | PushNotificationDto[]>('/admin/push-notifications');
  const data = (Array.isArray(response) ? response : response?.data) ?? [];
  return data.map((dto) => {
    const rawDate = pickFirst(dto.createdAt, dto.created_at);
    return {
      id: String(pickFirst(dto.id, dto._id, '')),
      title: String(pickFirst(dto.title, '')),
      message: String(pickFirst(dto.message, '')),
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
  const rawDate = pickFirst(data.createdAt, data.created_at);
  return {
    id: String(pickFirst(data.id, data._id, '')),
    title: String(pickFirst(data.title, '')),
    message: String(pickFirst(data.message, '')),
    status: data.status === 'Active' || data.status === 'active' ? 'Active' : 'Inactive',
    createdAt: rawDate ? new Date(rawDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'N/A',
  };
}
