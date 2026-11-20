import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => ({ justNow: "just now", unknownDevice: "Unknown device", unknownTime: "Unknown time" })[key] ?? key,
}));
vi.mock("../../lib/notify", () => ({ notify: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));
vi.mock("../../lib/api/sessions", () => ({
  SESSIONS_SUPPORTED: true,
  fetchSessions: vi.fn(async () => [
    { id: "s1", device: "Pixel", browser: "Chrome", location: null, lastActiveAt: new Date().toISOString(), createdAt: null, current: true },
    { id: "s2", device: "iPhone", browser: "Safari", location: null, lastActiveAt: new Date().toISOString(), createdAt: null, current: false },
  ]),
  revokeSession: vi.fn(async () => { throw new Error("nope"); }),
  revokeOtherSessions: vi.fn(),
}));
import ActiveSessions, { formatRelative } from "./active-sessions";

describe("ActiveSessions", () => {
  it("restores a session row when revoke fails", async () => {
    render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><ActiveSessions /></QueryClientProvider>);
    fireEvent.click(await screen.findByRole("button", { name: "Sign out" }));
    await waitFor(() => expect(screen.getByText("iPhone on Safari")).toBeTruthy());
  });

  it("formats relative time in the given locale", () => {
    const now = Date.parse("2026-10-17T12:00:00Z");
    expect(formatRelative("2026-10-17T11:59:50Z", now, "fr", "à l'instant")).toBe("à l'instant");
    expect(formatRelative("2026-10-16T12:00:00Z", now, "fr")).toBe("hier");
  });
});
