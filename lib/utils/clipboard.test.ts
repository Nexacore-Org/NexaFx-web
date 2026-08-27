import { describe, expect, it, vi } from "vitest";
import { copyToClipboard } from "@/lib/utils/clipboard";

describe("copyToClipboard", () => {
  it("uses navigator.clipboard.writeText when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    await expect(copyToClipboard("hello")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("falls back to execCommand when clipboard api is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });

    const execSpy = vi.fn(() => true);
    Object.defineProperty(document, "execCommand", {
      value: execSpy,
      configurable: true,
    });

    await expect(copyToClipboard("fallback")).resolves.toBe(true);
    expect(execSpy).toHaveBeenCalledWith("copy");
  });

  it("returns false when copy fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("denied")),
      },
      configurable: true,
    });

    Object.defineProperty(document, "execCommand", {
      value: vi.fn(() => false),
      configurable: true,
    });

    await expect(copyToClipboard("nope")).resolves.toBe(false);
  });
});
