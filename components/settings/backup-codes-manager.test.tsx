import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../../lib/api/two-factor", async (orig) => ({
  ...(await orig<typeof import("../../lib/api/two-factor")>()),
  fetchTwoFactorStatus: vi.fn(async () => ({ enabled: true, info: { enabledAt: "2026-10-01T00:00:00Z", backupCodesRemaining: 2 } })),
  regenerateBackupCodes: vi.fn(async () => ({ codes: ["aaaa-1111", "bbbb-2222"] })),
}));
import BackupCodesManager from "./backup-codes-manager";

describe("BackupCodesManager", () => {
  it("shows remaining codes, warns when low and regenerates", async () => {
    render(<QueryClientProvider client={new QueryClient()}><BackupCodesManager /></QueryClientProvider>);
    expect(await screen.findByText("2 backup codes remaining")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toMatch(/running low/);
    fireEvent.click(screen.getByRole("button", { name: "Regenerate backup codes" }));
    fireEvent.change(screen.getByLabelText("Authenticator code"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Regenerate" }));
    expect(await screen.findByText("aaaa-1111")).toBeTruthy();
  });
});
