import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { RevenueChart } from "@/components/admin/RevenueChart";

describe("RevenueChart", () => {
  it("renders without crashing", () => {
    const { container } = render(<RevenueChart />);
    expect(container).toBeDefined();
  });
});
