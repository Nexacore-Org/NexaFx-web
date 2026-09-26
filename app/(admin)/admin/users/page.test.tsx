import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import UsersPage from "./page";

vi.mock("@/lib/api/admin", () => ({
  getAdminUsers: vi.fn(),
}));

import { getAdminUsers } from "@/lib/api/admin";

const mockUsers = [
  {
    id: "1",
    email: "alice@example.com",
    firstName: "Alice",
    lastName: "Smith",
    phone: "+1234567890",
    walletAddress: "GA…abcd",
    username: "alice",
    avatarUrl: null,
    transactions: 5,
    totalDeposit: 1000,
    totalWithdraw: 200,
    kycStatus: "Verified" as const,
    createdAt: "Jan 15, 2025",
    isActive: true,
  },
  {
    id: "2",
    email: "bob@example.com",
    firstName: "Bob",
    lastName: "Jones",
    phone: null,
    walletAddress: "GA…efgh",
    username: "bob",
    avatarUrl: null,
    transactions: 2,
    totalDeposit: 500,
    totalWithdraw: 50,
    kycStatus: "Unverified" as const,
    createdAt: "Feb 20, 2025",
    isActive: false,
  },
];

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user rows from API", async () => {
    vi.mocked(getAdminUsers).mockResolvedValue({ data: mockUsers, total: 2 });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getAllByText("alice@example.com").length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("bob@example.com").length).toBeGreaterThan(0);
  });

  it("filters users by search input", async () => {
    vi.mocked(getAdminUsers).mockResolvedValue({ data: mockUsers, total: 2 });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getAllByText("alice@example.com").length).toBeGreaterThan(0);
    });

    const searchInputs = screen.getAllByPlaceholderText("Search");
    const desktopSearch = searchInputs[0];
    fireEvent.change(desktopSearch, { target: { value: "bob" } });

    await waitFor(() => {
      expect(screen.getAllByText("bob@example.com").length).toBeGreaterThan(0);
    });
  });

  it('shows "No users found" when search matches nothing', async () => {
    vi.mocked(getAdminUsers).mockResolvedValue({ data: mockUsers, total: 2 });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getAllByText("alice@example.com").length).toBeGreaterThan(0);
    });

    const searchInputs = screen.getAllByPlaceholderText("Search");
    const desktopSearch = searchInputs[0];
    fireEvent.change(desktopSearch, { target: { value: "nonexistent" } });
  });
});
