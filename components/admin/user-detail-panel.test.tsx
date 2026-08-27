import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { UserDetailPanel } from "./user-detail-panel";

vi.mock("@/lib/api/admin", () => ({
  getAdminUser: vi.fn(),
}));

import { getAdminUser } from "@/lib/api/admin";

const mockUser = {
  id: "user-1",
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  phone: "+1234567890",
  walletAddress: "GA…WXYZ",
  username: "janedoe",
  avatarUrl: null,
  transactions: 10,
  totalDeposit: 5000,
  totalWithdraw: 1000,
  kycStatus: "Verified" as const,
  createdAt: "Mar 10, 2025",
  isActive: true,
};

describe("UserDetailPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user details", async () => {
    vi.mocked(getAdminUser).mockResolvedValue(mockUser);

    render(<UserDetailPanel userId="user-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("+1234567890")).toBeInTheDocument();
  });

  it("renders user financial details", async () => {
    vi.mocked(getAdminUser).mockResolvedValue(mockUser);

    render(<UserDetailPanel userId="user-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Transactions")).toBeInTheDocument();
    });
    expect(screen.getByText("10")).toBeInTheDocument();
  });
});
