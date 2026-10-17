/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { SectionErrorBoundary } from "../section-error-boundary";

function Boom({ fail }: { fail: boolean }) {
  if (fail) throw new Error("boom");
  return <div>ok</div>;
}

describe("SectionErrorBoundary", () => {
  it("renders fallback on throw and recovers on retry", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { rerender } = render(
      <SectionErrorBoundary section="chart">
        <Boom fail />
      </SectionErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    rerender(
      <SectionErrorBoundary section="chart">
        <Boom fail={false} />
      </SectionErrorBoundary>,
    );
    expect(screen.getByText("ok")).toBeTruthy();
    spy.mockRestore();
  });
});
