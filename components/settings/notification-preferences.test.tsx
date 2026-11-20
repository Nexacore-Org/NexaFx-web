import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type * as Api from "../../lib/api/notifications";

vi.mock("../../lib/api/notifications", async (orig) => {
  const real = await orig<typeof Api>();
  const prefs = Object.fromEntries(real.NOTIFICATION_CATEGORIES.map((c) => [c.id, { email: true, inApp: true }]));
  return { ...real, fetchNotificationPreferences: vi.fn(async () => prefs), saveNotificationPreference: vi.fn(() => new Promise(() => {})) };
});
import NotificationPreferences from "./notification-preferences";

describe("NotificationPreferences", () => {
  it("keeps focus on a switch after toggling it", async () => {
    render(<QueryClientProvider client={new QueryClient()}><NotificationPreferences /></QueryClientProvider>);
    const first = (await screen.findAllByRole("switch")).find((s) => !(s as HTMLInputElement).disabled) as HTMLInputElement;
    first.focus();
    fireEvent.click(first);
    expect(document.activeElement).toBe(first);
    expect(first.disabled).toBe(false);
  });
});
