import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TransactionPage from "./page";

vi.mock("@/lib/api/admin", () => ({
  getAdminTransactions: vi.fn(),
}));

import { getAdminTransactions } from "@/lib/api/admin";

const mockTransactions = [
  {
    id: "tx1",
    amount: 500,
    currency: "NGN",
    type: "Deposit",
    username: "alice",
    date: "01/06/2025, 10:30",
    txId: "REF001",
    status: "Success",
  },
  {
    id: "tx2",
    amount: 200,
    currency: "USD",
    type: "Withdrawal",
    username: "bob",
    date: "02/06/2025, 14:00",
    txId: "REF002",
    status: "Pending",
  },
  {
    id: "tx3",
    amount: 100,
    currency: "EUR",
    type: "Convert",
    username: "charlie",
    date: "03/06/2025, 09:15",
    txId: "REF003",
    status: "Success",
  },
];

describe("TransactionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders transaction rows", async () => {
    vi.mocked(getAdminTransactions).mockResolvedValue({
      data: mockTransactions,
      total: 3,
    });

    render(<TransactionPage />);

    await waitFor(() => {
      expect(screen.getByText("alice")).toBeInTheDocument();
    });
    expect(screen.getByText("bob")).toBeInTheDocument();
    expect(screen.getByText("charlie")).toBeInTheDocument();
  });

  it("type filter updates rows", async () => {
    vi.mocked(getAdminTransactions).mockResolvedValue({
      data: mockTransactions,
      total: 3,
    });

    render(<TransactionPage />);

    await waitFor(() => {
      expect(screen.getByText("alice")).toBeInTheDocument();
    });

    const depositButtons = screen.getAllByText("Deposit");
    fireEvent.click(depositButtons[0]);

    await waitFor(() => {
      expect(getAdminTransactions).toHaveBeenCalledWith(
        expect.objectContaining({ type: "Deposit" }),
      );
    });
  });

  it("status filter updates rows", async () => {
    vi.mocked(getAdminTransactions).mockResolvedValue({
      data: mockTransactions,
      total: 3,
    });

    render(<TransactionPage />);

    await waitFor(() => {
      expect(screen.getByText("alice")).toBeInTheDocument();
    });
  });
});
