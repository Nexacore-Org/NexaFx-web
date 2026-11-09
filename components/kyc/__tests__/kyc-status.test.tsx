import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { KycStatusView, formatLimitCurrency } from "../kyc-status";
import { normaliseKycStatus } from "@/lib/api/kyc";
import * as kycApi from "@/lib/api/kyc";

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("normaliseKycStatus", () => {
  it("normalises currency and upper-cases it", () => {
    const raw = {
      status: "approved",
      currency: "ngn",
      tiers: [],
    };
    const normalised = normaliseKycStatus(raw);
    expect(normalised.currency).toBe("NGN");
  });

  it("falls back to baseCurrency or accountCurrency or defaults to USD", () => {
    expect(normaliseKycStatus({ baseCurrency: "eur" }).currency).toBe("EUR");
    expect(normaliseKycStatus({ accountCurrency: "gbp" }).currency).toBe("GBP");
    expect(normaliseKycStatus({}).currency).toBe("USD");
  });

  it("identifies and marks the active current tier", () => {
    const raw = {
      status: "approved",
      currency: "NGN",
      currentTierId: "tier_2",
      limitsAvailable: true,
      tiers: [
        {
          id: "tier_1",
          label: "Tier 1 (Basic)",
          perDay: 50000,
        },
        {
          id: "tier_2",
          label: "Tier 2 (Standard)",
          perDay: 500000,
        },
      ],
    };

    const normalised = normaliseKycStatus(raw);
    expect(normalised.currentTierId).toBe("tier_2");
    expect(normalised.tiers[0].isCurrent).toBe(false);
    expect(normalised.tiers[1].isCurrent).toBe(true);
  });

  it("handles tier.current / tier.isCurrent boolean flags", () => {
    const raw = {
      status: "approved",
      limitsAvailable: true,
      tiers: [
        {
          id: "t1",
          label: "Tier 1",
          isCurrent: true,
          perDay: 1000,
        },
      ],
    };

    const normalised = normaliseKycStatus(raw);
    expect(normalised.tiers[0].isCurrent).toBe(true);
  });
});

describe("formatLimitCurrency", () => {
  it("formats currency using Intl.NumberFormat", () => {
    const formattedUsd = formatLimitCurrency(1000, "USD", "en-US");
    expect(formattedUsd).toContain("1,000");

    const formattedNgn = formatLimitCurrency(50000, "NGN", "en-US");
    expect(formattedNgn).toContain("50,000");
  });
});

describe("KycStatusView limits display", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("displays limits in the account currency instead of hard-coded dollars and highlights current tier", async () => {
    vi.spyOn(kycApi, "fetchKycStatus").mockResolvedValue({
      status: "approved",
      rejectionReason: null,
      limitsAvailable: true,
      currency: "NGN",
      currentTierId: "tier_1",
      requiredMethod: null,
      tiers: [
        {
          id: "tier_1",
          label: "Tier 1 (BVN)",
          limits: {
            perTransaction: 50000,
            perDay: 100000,
            perMonth: 500000,
          },
          isCurrent: true,
        },
        {
          id: "tier_2",
          label: "Tier 2 (Full)",
          limits: {
            perTransaction: 5000000,
            perDay: 10000000,
            perMonth: 50000000,
          },
          isCurrent: false,
        },
      ],
    });

    renderWithClient(<KycStatusView />);

    // Wait for the tiers section to render
    const heading = await screen.findByRole("heading", {
      name: "Verification Tiers & Limits",
    });
    expect(heading).toBeInTheDocument();

    // Check that current tier badge is rendered
    const badge = screen.getByTestId("current-tier-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("Current");

    // The current tier row has aria-current="true"
    const rows = screen.getAllByRole("row");
    const currentTierRow = rows.find((r) => r.getAttribute("aria-current") === "true");
    expect(currentTierRow).toBeDefined();
    expect(currentTierRow).toHaveTextContent("Tier 1 (BVN)");

    // Ensure limits are formatted with NGN / currency rather than hardcoded "$"
    // With NGN, it displays NGN/₦ rather than hardcoded "$"
    const textContent = screen.getByRole("table").textContent ?? "";
    expect(textContent).not.toContain("$50,000");
    expect(textContent).toMatch(/NGN|₦/);
  });
});
