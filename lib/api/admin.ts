/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "../api-client";
import { pickField } from "./pick-field";

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
    registeredUsers: pickField(response, "registeredUsers", "totalUsers") ?? 0,
    totalTransactions: response?.totalTransactions ?? 0,
    pendingKyc: response?.pendingKyc ?? 0,
    currencies: response?.currencies ?? 0,
    totalDeposits: pickField(response, "totalDeposits", "totalVolume") ?? 0,
    totalWithdrawals: response?.totalWithdrawals ?? 0,
  };
}

export async function getCohortRetention(): Promise<CohortRetentionData[]> {
  const response = await apiClient<any>("/admin/analytics/cohort-retention", {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = (pickField(response, "data", "cohorts", "items") ??
    (Array.isArray(response) ? response : [])) as any[];

  return data.map((cohort: any) => {
    const retention = (pickField(
      cohort,
      "retentionByMonth",
      "retention_by_month",
      "retention",
    ) ?? []) as unknown[];
    return {
      cohortMonth:
        pickField(cohort, "cohortMonth", "cohort_month", "month") ?? "",
      cohortSize:
        Number(pickField(cohort, "cohortSize", "cohort_size", "size")) || 0,
      retentionByMonth: retention
        .map((value: unknown) => Number(value))
        .filter((value: number) => Number.isFinite(value)),
    };
  });
}

export function mapAdminUser(user: any): AdminUser {
  return {
    id: pickField(user, "id", "_id") ?? "",
    email: user.email ?? "",
    firstName: pickField(user, "firstName", "first_name") ?? null,
    lastName: pickField(user, "lastName", "last_name") ?? null,
    phone: user.phone ?? null,
    walletAddress:
      pickField(user, "walletAddress", "wallet_address", "address") ?? "",
    username: user.username ?? user.email?.split("@")[0] ?? "",
    avatarUrl: pickField(user, "avatarUrl", "avatar_url") ?? null,
    transactions: Number(user.transactions) || 0,
    totalDeposit: Number(pickField(user, "totalDeposit", "total_deposit")) || 0,
    totalWithdraw:
      Number(pickField(user, "totalWithdraw", "total_withdraw")) || 0,
    kycStatus: (user.kycStatus === "Verified" ||
    user.kycStatus === "verified" ||
    user.kyc_status === "Verified" ||
    user.kyc_status === "verified"
      ? "Verified"
      : "Unverified") as "Verified" | "Unverified",
    createdAt: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
    createdAtRaw: pickField(user, "createdAt", "created_at") ?? undefined,
    twoFactorEnabled:
      pickField(user, "twoFactorEnabled", "two_factor_enabled", "mfaEnabled") ??
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

  const data = (pickField(response, "data", "users", "items") ??
    (Array.isArray(response) ? response : [])) as any[];
  const total = (pickField(response, "total", "count") ??
    data.length) as number;

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
  const data = (pickField(response, "data", "submissions") ??
    response ??
    []) as any[];
  return (Array.isArray(data) ? data : []).map((item: any) => ({
    id: pickField(item, "id", "_id") ?? "",
    userName: pickField(item, "userName", "username", "user.name") ?? "",
    email: pickField(item, "email", "user.email") ?? "",
    documentType: pickField(item, "documentType", "document_type") ?? "Unknown",
    status: item.status ?? "Pending",
    submittedAt:
      pickField(item, "submittedAt", "createdAt") ?? new Date().toISOString(),
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

  const data = (pickField(response, "data", "transactions", "items") ??
    (Array.isArray(response) ? response : [])) as any[];

  return data.map((tx: any) => ({
    id: pickField(tx, "id", "_id") ?? "",
    amount: Number(tx.amount) || 0,
    currency: tx.currency ?? "",
    type: tx.type ?? "",
    username: tx.username ?? tx.user?.email ?? tx.email ?? "",
    email: tx.email ?? tx.user?.email ?? "",
    date: pickField(tx, "createdAt", "date") ?? "",
    txId: pickField(tx, "txId", "reference", "transactionRef") ?? "",
    status: tx.status ?? "Pending",
    flagReason: pickField(tx, "flagReason", "flag_reason") ?? "",
    flaggedBy: pickField(tx, "flaggedBy", "flagged_by") ?? "",
    flaggedAt: pickField(tx, "flaggedAt", "flagged_at") ?? "",
    whitelisted: Boolean(tx.whitelisted),
    whitelistedBy:
      pickField(tx, "whitelistedBy", "whitelisted_by") ?? undefined,
    whitelistedByEmail:
      pickField(tx, "whitelistedByEmail", "whitelisted_by_email") ?? undefined,
    whitelistedAt:
      pickField(tx, "whitelistedAt", "whitelisted_at") ?? undefined,
    whitelistNotes:
      pickField(tx, "whitelistNotes", "whitelist_notes") ?? undefined,
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

  const data = (pickField(response, "data", "transactions", "items") ??
    (Array.isArray(response) ? response : [])) as any[];
  const total = (pickField(response, "total", "count") ??
    data.length) as number;

  const mappedData = data.map((tx: any) => {
    const rawDate = (pickField(tx, "createdAt", "date") ?? "") as string;
    const formattedDate = rawDate
      ? new Date(rawDate).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return {
      id: pickField(tx, "id", "_id") ?? "",
      amount: Number(tx.amount) || 0,
      currency: tx.currency ?? "",
      type: tx.type ?? "",
      userId: pickField(tx, "userId", "user_id", "user.id", "user._id") ?? "",
      username: tx.username ?? tx.user?.email ?? tx.email ?? "",
      date: formattedDate,
      createdAt: rawDate,
      txId: pickField(tx, "txId", "reference", "transactionRef") ?? "",
      status: tx.status ?? "Pending",
      toAmount: Number(pickField(tx, "toAmount", "to_amount")) || undefined,
      toCurrency: pickField(tx, "toCurrency", "to_currency") ?? undefined,
      whitelisted: Boolean(tx.whitelisted),
      whitelistedBy:
        pickField(tx, "whitelistedBy", "whitelisted_by") ?? undefined,
      whitelistedByEmail:
        pickField(tx, "whitelistedByEmail", "whitelisted_by_email") ??
        undefined,
      whitelistedAt:
        pickField(tx, "whitelistedAt", "whitelisted_at") ?? undefined,
      whitelistNotes:
        pickField(tx, "whitelistNotes", "whitelist_notes") ?? undefined,
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
    createdAt: item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
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
    id: item.id ?? item._id ?? "",
    title: item.title ?? data.title,
    message: item.message ?? data.message,
    status: "Active",
    colorTheme: item.colorTheme ?? data.colorTheme,
    targetPage: item.targetPage ?? data.targetPage,
    createdAt: item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
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
    createdAt: item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
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
      ? new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
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
    pickField(response, "data", "geo", "countries") ??
    (Array.isArray(response) ? response : []);
  return (data as any[]).map((item: any) => ({
    country: pickField(item, "country", "country_code") ?? "",
    countryName: pickField(item, "countryName", "country_name", "name") ?? "",
    transactionCount:
      Number(
        pickField(item, "transactionCount", "transaction_count", "count"),
      ) || 0,
    totalVolume:
      Number(pickField(item, "totalVolume", "total_volume", "volume")) || 0,
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
    createdAt: item.createdAt
      ? new Date(item.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
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
  const item = response?.data ?? response;
  return {
    id: item.id ?? item._id ?? "",
    adminEmail: item.adminEmail ?? item.admin_email ?? "",
    content: item.content ?? content,
    createdAt: item.createdAt
      ? new Date(item.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
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
