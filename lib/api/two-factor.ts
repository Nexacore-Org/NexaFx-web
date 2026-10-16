import { apiRequest, ApiError } from "../api-client";

/**
 * NOTE: the backend 2FA endpoints are NOT confirmed. The contract below is
 * a documented assumption: a TOTP setup that returns an otpauth:// URI plus
 * a raw secret, a confirm step that exchanges a 6-digit code for backup
 * codes, and a disable step authenticated by a code or the password.
 *
 * Secrets are held in React state only. Nothing here is written to
 * localStorage, sessionStorage or cookies, and no value is put in a URL.
 */
export const TWO_FACTOR_SUPPORTED = true;

export interface TwoFactorSetup {
  /** otpauth://totp/NexaFx:user@example.com?secret=...&issuer=NexaFx */
  otpauthUri: string;
  secret: string;
}

export interface TwoFactorEnabledInfo {
  /** When 2FA was first enabled, ISO 8601. */
  enabledAt: string | null;
  /** True when backup codes remain available to regenerate. */
  backupCodesRemaining: number | null;
}

export interface TwoFactorStatus {
  enabled: boolean;
  info: TwoFactorEnabledInfo | null;
}

export interface BackupCodes {
  codes: string[];
}

export class TwoFactorInvalidCodeError extends Error {
  constructor() {
    super("That code is not valid");
    this.name = "TwoFactorInvalidCodeError";
  }
}

function isInvalidCode(err: unknown): boolean {
  return (
    err instanceof ApiError &&
    (err.status === 400 || err.status === 401 || err.status === 422)
  );
}

export async function fetchTwoFactorStatus(): Promise<TwoFactorStatus> {
  const data = await apiRequest<{
    enabled?: unknown;
    enabledAt?: unknown;
    backupCodesRemaining?: unknown;
  }>("/api/auth/2fa");

  const enabled = data.enabled === true;
  const enabledAt = typeof data.enabledAt === "string" ? data.enabledAt : null;
  const remaining =
    typeof data.backupCodesRemaining === "number"
      ? data.backupCodesRemaining
      : null;

  return {
    enabled,
    info: enabled ? { enabledAt, backupCodesRemaining: remaining } : null,
  };
}

/** Begins setup and returns the secret to render as a QR code. */
export async function beginTwoFactorSetup(): Promise<TwoFactorSetup> {
  const data = await apiRequest<{ otpauthUri?: unknown; secret?: unknown }>(
    "/api/auth/2fa/setup",
    { method: "POST" },
  );

  const otpauthUri = typeof data.otpauthUri === "string" ? data.otpauthUri : "";
  const secret = typeof data.secret === "string" ? data.secret : "";

  if (!otpauthUri || !secret) {
    throw new Error("The server did not return a 2FA setup secret");
  }

  return { otpauthUri, secret };
}

/** Confirms setup with a 6-digit code and returns the one-time backup codes. */
export async function confirmTwoFactorSetup(
  code: string,
): Promise<BackupCodes> {
  try {
    const data = await apiRequest<{ backupCodes?: unknown; codes?: unknown }>(
      "/api/auth/2fa/verify",
      { method: "POST", body: { code } },
    );

    const raw = Array.isArray(data.backupCodes)
      ? data.backupCodes
      : Array.isArray(data.codes)
        ? data.codes
        : [];

    const codes = raw.filter((c): c is string => typeof c === "string");

    if (codes.length === 0) {
      throw new Error("The server did not return backup codes");
    }

    return { codes };
  } catch (err) {
    if (isInvalidCode(err)) throw new TwoFactorInvalidCodeError();
    throw err;
  }
}

/**
 * Disables 2FA. Requires either a current TOTP code or the account
 * password, so possession of the device alone is not enough.
 */
export async function disableTwoFactor(input: {
  code?: string;
  password?: string;
}): Promise<void> {
  try {
    await apiRequest("/api/auth/2fa", {
      method: "DELETE",
      body: { code: input.code, password: input.password },
    });
  } catch (err) {
    if (isInvalidCode(err)) throw new TwoFactorInvalidCodeError();
    throw err;
  }
}

/** Issues a fresh set of backup codes, invalidating the previous ones. */
export async function regenerateBackupCodes(
  code: string,
): Promise<BackupCodes> {
  try {
    const data = await apiRequest<{ backupCodes?: unknown; codes?: unknown }>(
      "/api/auth/2fa/backup-codes",
      { method: "POST", body: { code } },
    );

    const raw = Array.isArray(data.backupCodes)
      ? data.backupCodes
      : Array.isArray(data.codes)
        ? data.codes
        : [];

    const codes = raw.filter((c): c is string => typeof c === "string");

    if (codes.length === 0) {
      throw new Error("The server did not return backup codes");
    }

    return { codes };
  } catch (err) {
    if (isInvalidCode(err)) throw new TwoFactorInvalidCodeError();
    throw err;
  }
}
