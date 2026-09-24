import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useClipboard } from "@/hooks/use-clipboard";

vi.mock("@/lib/utils/clipboard", () => ({
  copyToClipboard: vi.fn(),
}));

import { copyToClipboard } from "@/lib/utils/clipboard";

describe("useClipboard", () => {
  it("toggles copied and resets after the configured delay", async () => {
    vi.useFakeTimers();
    vi.mocked(copyToClipboard).mockResolvedValue(true);

    try {
      const { result } = renderHook(() => useClipboard(1000));

      await act(async () => {
        await result.current.copy("hello");
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.copied).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
