import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
vi.mock("next-intl", () => ({ useFormatter: () => ({ dateTime: (d: Date) => d.toISOString() }) }));
import TransactionsTable from "./transactions-table";

const row = { id: "t1", reference: "REF-1", type: "deposit", amount: "10", currency: "NGN", status: "completed", createdAt: "", counterparty: null };

describe("TransactionsTable", () => {
  it("renders the empty state", () => {
    render(<TransactionsTable transactions={[]} />);
    expect(screen.getByText("No transactions found.")).toBeTruthy();
  });

  it("renders rows linking to the detail page", () => {
    render(<TransactionsTable transactions={[row]} />);
    expect(screen.getByRole("link", { name: "REF-1" }).getAttribute("href")).toBe("/admin/transactions/t1");
    expect(screen.getByText("10 NGN")).toBeTruthy();
  });
});
