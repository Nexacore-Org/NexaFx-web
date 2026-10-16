import { setUnauthorizedHandler } from "./api-client";

let inFlightRefresh: Promise<void> | null = null;

/**
 * Wires the API client's 401 handling to the auth layer.
 *
 * When a request fails with 401 the registered handler performs a single-flight
 * token refresh. If the refresh succeeds the original request is retried once;
 * if it fails (or the failing request *is* the refresh/login call) auth failure
 * is reported so the UI can prompt the user to sign in again.
 */
export function configureApiClient({
  refreshToken,
  onAuthFailure,
}: {
  refreshToken: () => Promise<void>;
  onAuthFailure: () => void;
}) {
  async function handle401(requestPath: string): Promise<boolean> {
    // Don't attempt to refresh the refresh/login endpoints themselves.
    if (
      requestPath.includes("/auth/refresh") ||
      requestPath.includes("/auth/login")
    ) {
      onAuthFailure();
      return false;
    }

    // Single-flight: only one refresh at a time, others await the same promise.
    if (!inFlightRefresh) {
      inFlightRefresh = refreshToken().finally(() => {
        inFlightRefresh = null;
      });
    }

    try {
      await inFlightRefresh;
      return true;
    } catch {
      onAuthFailure();
      return false;
    }
  }

  setUnauthorizedHandler(handle401);

  return { handle401 };
}
