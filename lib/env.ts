/**
 * Typed, validated access to public environment variables.
 *
 * All values are read at module initialisation time so missing variables
 * fail fast rather than producing silent `undefined` bugs at runtime.
 */

function requireEnv(key: string, fallback?: string): string {
  const value = typeof process !== "undefined" ? process.env[key] : undefined;
  if (value) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required environment variable: ${key}`);
}

/** Base URL of the NexaFx backend API (no trailing slash). */
export const API_URL = requireEnv(
  "NEXT_PUBLIC_API_URL",
  "https://nexafx-backend.onrender.com/v1",
);

/**
 * Stellar Horizon base URL. Defaults to the public mainnet endpoint.
 * Set to https://horizon-testnet.stellar.org for testnet environments.
 */
export const HORIZON_URL = requireEnv(
  "NEXT_PUBLIC_HORIZON_URL",
  "https://horizon.stellar.org",
);
