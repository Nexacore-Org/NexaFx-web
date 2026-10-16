import { apiRequest, ApiError } from "../api-client";

/**
 * Backend API module.
 *
 * NOTE: the backend contract for these endpoints is NOT confirmed. The app
 * currently has no reachable backend (the existing auth routes call
 * `https://api.example.com`). The shapes below are therefore documented
 * assumptions, kept in one place so they are easy to correct once the real
 * API is available. Every field is treated as optional at the read boundary
 * and normalised with `??`, so a partial response degrades to empty rather
 * than crashing the page.
 */

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  phone?: string;
}

/** Reason codes the account-deletion endpoint can reject with. */
export type DeletionBlockerCode =
  | "non_zero_balance"
  | "pending_transactions"
  | "pending_withdrawals"
  | "active_subscriptions";

export interface DeletionBlocker {
  code: DeletionBlockerCode;
  /** Human-readable detail from the API, shown verbatim. */
  message: string;
}

export class AccountDeletionBlockedError extends Error {
  blockers: DeletionBlocker[];

  constructor(blockers: DeletionBlocker[]) {
    super("Account deletion is blocked");
    this.name = "AccountDeletionBlockedError";
    this.blockers = blockers;
  }
}

function toApiBase(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "/api";
  return `${base}${path}`;
}

export async function fetchProfile(): Promise<UserProfile> {
  const data = await apiRequest<Partial<UserProfile>>(
    toApiBase("/user/profile"),
  );
  return {
    id: data.id ?? "",
    email: data.email ?? "",
    firstName: data.firstName ?? null,
    lastName: data.lastName ?? null,
    phone: data.phone ?? null,
  };
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UserProfile> {
  const data = await apiRequest<Partial<UserProfile>>(
    toApiBase("/user/profile"),
    { method: "PUT", body: input },
  );
  return {
    id: data.id ?? input.firstName,
    email: data.email ?? "",
    firstName: data.firstName ?? input.firstName,
    lastName: data.lastName ?? input.lastName,
    phone: data.phone ?? input.phone ?? null,
  };
}

/**
 * Self-service account deletion.
 *
 * The typed confirmation phrase and the password are sent in the request
 * body only. Neither is placed in a URL, storage or a log.
 */
export async function deleteAccount(input: {
  confirmation: string;
  password: string;
}): Promise<void> {
  try {
    await apiRequest(toApiBase("/user/account"), {
      method: "DELETE",
      body: { confirmation: input.confirmation, password: input.password },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      const blockers = Array.isArray(err.details)
        ? (err.details as DeletionBlocker[]).filter(
            (b): b is DeletionBlocker =>
              typeof b?.code === "string" && typeof b?.message === "string",
          )
        : [];
      throw new AccountDeletionBlockedError(blockers);
    }
    throw err;
  }
}

export type ExportStatus = 'requested' | 'preparing' | 'ready' | 'expired';

export interface DataExportRequest {
  requestId: string;
  status: ExportStatus;
  downloadUrl?: string | null;
  expiresAt?: string | null;
  requestedAt?: string | null;
  canRequestAgainAt?: string | null;
}

export async function requestDataExport(password: string): Promise<DataExportRequest> {
  const data = await apiRequest<Partial<DataExportRequest>>(
    toApiBase("/user/data-export/requests"),
    { method: "POST", body: { password } },
  );
  return {
    requestId: data.requestId ?? "",
    status: (data.status as ExportStatus) ?? "requested",
    downloadUrl: data.downloadUrl ?? null,
    expiresAt: data.expiresAt ?? null,
    requestedAt: data.requestedAt ?? null,
    canRequestAgainAt: data.canRequestAgainAt ?? null,
  };
}

export async function getDataExportStatus(requestId?: string): Promise<DataExportRequest | null> {
  const path = requestId
    ? `/user/data-export/requests/${requestId}`
    : "/user/data-export/requests/latest";
  try {
    const data = await apiRequest<Partial<DataExportRequest>>(toApiBase(path));
    return {
      requestId: data.requestId ?? "",
      status: (data.status as ExportStatus) ?? "requested",
      downloadUrl: data.downloadUrl ?? null,
      expiresAt: data.expiresAt ?? null,
      requestedAt: data.requestedAt ?? null,
      canRequestAgainAt: data.canRequestAgainAt ?? null,
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}
