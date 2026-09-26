import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TabsSettings } from "../tabs";

jest.mock("@/components/icons", () => ({
  AccountIcon: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-account" {...props} />
  ),
  SecurityIcon: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-security" {...props} />
  ),
  IdentityIcon: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-identity" {...props} />
  ),
}));

jest.mock("@/components/settings/account-info", () => ({
  AccountInfo: () => <div data-testid="account-info-panel">Account Info Content</div>,
}));

jest.mock("@/components/settings/security", () => ({
  Security: () => <div data-testid="security-panel">Security Content</div>,
}));

jest.mock("@/components/settings/notification", () => ({
  Notification: () => <div data-testid="notification-panel">Notification Content</div>,
}));

jest.mock("@/components/profile/profile-overview", () => ({
  ProfileOverview: () => <div data-testid="profile-overview-panel">Profile Overview</div>,
}));

jest.mock("@/components/profile/personal-info", () => ({
  PersonalInfo: () => <div data-testid="personal-info-panel">Personal Info</div>,
}));

jest.mock("@/components/profile/verification-banner", () => ({
  VerificationBanner: () => <div data-testid="verification-banner-panel">Verification Banner</div>,
}));

jest.mock("@/components/profile/faq-section", () => ({
  FAQSection: () => <div data-testid="faq-section-panel">FAQ Section</div>,
}));

jest.mock("@/components/ui/tabs", () => {
  const React = require("react");
  return {
    Tabs: ({ children, defaultValue, onValueChange, ...props }: any) => {
      const [active, setActive] = React.useState(defaultValue);
      const handleChange = (val: string) => {
        setActive(val);
        onValueChange?.(val);
      };
      return (
        <div data-testid="tabs-root" data-value={active} {...props}>
          {typeof children === "function"
            ? children({ activeValue: active, onChange: handleChange })
            : React.Children.map(children, (child: any) =>
                React.cloneElement(child, { _activeValue: active, _onChange: handleChange })
              )}
        </div>
      );
    },
    TabsList: ({ children, ...props }: any) => (
      <div data-testid="tabs-list" {...props}>
        {children}
      </div>
    ),
    TabsTrigger: ({ children, value, _activeValue, _onChange, ...props }: any) => (
      <button
        data-testid={`tab-trigger-${value}`}
        data-state={_activeValue === value ? "active" : "inactive"}
        onClick={() => _onChange?.(value)}
        {...props}
      >
        {children}
      </button>
    ),
    TabsContent: ({ children, value, _activeValue, ...props }: any) => {
      if (_activeValue !== value) return null;
      return (
        <div data-testid={`tab-content-${value}`} {...props}>
          {children}
        </div>
      );
    },
  };
});

describe("Settings TabsSettings", () => {
  it("renders all four tab triggers", () => {
    render(<TabsSettings />);
    expect(screen.getByText("Account Info")).toBeInTheDocument();
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.getByText("Notification")).toBeInTheDocument();
    expect(screen.getByText("Identity Verification")).toBeInTheDocument();
  });

  it("defaults to the account tab", () => {
    render(<TabsSettings />);
    expect(screen.getByTestId("tab-content-account")).toBeInTheDocument();
    expect(screen.queryByTestId("tab-content-security")).not.toBeInTheDocument();
  });

  it("shows account info panel by default", () => {
    render(<TabsSettings />);
    expect(screen.getByTestId("account-info-panel")).toBeInTheDocument();
  });

  it("switches to security tab when clicked", () => {
    render(<TabsSettings />);
    fireEvent.click(screen.getByTestId("tab-trigger-security"));
    expect(screen.getByTestId("security-panel")).toBeInTheDocument();
    expect(screen.queryByTestId("account-info-panel")).not.toBeInTheDocument();
  });

  it("switches to notification tab when clicked", () => {
    render(<TabsSettings />);
    fireEvent.click(screen.getByTestId("tab-trigger-notification"));
    expect(screen.getByTestId("notification-panel")).toBeInTheDocument();
  });

  it("switches to identity tab and shows identity content", () => {
    render(<TabsSettings />);
    fireEvent.click(screen.getByTestId("tab-trigger-identity"));
    expect(screen.getByTestId("profile-overview-panel")).toBeInTheDocument();
    expect(screen.getByTestId("personal-info-panel")).toBeInTheDocument();
    expect(screen.getByTestId("verification-banner-panel")).toBeInTheDocument();
    expect(screen.getByTestId("faq-section-panel")).toBeInTheDocument();
  });

  it("renders icons in tab triggers", () => {
    render(<TabsSettings />);
    expect(screen.getByTestId("icon-account")).toBeInTheDocument();
    expect(screen.getByTestId("icon-security")).toBeInTheDocument();
    expect(screen.getByTestId("icon-identity")).toBeInTheDocument();
  });
});
