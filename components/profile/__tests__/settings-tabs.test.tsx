import React from "react";
import { render, screen } from "@testing-library/react";
import { SettingsTabs } from "../settings-tabs";

jest.mock("lucide-react", () => ({
  Lock: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-lock" {...props} />
  ),
  Bell: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-bell" {...props} />
  ),
  User: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-user" {...props} />
  ),
  ShieldCheck: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-shield" {...props} />
  ),
}));

jest.mock("@/lib/utils", () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

describe("Profile SettingsTabs", () => {
  it("renders all four tab labels", () => {
    render(<SettingsTabs />);
    expect(screen.getByText("Account Info")).toBeInTheDocument();
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.getByText("Notification")).toBeInTheDocument();
    expect(screen.getByText("Identity Verification")).toBeInTheDocument();
  });

  it("renders exactly four tab buttons", () => {
    const { container } = render(<SettingsTabs />);
    const buttons = container.querySelectorAll("nav[aria-label='Tabs'] button");
    expect(buttons).toHaveLength(4);
  });

  it("marks Identity Verification as the active tab", () => {
    render(<SettingsTabs />);
    const activeTab = screen.getByText("Identity Verification").closest("button");
    expect(activeTab).toHaveClass("border-primary");
  });

  it("marks other tabs as inactive", () => {
    render(<SettingsTabs />);
    const accountTab = screen.getByText("Account Info").closest("button");
    expect(accountTab).toHaveClass("border-transparent");
  });

  it("renders an icon next to each tab label", () => {
    render(<SettingsTabs />);
    expect(screen.getByTestId("icon-user")).toBeInTheDocument();
    expect(screen.getByTestId("icon-lock")).toBeInTheDocument();
    expect(screen.getByTestId("icon-bell")).toBeInTheDocument();
    expect(screen.getByTestId("icon-shield")).toBeInTheDocument();
  });
});
