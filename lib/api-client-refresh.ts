const SKIP_REFRESH_PATHS = ["/auth/refresh", "/auth/login"];

/**
 * Whether a request path should never trigger an automatic token refresh.
 * Auth endpoints that legitimately return 401 for bad credentials are
 * excluded so a failed login/refresh does not recurse or log the user out.
 */
export function shouldSkipRefresh(path: string): boolean {
  return SKIP_REFRESH_PATHS.some((skip) => path.includes(skip));
}

/**
 * Attempt to refresh the access token. Returns true when a new token was
 * obtained, false otherwise. On failure the auth-failure handler is invoked
 * so the app can log the user out.
 */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      onAuthFailure();
      return false;
    }

    return true;
  } catch {
    onAuthFailure();
    return false;
  }
}

function onAuthFailure(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:failure"));
  }
}
