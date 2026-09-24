/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "../api-client";
import {
  formatDateTimeGB,
  formatShortDate,
  formatShortDateTime,
} from "../utils/format";

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
  kycStatus: "Verified" | "Unverified";
  createdAt: string;
  isActive: boolean;
  createdAtRaw?: string;
  twoFactorEnabled?: boolean;
  trustScore?: number;
}

export interface AdminMetrics {
  registeredUsers: number;
  totalTransactions: number;
  pendingKyc: number;
  currencies: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

export interface CohortRetentionData {
  cohortMonth: string;
  cohortSize: number;
  retentionByMonth: number[];
}

export interface AdminTransaction {
  id: string;
  userId?: string;
  amount: number;
  currency: string;
  type: string;
  username: string;
  date: string;
  createdAt?: string;
  txId: string;
  status: string;
  toAmount?: number;
  toCurrency?: string;
  whitelisted?: boolean;
  whitelistedBy?: string;
  whitelistedByEmail?: string;
  whitelistedAt?: string;
  whitelistNotes?: string;
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
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return token ? { "x-client-token": token } : {};
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const response = await apiClient<any>("/admin/metrics", {
    method: "GET",
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

export async function getCohortRetention(): Promise<CohortRetentionData[]> {
  const response = await apiClient<any>("/admin/analytics/cohort-retention", {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = (response?.data ??
    response?.cohorts ??
    response?.items ??
    (Array.isArray(response) ? response : [])) as any[];

  return data.map((cohort: any) => ({
    cohortMonth:
      cohort.cohortMonth ?? cohort.cohort_month ?? cohort.month ?? "",
    cohortSize:
      Number(cohort.cohortSize ?? cohort.cohort_size ?? cohort.size) || 0,
    retentionByMonth: (
      cohort.retentionByMonth ??
      cohort.retention_by_month ??
      cohort.retention ??
      []
    )
      .map((value: unknown) => Number(value))
      .filter((value: number) => Number.isFinite(value)),
  }));
}

export function mapAdminUser(user: any): AdminUser {
  return {
    id: user.id ?? user._id ?? "",
    email: user.email ?? "",
    firstName: user.firstName ?? user.first_name ?? null,
    lastName: user.lastName ?? user.last_name ?? null,
    phone: user.phone ?? null,
    walletAddress:
      user.walletAddress ?? user.wallet_address ?? user.address ?? "",
    username: user.username ?? user.email?.split("@")[0] ?? "",
    avatarUrl: user.avatarUrl ?? user.avatar_url ?? null,
    transactions: Number(user.transactions) || 0,
    totalDeposit: Number(user.totalDeposit ?? user.total_deposit) || 0,
    totalWithdraw: Number(user.totalWithdraw ?? user.total_withdraw) || 0,
    kycStatus: (user.kycStatus === "Verified" ||
    user.kycStatus === "verified" ||
    user.kyc_status === "Verified" ||
    user.kyc_status === "verified"
      ? "Verified"
      : "Unverified") as "Verified" | "Unverified",
    createdAt: user.createdAt ? formatShortDate(user.createdAt) : "",
    createdAtRaw: user.createdAt ?? user.created_at ?? undefined,
    twoFactorEnabled:
      user.twoFactorEnabled ??
      user.two_factor_enabled ??
      user.mfaEnabled ??
      undefined,
    isActive: user.isActive ?? user.is_active ?? true,
  };
}

export async function getAdminUsers(
  query: AdminUsersQuery = {},
): Promise<{ data: AdminUser[]; total: number }> {
  const params: Record<string, string> = {};
  if (query.page) params.page = String(query.page);
  if (query.limit) params.limit = String(query.limit);
  if (query.search) params.search = query.search;

  const response = await apiClient<any>("/admin/users", {
    method: "GET",
    headers: getAuthHeaders(),
    params,
  });

  const data = (response?.data ??
    response?.users ??
    response?.items ??
    (Array.isArray(response) ? response : [])) as any[];
  const total = response?.total ?? response?.count ?? data.length;

  let mappedData = data.map(mapAdminUser);

  // If the backend doesn't yet honor the requested `limit`, trim locally so
  // callers that only render a handful of rows (e.g. the analytics
  // recent-signups widget) never retain the full admin user set.
  // TODO: remove this fallback once the /admin/users endpoint reliably limits.
  if (query.limit && mappedData.length > query.limit) {
    mappedData = mappedData.slice(0, query.limit);
  }

  return { data: mappedData, total };
}

export async function getAdminUserById(id: string): Promise<AdminUser> {
  const response = await apiClient<any>(`/admin/users/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const user = response?.data ?? response;
  return mapAdminUser(user);
}

export async function deleteAdminUser(id: string): Promise<void> {
  const res = await fetch(`/api/proxy/admin/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data?.message || `Failed to delete user (status ${res.status})`,
    );
  }
}

export interface KycSubmission {
  id: string;
  userName: string;
  email: string;
  documentType: string;
  status: "Pending" | "Approved" | "Rejected";
  submittedAt: string;
  reviewedAt?: string;
}

export async function getAdminKycSubmissions(): Promise<KycSubmission[]> {
  const response = await apiClient<any>("/admin/kyc", {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = response?.data ?? response?.submissions ?? response ?? [];
  return (Array.isArray(data) ? data : []).map((item: any) => ({
    id: item.id ?? item._id ?? "",
    userName: item.userName ?? item.username ?? item.user?.name ?? "",
    email: item.email ?? item.user?.email ?? "",
    documentType: item.documentType ?? item.document_type ?? "Unknown",
    status: item.status ?? "Pending",
    submittedAt: item.submittedAt ?? item.createdAt ?? new Date().toISOString(),
    reviewedAt: item.reviewedAt ?? undefined,
  }));
}

export async function updateKycStatus(
  id: string,
  status: "Approved" | "Rejected",
): Promise<void> {
  await apiClient<void>(`/admin/kyc/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
}

export async function updateUserKyc(
  id: string,
  status: "Verified" | "Unverified",
): Promise<void> {
  await apiClient<void>(`/admin/users/${id}/kyc`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
}

export const flagTransaction = (id: string, reason: string): Promise<void> =>
  apiClient(`/admin/transactions/${id}/flag`, {
    method: "POST",
    body: JSON.stringify({ reason }),
    headers: getAuthHeaders(),
  });

export const unflagTransaction = (id: string): Promise<void> =>
  apiClient(`/admin/transactions/${id}/unflag`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

// ─── Flagged Transaction Queue & Whitelist ────────────────────────────────

export interface FlaggedTransaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  username: string;
  email: string;
  date: string;
  txId: string;
  status: string;
  flagReason: string;
  flaggedBy: string;
  flaggedAt: string;
  whitelisted: boolean;
  whitelistedBy?: string;
  whitelistedByEmail?: string;
  whitelistedAt?: string;
  whitelistNotes?: string;
}

export async function getFlaggedTransactions(): Promise<FlaggedTransaction[]> {
  const response = await apiClient<any>("/admin/transactions", {
    method: "GET",
    headers: getAuthHeaders(),
    params: { flagged: "true" },
  });

  const data = (response?.data ??
    response?.transactions ??
    response?.items ??
    (Array.isArray(response) ? response : [])) as any[];

  return data.map((tx: any) => ({
    id: tx.id ?? tx._id ?? "",
    amount: Number(tx.amount) || 0,
    currency: tx.currency ?? "",
    type: tx.type ?? "",
    username: tx.username ?? tx.user?.email ?? tx.email ?? "",
    email: tx.email ?? tx.user?.email ?? "",
    date: tx.createdAt ?? tx.date ?? "",
    txId: tx.txId ?? tx.reference ?? tx.transactionRef ?? "",
    status: tx.status ?? "Pending",
    flagReason: tx.flagReason ?? tx.flag_reason ?? "",
    flaggedBy: tx.flaggedBy ?? tx.flagged_by ?? "",
    flaggedAt: tx.flaggedAt ?? tx.flagged_at ?? "",
    whitelisted: Boolean(tx.whitelisted),
    whitelistedBy: tx.whitelistedBy ?? tx.whitelisted_by ?? undefined,
    whitelistedByEmail:
      tx.whitelistedByEmail ?? tx.whitelisted_by_email ?? undefined,
    whitelistedAt: tx.whitelistedAt ?? tx.whitelisted_at ?? undefined,
    whitelistNotes: tx.whitelistNotes ?? tx.whitelist_notes ?? undefined,
  }));
}

export const whitelistTransaction = (
  id: string,
  notes: string,
): Promise<void> =>
  apiClient(`/admin/transactions/${id}/whitelist`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ notes }),
  });

export interface Dispute {
  id: string;
  userId: string;
  userEmail: string;
  transactionId: string;
  description: string;
  status: "Open" | "Under Review" | "Resolved";
  notes: DisputeNote[];
  createdAt: string;
  resolvedAt?: string;
}

export interface DisputeNote {
  id: string;
  adminEmail: string;
  content: string;
  createdAt: string;
}

export const getDisputes = (): Promise<Dispute[]> =>
  apiClient("/admin/disputes", { headers: getAuthHeaders() });

export const resolveDispute = (id: string, resolution: string): Promise<void> =>
  apiClient(`/admin/disputes/${id}/resolve`, {
    method: "POST",
    body: JSON.stringify({ resolution }),
    headers: getAuthHeaders(),
  });

export const addDisputeNote = (
  id: string,
  content: string,
): Promise<DisputeNote> =>
  apiClient(`/admin/disputes/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ content }),
    headers: getAuthHeaders(),
  });

export async function getAdminTransactions(
  query: AdminTransactionsQuery = {},
): Promise<{ data: AdminTransaction[]; total: number }> {
  const params: Record<string, string> = {};
  if (query.page) params.page = String(query.page);
  if (query.limit) params.limit = String(query.limit);
  if (query.search) params.search = query.search;
  if (query.type && query.type !== "All") {
    params.type =
      query.type === "Withdrawal" ? "withdraw" : query.type.toLowerCase();
  }

  const response = await apiClient<any>("/admin/transactions", {
    method: "GET",
    headers: getAuthHeaders(),
    params,
  });

  const data = (response?.data ??
    response?.transactions ??
    response?.items ??
    (Array.isArray(response) ? response : [])) as any[];
  const total = response?.total ?? response?.count ?? data.length;

  const mappedData = data.map((tx: any) => {
    const rawDate = tx.createdAt ?? tx.date ?? "";
    const formattedDate = rawDate ? formatDateTimeGB(rawDate) : "";

    return {
      id: tx.id ?? tx._id ?? "",
      amount: Number(tx.amount) || 0,
      currency: tx.currency ?? "",
      type: tx.type ?? "",
      userId: tx.userId ?? tx.user_id ?? tx.user?.id ?? tx.user?._id ?? "",
      username: tx.username ?? tx.user?.email ?? tx.email ?? "",
      date: formattedDate,
      createdAt: rawDate,
      txId: tx.txId ?? tx.reference ?? tx.transactionRef ?? "",
      status: tx.status ?? "Pending",
      toAmount: Number(tx.toAmount ?? tx.to_amount) || undefined,
      toCurrency: tx.toCurrency ?? tx.to_currency ?? undefined,
      whitelisted: Boolean(tx.whitelisted),
      whitelistedBy: tx.whitelistedBy ?? tx.whitelisted_by ?? undefined,
      whitelistedByEmail:
        tx.whitelistedByEmail ?? tx.whitelisted_by_email ?? undefined,
      whitelistedAt: tx.whitelistedAt ?? tx.whitelisted_at ?? undefined,
      whitelistNotes: tx.whitelistNotes ?? tx.whitelist_notes ?? undefined,
    };
  });

  return { data: mappedData, total };
}

// Feature branch: PushNotifications (for push-notifications admin page)
export interface PushNotification {
  id: string;
  title: string;
  message: string;
  status: "Active" | "Inactive";
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
export async function getAdminPushNotifications(): Promise<PushNotification[]> {
  const response = await apiClient<any>("/admin/push-notifications", {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = (response?.data ?? response ?? []) as any[];
  return data.map((n: any) => ({
    id: n.id ?? n._id ?? "",
    title: n.title ?? "",
    message: n.message ?? "",
    status: n.status ?? "Active",
    createdAt: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "",
  }));
}

export async function createAdminPushNotification(payload: {
  title: string;
  message: string;
}): Promise<PushNotification> {
  const response = await apiClient<any>("/admin/push-notifications", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const n = response?.data ?? response ?? {};
  return {
    id: n.id ?? n._id ?? "",
    title: n.title ?? payload.title,
    message: n.message ?? payload.message,
    status: n.status ?? "Active",
    createdAt: n.createdAt
      ? new Date(n.createdAt).toLocaleDateString()
      : new Date().toLocaleDateString(),
  };
}

// Upstream: Announcements (for announcements admin page)
export interface Announcement {
  id: string;
  title: string;
  message: string;
  status: "Active" | "Inactive";
  colorTheme: string;
  targetPage: string;
  createdAt: string;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const response = await apiClient<any>("/admin/announcements", {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data =
    response?.data ??
    response?.announcements ??
    (Array.isArray(response) ? response : []);
  return data.map((item: any) => ({
    id: item.id ?? item._id ?? "",
    title: item.title ?? "",
    message: item.message ?? "",
    status:
      item.status === "Active" || item.status === "active"
        ? ("Active" as const)
        : ("Inactive" as const),
    colorTheme: item.colorTheme ?? "yellow",
    targetPage: item.targetPage ?? "all",
    createdAt: item.createdAt ? formatShortDate(item.createdAt) : "",
  }));
}

export async function createAnnouncement(data: {
  title: string;
  message: string;
  colorTheme: string;
  targetPage: string;
}): Promise<Announcement> {
  const response = await apiClient<any>("/admin/announcements", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const item = response?.data ?? response;
  return {
    registeredUsers: toNumber(data.registeredUsers, 0),
    totalTransactions: toNumber(data.totalTransactions, 0),
    pendingKyc: toNumber(data.pendingKyc, 0),
    currencies: toNumber(data.currencies, 0),
    totalDeposits: toNumber(data.totalDeposits, 0),
    totalWithdrawals: toNumber(data.totalWithdrawals, 0),
    id: item.id ?? item._id ?? "",
    title: item.title ?? data.title,
    message: item.message ?? data.message,
    status: "Active",
    colorTheme: item.colorTheme ?? data.colorTheme,
    targetPage: item.targetPage ?? data.targetPage,
    createdAt: item.createdAt
      ? formatShortDate(item.createdAt)
      : formatShortDate(new Date()),
  };
}

export async function toggleAnnouncement(
  id: string,
  status: "Active" | "Inactive",
): Promise<void> {
  await apiClient<void>(`/admin/announcements/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await apiClient<void>(`/admin/announcements/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

// ─── Broadcast Emails ──────────────────────────────────────────────────────

export interface BroadcastEmail {
  id: string;
  subject: string;
  content: string;
  targetAudience: string;
  status: "Pending" | "Sent" | "Failed";
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  createdAt: string;
}

export async function getBroadcastEmails(): Promise<BroadcastEmail[]> {
  const response = await apiClient<any>("/admin/broadcast-emails", {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data =
    response?.data ??
    response?.emails ??
    (Array.isArray(response) ? response : []);
  return data.map((item: any) => ({
    id: item.id ?? item._id ?? "",
    subject: item.subject ?? "",
    content: item.content ?? "",
    targetAudience: item.targetAudience ?? "All Users",
    status: item.status ?? "Pending",
    scheduledAt: item.scheduledAt ?? undefined,
    sentAt: item.sentAt ?? undefined,
    recipientCount: Number(item.recipientCount) || 0,
    createdAt: item.createdAt ? formatShortDate(item.createdAt) : "",
  }));
}

export async function sendBroadcastEmail(data: {
  subject: string;
  content: string;
  targetAudience: string;
  scheduledAt?: string;
}): Promise<BroadcastEmail> {
  const response = await apiClient<any>("/admin/broadcast-emails", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const item = response?.data ?? response;
  return {
    id: item.id ?? item._id ?? "",
    subject: item.subject ?? data.subject,
    content: item.content ?? data.content,
    targetAudience: item.targetAudience ?? data.targetAudience,
    status: item.status ?? "Pending",
    scheduledAt: item.scheduledAt ?? data.scheduledAt,
    sentAt: item.sentAt ?? undefined,
    recipientCount: Number(item.recipientCount) || 0,
    createdAt: item.createdAt
      ? formatShortDate(item.createdAt)
      : formatShortDate(new Date()),
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
}

export async function deleteBroadcastEmail(id: string): Promise<void> {
  await apiClient<void>(`/admin/broadcast-emails/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

// ─── Geographic Analytics ────────────────────────────────────────────────────

export interface GeoData {
  country: string; // ISO 3166-1 alpha-2 e.g. "NG"
  countryName: string; // e.g. "Nigeria"
  transactionCount: number;
  totalVolume: number;
  currency: string;
}

export async function getGeoAnalytics(): Promise<GeoData[]> {
  const response = await apiClient<any>("/admin/analytics/geo", {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data =
    response?.data ??
    response?.geo ??
    response?.countries ??
    (Array.isArray(response) ? response : []);
  return (data as any[]).map((item: any) => ({
    country: item.country ?? item.country_code ?? "",
    countryName: item.countryName ?? item.country_name ?? item.name ?? "",
    transactionCount:
      Number(item.transactionCount ?? item.transaction_count ?? item.count) ||
      0,
    totalVolume:
      Number(item.totalVolume ?? item.total_volume ?? item.volume) || 0,
    currency: item.currency ?? "USD",
  }));
}

// ─── User Notes ─────────────────────────────────────────────────────────────

export interface UserNote {
  id: string;
  adminEmail: string;
  content: string;
  createdAt: string;
}

export async function getUserNotes(userId: string): Promise<UserNote[]> {
  const response = await apiClient<any>(`/admin/users/${userId}/notes`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data =
    response?.data ??
    response?.notes ??
    (Array.isArray(response) ? response : []);
  return data.map((item: any) => ({
    id: item.id ?? item._id ?? "",
    adminEmail: item.adminEmail ?? item.admin_email ?? "",
    content: item.content ?? item.note ?? "",
    createdAt: item.createdAt ? formatShortDateTime(item.createdAt) : "",
  }));
}

export async function addUserNote(
  userId: string,
  content: string,
): Promise<UserNote> {
  const response = await apiClient<any>(`/admin/users/${userId}/notes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
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
  const item = response?.data ?? response;
  return {
    id: item.id ?? item._id ?? "",
    adminEmail: item.adminEmail ?? item.admin_email ?? "",
    content: item.content ?? content,
    createdAt: item.createdAt
      ? formatShortDateTime(item.createdAt)
      : formatShortDateTime(new Date()),
  };
}

export async function deleteUserNote(
  userId: string,
  noteId: string,
): Promise<void> {
  await apiClient<void>(`/admin/users/${userId}/notes/${noteId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}
