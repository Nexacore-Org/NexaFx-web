import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AnalyticsPage from "./page";

vi.mock("@/lib/api/admin", () => ({
  getAdminMetrics: vi.fn(),
  getAdminTransactions: vi.fn(),
  getAdminUsers: vi.fn(),
  getCohortRetention: vi.fn(),
}));

import { getAdminMetrics, getAdminTransactions, getAdminUsers, getCohortRetention } from "@/lib/api/admin";

describe("AnalyticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCohortRetention).mockResolvedValue([]);
    vi.mocked(getAdminTransactions).mockResolvedValue({ data: [], total: 0 });
  });

  it("shows loading state initially", () => {
    vi.mocked(getAdminMetrics).mockReturnValue(new Promise(() => {}));
    vi.mocked(getAdminUsers).mockReturnValue(new Promise(() => {}));
    vi.mocked(getCohortRetention).mockReturnValue(new Promise(() => {}));
    vi.mocked(getAdminTransactions).mockReturnValue(new Promise(() => {}));
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

  it("renders detected transaction anomalies", async () => {
    vi.mocked(getAdminMetrics).mockResolvedValue({
      registeredUsers: 150,
      totalTransactions: 3200,
      pendingKyc: 12,
      currencies: 4,
      totalDeposits: 500000,
      totalWithdrawals: 200000,
    });
    vi.mocked(getAdminUsers).mockResolvedValue({ data: [], total: 0 });
    vi.mocked(getAdminTransactions).mockResolvedValue({
      total: 3,
      data: [
        {
          id: "tx-1",
          userId: "user-1",
          amount: 100,
          currency: "NGN",
          type: "deposit",
          username: "user@example.com",
          date: "2026-07-25T10:00:00.000Z",
          createdAt: "2026-07-25T10:00:00.000Z",
          txId: "ref-1",
          status: "Completed",
        },
        {
          id: "tx-2",
          userId: "user-1",
          amount: 100,
          currency: "NGN",
          type: "deposit",
          username: "user@example.com",
          date: "2026-07-25T11:00:00.000Z",
          createdAt: "2026-07-25T11:00:00.000Z",
          txId: "ref-2",
          status: "Completed",
        },
        {
          id: "tx-3",
          userId: "user-1",
          amount: 5000,
          currency: "NGN",
          type: "deposit",
          username: "user@example.com",
          date: "2026-07-25T12:00:00.000Z",
          createdAt: "2026-07-25T12:00:00.000Z",
          txId: "ref-3",
          status: "Completed",
        },
      ],
    });

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("Transaction Anomalies")).toBeInTheDocument();
    });
    expect(screen.getByText("Anomalies this week")).toBeInTheDocument();
    expect(screen.getByText("3x above user average")).toBeInTheDocument();
    expect(screen.getByText("Review transaction")).toBeInTheDocument();
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
