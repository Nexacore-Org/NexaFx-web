let inFlightRefresh: Promise<void> | null = null;

export function configureApiClient({
  refreshToken,
  onAuthFailure,
}: {
  refreshToken: () => Promise<void>;
  onAuthFailure: () => void;
}) {
  async function handle401(requestPath: string): Promise<boolean> {
    // Don't refresh for refresh and login endpoints
    if (
      requestPath.includes("/auth/refresh") ||
      requestPath.includes("/auth/login")
    ) {
      onAuthFailure();
      return false;
    }

    // Single-flight: only one refresh at a time
    if (inFlightRefresh) {
      try {
        await inFlightRefresh;
      } catch {
        onAuthFailure();
        return false;
      }
    } else {
      inFlightRefresh = refreshToken().catch((err) => {
        inFlightRefresh = null;
        throw err;
      });
    }

    try {
      await inFlightRefresh;
    } catch {
      onAuthFailure();
      return false;
    } finally {
      inFlightRefresh = null;
    }

    // Retry the original request once with the new token
    return true;
  }

  return { handle401 };
}
