import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
vi.mock("next-intl", () => ({ useFormatter: () => ({ dateTime: (d: Date) => d.toISOString() }) }));
import AuditLogTable from "./audit-log-table";

describe("AuditLogTable", () => {
  it("renders the empty state", () => {
    render(<AuditLogTable entries={[]} />);
    expect(screen.getByText("No audit entries found.")).toBeTruthy();
  });

  it("renders a row with actor and target", () => {
    render(
      <AuditLogTable
        entries={[{ id: "a1", actorId: "u1", actorEmail: "admin@nexafx.test", action: "user.suspend", targetType: "user", targetId: "u2", metadata: null, createdAt: "" }]}
      />,
    );
    expect(screen.getByText("admin@nexafx.test")).toBeTruthy();
    expect(screen.getByText("user.suspend")).toBeTruthy();
  });
});
