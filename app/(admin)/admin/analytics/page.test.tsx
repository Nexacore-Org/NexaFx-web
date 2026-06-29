import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AnalyticsPage from "./page";

vi.mock("@/lib/api/admin", () => ({
  getAdminMetrics: vi.fn(),
  getAdminUsers: vi.fn(),
}));

import { getAdminMetrics, getAdminUsers } from "@/lib/api/admin";

describe("AnalyticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    vi.mocked(getAdminMetrics).mockReturnValue(new Promise(() => {}));
    vi.mocked(getAdminUsers).mockReturnValue(new Promise(() => {}));
    render(<AnalyticsPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders metric values from API", async () => {
    vi.mocked(getAdminMetrics).mockResolvedValue({
      registeredUsers: 150,
      totalTransactions: 3200,
      pendingKyc: 12,
      currencies: 4,
      totalDeposits: 500000,
      totalWithdrawals: 200000,
    });
    vi.mocked(getAdminUsers).mockResolvedValue({ data: [], total: 0 });

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("150")).toBeInTheDocument();
    });
    expect(screen.getByText("3,200")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("shows error state on failure", async () => {
    vi.mocked(getAdminMetrics).mockRejectedValue(new Error("Server error"));
    vi.mocked(getAdminUsers).mockRejectedValue(new Error("Server error"));

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("Error Loading Analytics")).toBeInTheDocument();
    });
  });
});
