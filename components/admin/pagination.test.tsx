import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminPagination, { pageHref } from "./pagination";
import { buildTransactionsCsv } from "./transactions-table";

describe("AdminPagination", () => {
  it("disables Previous on page 1 and Next on the last page", () => {
    render(<AdminPagination basePath="/admin/audit" params={{}} page={1} totalPages={1} />);
    expect(screen.getByText("Previous").getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByText("Next").getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeTruthy();
  });

  it("builds hrefs with URLSearchParams and keeps filters", () => {
    expect(pageHref("/admin/transactions", { search: "a b", type: "", page: "3" }, 2)).toBe(
      "/admin/transactions?search=a+b&page=2",
    );
  });
});

describe("buildTransactionsCsv", () => {
  it("neutralises formula-prefixed cells", () => {
    const csv = buildTransactionsCsv([
      { id: "1", reference: "=HYPERLINK(1)", type: "deposit", amount: "1", currency: "NGN", status: "ok", createdAt: "", counterparty: "@x" },
    ]);
    expect(csv).toContain(`"'=HYPERLINK(1)"`);
    expect(csv).toContain(`"'@x"`);
  });
});
