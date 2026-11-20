import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiRequest } from "./api-client";

describe("apiRequest error handling", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("reports a timed-out request as REQUEST_TIMEOUT", async () => {
    const timeoutError = new DOMException(
      "The operation was aborted due to timeout",
      "TimeoutError",
    );
    global.fetch = vi.fn().mockRejectedValue(timeoutError);

    await expect(apiRequest("/slow")).rejects.toMatchObject({
      name: "ApiError",
      code: "REQUEST_TIMEOUT",
    });
  });

  it("keeps caller-initiated aborts separate from timeouts", async () => {
    const abortError = new DOMException("The operation was aborted", "AbortError");
    global.fetch = vi.fn().mockRejectedValue(abortError);

    const error = await apiRequest("/aborted").catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).not.toBe("REQUEST_TIMEOUT");
  });

  it("reports an offline device as NETWORK_ERROR", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(apiRequest("/offline")).rejects.toMatchObject({
      name: "ApiError",
      code: "NETWORK_ERROR",
    });
  });
});
