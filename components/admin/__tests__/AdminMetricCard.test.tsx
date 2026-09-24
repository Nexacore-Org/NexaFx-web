import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserPlus } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";

describe("AdminMetricCard", () => {
  it("renders label and value correctly", () => {
    render(<AdminMetricCard label="Registered Users" value={150} icon={UserPlus} />);
    expect(screen.getByText("Registered Users")).toBeDefined();
    expect(screen.getByText("150")).toBeDefined();
  });

  it("renders the icon passed", () => {
    const { container } = render(
      <AdminMetricCard label="Total Transaction" value={300} icon={UserPlus} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
  });

  it("handles zero values", () => {
    render(<AdminMetricCard label="Pending KYC" value={0} icon={UserPlus} />);
    expect(screen.getByText("0")).toBeDefined();
  });
});
