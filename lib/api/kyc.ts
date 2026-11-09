import { apiRequest, ApiError } from "../api-client";

/**
 * NOTE: the backend KYC contract is NOT confirmed. The app has no reachable
 * backend, so the shapes below are documented assumptions kept in this
 * module. Every field is normalised at the read boundary with `??`, so a
 * partial response renders a correct-but-partial page instead of crashing.
 *
 * Nothing in this module or its callers puts a BVN or NIN into a URL, into
 * storage, or into a log. Identity numbers travel in a POST body only.
 */

export type KycStatus = "not_started" | "pending" | "approved" | "rejected";

export const KYC_STATUSES: KycStatus[] = [
  "not_started",
  "pending",
  "approved",
  "rejected",
];

export interface KycTierLimits {
  /** Per-transaction ceiling in the account's base currency, if provided. */
  perTransaction?: number;
  perDay?: number;
  perMonth?: number;
}

export interface KycTier {
  id: string;
  label: string;
  /** Null when the API does not publish limits for this tier. */
  limits: KycTierLimits | null;
}

export interface KycStatusResponse {
  status: KycStatus;
  /** Present when `status` is `rejected`; shown to the user verbatim. */
  rejectionReason: string | null;
  /** True when the API has published limits; the table is hidden if false. */
  limitsAvailable: boolean;
  tiers: KycTier[];
  /** Null unless a verification method is currently required. */
  requiredMethod: "bvn" | "nin" | "document" | null;
}

export interface KycDocumentUpload {
  kind: "identity" | "selfie" | "proof_of_address";
  file: File;
  signal?: AbortSignal;
}

/** Progress 0-100, or null when the request has no readable stream. */
export type UploadProgress = (percent: number | null) => void;

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function normaliseKycStatus(raw: unknown): KycStatusResponse {
  const empty: KycStatusResponse = {
    status: "not_started",
    rejectionReason: null,
    limitsAvailable: false,
    tiers: [],
    requiredMethod: null,
  };

  if (!raw || typeof raw !== "object") return empty;
  const data = raw as Record<string, unknown>;

  const status = KYC_STATUSES.includes(data.status as KycStatus)
    ? (data.status as KycStatus)
    : "not_started";

  const rawTiers = Array.isArray(data.tiers) ? data.tiers : [];
  const tiers: KycTier[] = rawTiers.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const tier = entry as Record<string, unknown>;
    const id = str(tier.id);
    if (!id) return [];

    // Limits are only rendered when the API actually sent numbers; nothing is
    // inferred or invented.
    const perTransaction = num(tier.perTransaction);
    const perDay = num(tier.perDay);
    const perMonth = num(tier.perMonth);
    const hasAny = [perTransaction, perDay, perMonth].some(
      (v) => v !== undefined,
    );

    return [
      {
        id,
        label: str(tier.label) ?? id,
        limits: hasAny ? { perTransaction, perDay, perMonth } : null,
      },
    ];
  });

  const requiredMethod = ["bvn", "nin", "document"].includes(
    data.requiredMethod as string,
  )
    ? (data.requiredMethod as KycStatusResponse["requiredMethod"])
    : null;

  return {
    status,
    rejectionReason: status === "rejected" ? str(data.rejectionReason) : null,
    limitsAvailable: data.limitsAvailable === true,
    tiers,
    requiredMethod,
  };
}

export async function fetchKycStatus(): Promise<KycStatusResponse> {
  const data = await apiRequest<unknown>("/api/kyc/status");
  return normaliseKycStatus(data);
}

export async function submitBvn(bvn: string): Promise<KycStatusResponse> {
  try {
    const data = await apiRequest<unknown>("/api/kyc/bvn", {
      method: "POST",
      body: { bvn },
    });
    return normaliseKycStatus(data);
  } catch (err) {
    throw mapIdentityError(err);
  }
}

export async function submitNin(nin: string): Promise<KycStatusResponse> {
  try {
    const data = await apiRequest<unknown>("/api/kyc/nin", {
      method: "POST",
      body: { nin },
    });
    return normaliseKycStatus(data);
  } catch (err) {
    throw mapIdentityError(err);
  }
}

/**
 * Failure modes for identity-number verification that need specific user
 * guidance, rather than a generic "something went wrong".
 */
export type IdentityErrorReason =
  | "mismatch"
  | "provider_unavailable"
  | "already_verified"
  | "rejected"
  | "unknown";

export class IdentityVerificationError extends Error {
  reason: IdentityErrorReason;

  constructor(reason: IdentityErrorReason, message: string) {
    super(message);
    this.name = "IdentityVerificationError";
    this.reason = reason;
  }
}

/**
 * True when the user should be offered the document-upload fallback. Provider
 * outages and outright rejections both fall back, because the user still has
 * a route to verification either way.
 */
export function offersDocumentFallback(err: unknown): boolean {
  return (
    err instanceof IdentityVerificationError &&
    (err.reason === "provider_unavailable" || err.reason === "rejected")
  );
}

