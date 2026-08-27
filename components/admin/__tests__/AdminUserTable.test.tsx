import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminUserTable } from "@/components/admin/AdminUserTable";
import type { AdminUser } from "@/lib/api/admin";

const mockUsers: AdminUser[] = [
  {
    id: "1",
    email: "alice@example.com",
    firstName: "Alice",
    lastName: "Smith",
    phone: "+1234567890",
    walletAddress: "0x123",
    username: "alice",
    avatarUrl: null,
    transactions: 5,
    totalDeposit: 1000,
    totalWithdraw: 200,
    kycStatus: "Verified",
    createdAt: "Jan 15, 2025",
    isActive: true,
  },
  {
    id: "2",
    email: "bob@example.com",
    firstName: null,
    lastName: null,
    phone: null,
    walletAddress: "0x456",
    username: "bob",
    avatarUrl: null,
    transactions: 2,
    totalDeposit: 500,
    totalWithdraw: 50,
    kycStatus: "Unverified",
    createdAt: "Feb 20, 2025",
    isActive: false,
  },
];

describe("AdminUserTable", () => {
  it("renders user rows from data", () => {
    render(<AdminUserTable users={mockUsers} onUserClick={vi.fn()} />);
    expect(screen.getByText("alice@example.com")).toBeDefined();
    expect(screen.getByText("Alice Smith")).toBeDefined();
    expect(screen.getByText("bob@example.com")).toBeDefined();
  });

  it("shows empty state when no data", () => {
    render(<AdminUserTable users={[]} onUserClick={vi.fn()} />);
    expect(screen.getByText("No users found.")).toBeDefined();
  });

  it("handles selection", () => {
    const onUserClick = vi.fn();
    render(<AdminUserTable users={mockUsers} onUserClick={onUserClick} />);
    fireEvent.click(screen.getByText("alice@example.com"));
    expect(onUserClick).toHaveBeenCalledWith(mockUsers[0]);
  });
});
