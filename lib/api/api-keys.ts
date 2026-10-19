/**
 * API keys API — programmatic access for business accounts.
 *
 * BACKEND STATUS: the upstream backend does NOT expose API-key endpoints yet
 * (verified against the documented surface in `lib/api/*`; there is no
 * `api-keys` route, no key management in `lib/api/user.ts`, and the app has
 * no reachable backend). Because of that the developer page renders a
 * "Coming Soon" state rather than inventing keys, and everything here is
 * gated behind the `DEVELOPER_ENABLED` feature flag.
 *
 * The request shapes below document the *intended* contract so the page can
 * be switched on without further plumbing once the backend ships. Do not
 * render any of it as real data until the flag is on AND the backend exists.
 *
 *   GET    /api-keys            — list keys (name, prefix, created, last used)
 *   POST   /api-keys            — create a key; the full secret is returned ONCE
 *   DELETE /api-keys/:id        — revoke a key
 *   GET    /api-keys/usage      — aggregate request counts for the account
 */

import { apiRequest } from "@/lib/api-client";

// ---------------------------------------------------------------------------
// Feature flag
// ---------------------------------------------------------------------------

/**
 * Gates the `/developer` route, its nav entry and every call below. Off by
 * default so the route stays out of the product until the backend is ready.
 */
export const DEVELOPER_ENABLED =
  process.env.NEXT_PUBLIC_DEVELOPER_ENABLED === "true";

/**
 * A single API key as the backend would describe it. `prefix` is the only
 * part of the secret the API ever returns after creation; the full key is
 * shown exactly once, at creation time, and is never requested again.
 */
export interface ApiKey {
  id: string;
  name: string;
  /** Non-secret leading segment of the key, e.g. `nxf_live_1a2b`. */
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  scopes: string[];
}

export interface CreateApiKeyInput {
  name: string;
  scopes?: string[];
}

/**
 * Result of creating a key. `secret` is present in this response only; the
 * UI must clear it from component state as soon as the dialog closes.
 */
export interface CreatedApiKey extends ApiKey {
  secret: string;
}

export interface ApiKeyUsage {
  /** Requests made with any key in the current billing period. */
  requests: number;
  /** Start of the period the count covers (ISO date). */
  periodStart: string;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * List the account's keys. Returns an empty list when the feature flag is
 * off so callers never have to branch on the flag themselves.
 */
export async function listApiKeys(): Promise<ApiKey[]> {
  if (!DEVELOPER_ENABLED) return [];
  const json = await apiRequest<{ keys?: ApiKey[] } | ApiKey[]>("/api-keys");
  const list = Array.isArray(json) ? json : (json.keys ?? []);
  return list;
}

/**
 * Create a key. The returned `secret` is the only time the full key is
 * available; persist nothing client-side.
 */
export async function createApiKey(
  input: CreateApiKeyInput,
): Promise<CreatedApiKey> {
  return apiRequest<CreatedApiKey>("/api-keys", {
    method: "POST",
    body: input,
  });
}

/** Revoke a key. The backend stops accepting it immediately. */
export async function revokeApiKey(id: string): Promise<void> {
  await apiRequest(`/api-keys/${id}`, { method: "DELETE" });
}

export async function getApiKeyUsage(): Promise<ApiKeyUsage> {
  return apiRequest<ApiKeyUsage>("/api-keys/usage");
}

// ---------------------------------------------------------------------------
// Documentation
// ---------------------------------------------------------------------------

/**
 * Public API docs, used by the developer page's "API documentation" link.
 * Left undefined until a real public docs URL exists so we never render a
 * dead link.
 */
export const API_DOCS_URL: string | undefined = undefined;