/**
 * Map backend failures onto specific guidance. The number itself is never
 * echoed back or included in any message.
 */
function mapIdentityError(err: unknown): never {
  if (err instanceof ApiError) {
    const code = err.code ?? "";

    if (code === "IDENTITY_MISMATCH" || err.status === 422) {
      throw new IdentityVerificationError(
        "mismatch",
        "The name or date of birth on this record does not match your NexaFx account.",
      );
    }
    if (
      code === "PROVIDER_UNAVAILABLE" ||
      code === "SERVICE_UNAVAILABLE" ||
      err.status === 502 ||
      err.status === 503 ||
      err.status === 504
    ) {
      throw new IdentityVerificationError(
        "provider_unavailable",
        "Our verification provider is unavailable right now.",
      );
    }
    if (code === "ALREADY_VERIFIED" || err.status === 409) {
      throw new IdentityVerificationError(
        "already_verified",
        "This identity number has already been used to verify an account.",
      );
    }
    if (err.status === 400 || err.status === 403) {
      throw new IdentityVerificationError(
        "rejected",
        "That identity number could not be verified.",
      );
    }
  }

  throw new IdentityVerificationError(
    "unknown",
    "We could not verify that number right now.",
  );
}

function combineWithTimeout(
  signal?: AbortSignal,
  timeoutMs: number = 60_000,
): { signal: AbortSignal; cleanup: () => void } {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);

  if (!signal) {
    return { signal: timeoutSignal, cleanup: () => {} };
  }

  if (typeof AbortSignal.any === "function") {
    return {
      signal: AbortSignal.any([signal, timeoutSignal]),
      cleanup: () => {},
    };
  }

  const controller = new AbortController();
  const onCallerAbort = () => controller.abort(signal.reason);
  const onTimeout = () => controller.abort(timeoutSignal.reason);

  if (signal.aborted) {
    controller.abort(signal.reason);
  } else if (timeoutSignal.aborted) {
    controller.abort(timeoutSignal.reason);
  } else {
    signal.addEventListener("abort", onCallerAbort, { once: true });
    timeoutSignal.addEventListener("abort", onTimeout, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      signal.removeEventListener("abort", onCallerAbort);
      timeoutSignal.removeEventListener("abort", onTimeout);
    },
  };
}

/**
 * Upload one KYC document as multipart/form-data with timeout and cancellation.
 */
export async function uploadKycDocument({
  kind,
  file,
  signal,
}: KycDocumentUpload): Promise<{
  id: string;
}> {
  const form = new FormData();
  form.append("kind", kind);
  form.append("file", file);

  const { signal: combinedSignal, cleanup } = combineWithTimeout(signal, 60_000);

  try {
    const response = await fetch("/api/kyc/documents", {
      method: "POST",
      body: form,
      credentials: "include",
      signal: combinedSignal,
    });

    if (!response.ok) {
      let errorCode: string | null = null;
      let errorMessage = `Upload failed with status ${response.status}`;
      let details: unknown = null;

      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await response.json();
          errorCode = errData?.code ?? null;
          errorMessage = errData?.message ?? errorMessage;
          details = errData;
        } else {
          const text = await response.text();
          details = text.slice(0, 200);
          if (text) {
            errorMessage = text.slice(0, 100);
          }
        }
      } catch {
        // Ignore error body parse failures
      }

      throw new ApiError({
        status: response.status,
        code: errorCode,
        message: errorMessage,
        details,
        isNetworkError: false,
      });
    }

    let data: { id?: unknown };
    try {
      data = (await response.json()) as { id?: unknown };
    } catch (err) {
      throw new ApiError({
        status: response.status,
        code: "INVALID_JSON_RESPONSE",
        message: "Server returned invalid JSON response for document upload.",
        details: err instanceof Error ? err.message : null,
        isNetworkError: false,
      });
    }

    if (typeof data.id !== "string" || data.id.trim() === "") {
      throw new ApiError({
        status: response.status,
        code: "MISSING_DOCUMENT_ID",
        message:
          "Document upload completed but server did not return a valid document ID.",
        details: data,
        isNetworkError: false,
      });
    }

    return { id: data.id };
  } catch (err) {
    if (
      (err instanceof DOMException && err.name === "TimeoutError") ||
      (err instanceof Error && err.name === "TimeoutError")
    ) {
      throw new ApiError({
        status: 408,
        code: "UPLOAD_TIMEOUT",
        message: "Upload timed out after 60 seconds.",
        details: null,
        isNetworkError: true,
      });
    }
    throw err;
  } finally {
    cleanup();
  }
}

export async function submitKycDocuments(input: {
  documentIds: string[];
}): Promise<KycStatusResponse> {
  const data = await apiRequest<unknown>("/api/kyc/documents/submit", {
    method: "POST",
    body: input,
  });
  return normaliseKycStatus(data);
}
