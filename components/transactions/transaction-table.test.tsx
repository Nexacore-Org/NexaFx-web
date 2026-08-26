import { render, screen } from "@testing-library/react";
import { TransactionTable } from "./transaction-table";
import { Transaction } from "@/lib/api/transactions";

const deposit: Transaction = {
  id: "tx-1",
  type: "Deposit",
  currency: "USD",
  amount: 1000,
  amountString: "+ 1,000 USD",
  date: "01/01/2024",
  status: "Success",
  reference: "ref-1",
};

const withdraw: Transaction = {
  id: "tx-2",
  type: "Withdraw",
  currency: "NGN",
  amount: 50000,
  amountString: "- 50,000 NGN",
  date: "02/01/2024",
  status: "Failed",
  reference: "ref-2",
};

const convert: Transaction = {
  id: "tx-3",
  type: "Convert",
  currency: "USD",
  toCurrency: "NGN",
  amount: 500,
  amountString: "- 500 USD",
  date: "03/01/2024",
  status: "Success",
  reference: "ref-3",
  toAmount: 750000,
};

const allTransactions = [deposit, withdraw, convert];

const renderTable = (transactions: Transaction[]) =>
  render(
    <TransactionTable transactions={transactions} onSelectTransaction={() => {}} />
  );

// The secondary currency line lives in its own <div> inside the amount cell,
// rendered only when toAmount + toCurrency are present.
const secondaryLine = (typeLabel: string) => {
  const row = screen.getByText(typeLabel).closest("tr");
  const amountCell = row?.querySelector("td:last-child");
  return amountCell?.querySelector("div") ?? null;
};

describe("TransactionTable", () => {
  it("renders 'No transactions yet' when the list is empty", () => {
    renderTable([]);
    expect(screen.getByText("No transactions yet")).toBeInTheDocument();
  });

  it("renders the type badge (Deposit / Withdraw / Convert) correctly", () => {
    renderTable(allTransactions);
    expect(screen.getByText("Deposit")).toBeInTheDocument();
    expect(screen.getByText("Withdraw")).toBeInTheDocument();
    expect(screen.getByText("Convert")).toBeInTheDocument();
  });

  describe("status badge colour", () => {
    it("renders Success with the green colour class", () => {
      renderTable([deposit]);
      expect(screen.getByText("Success").closest("span")).toHaveClass(
        "text-green-600"
      );
    });

    it("renders Failed with the red colour class", () => {
      renderTable([withdraw]);
      expect(screen.getByText("Failed").closest("span")).toHaveClass(
        "text-red-600"
      );
    });

    it("renders Pending with the yellow colour class", () => {
      renderTable([{ ...deposit, id: "tx-4", status: "Pending" }]);
      expect(screen.getByText("Pending").closest("span")).toHaveClass(
        "text-yellow-600"
      );
    });
  });

  describe("secondary currency column", () => {
    it("shows toAmount + ' ' + toCurrency only for Convert rows", () => {
      renderTable([convert]);
      expect(screen.getByText("750,000 NGN")).toBeInTheDocument();
      expect(secondaryLine("Convert")).not.toBeNull();
    });

    it("does NOT render a secondary currency column for Deposit rows", () => {
      renderTable([deposit]);
      expect(secondaryLine("Deposit")).toBeNull();
    });

    it("does NOT render a secondary currency column for Withdraw rows", () => {
      renderTable([withdraw]);
      expect(secondaryLine("Withdraw")).toBeNull();
    });
  });

  it("never renders a hardcoded '80 USD' string", () => {
    renderTable(allTransactions);
    expect(document.body.textContent).not.toContain("80 USD");
  });
});
