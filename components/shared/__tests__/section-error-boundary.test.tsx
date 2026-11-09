import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SectionErrorBoundary } from "../section-error-boundary";

function Boom({ fail }: { fail: boolean }) {
  if (fail) throw new Error("boom");
  return <div>ok</div>;
}

describe("SectionErrorBoundary", () => {
  it("renders fallback on throw and recovers on retry", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { rerender } = render(
      <SectionErrorBoundary section="chart">
        <Boom fail />
      </SectionErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeTruthy();
    rerender(
      <SectionErrorBoundary section="chart">
        <Boom fail={false} />
      </SectionErrorBoundary>,
    );
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(screen.getByText("ok")).toBeTruthy();
    spy.mockRestore();
  });
});
