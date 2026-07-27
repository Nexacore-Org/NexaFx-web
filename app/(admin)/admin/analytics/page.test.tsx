import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AnalyticsPage from "./page";

vi.mock("@/lib/api/admin", () => ({
  getAdminMetrics: vi.fn(),
  getAdminUsers: vi.fn(),
  getCohortRetention: vi.fn(),
}));

import { getAdminMetrics, getAdminUsers, getCohortRetention } from "@/lib/api/admin";

describe("AnalyticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCohortRetention).mockResolvedValue([]);
  });

  it("shows loading state initially", () => {
    vi.mocked(getAdminMetrics).mockReturnValue(new Promise(() => {}));
    vi.mocked(getAdminUsers).mockReturnValue(new Promise(() => {}));
    vi.mocked(getCohortRetention).mockReturnValue(new Promise(() => {}));
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

  it("renders cohort retention data from API", async () => {
    vi.mocked(getAdminMetrics).mockResolvedValue({
      registeredUsers: 150,
      totalTransactions: 3200,
      pendingKyc: 12,
      currencies: 4,
      totalDeposits: 500000,
      totalWithdrawals: 200000,
    });
    vi.mocked(getAdminUsers).mockResolvedValue({ data: [], total: 0 });
    vi.mocked(getCohortRetention).mockResolvedValue([
      {
        cohortMonth: "2025-01",
        cohortSize: 420,
        retentionByMonth: [100, 72, 58],
      },
    ]);

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("Cohort Retention")).toBeInTheDocument();
    });
    expect(screen.getByText("Jan 2025")).toBeInTheDocument();
    expect(screen.getByTitle("72% of Jan 2025 users were active in Month 2")).toBeInTheDocument();
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
