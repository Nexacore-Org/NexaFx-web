import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MarketOverview } from "@/components/dashboard/market-overview";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/shared/currency-icon", () => ({
  CurrencyIcon: () => null,
}));
vi.mock("@/hooks/use-rates", () => ({
  useRates: () => ({
    data: {
      quotes: [
        { pair: "NGN/USD", currency: "USD", rate: 0.00063, change24h: 0.4 },
        { pair: "USD/NGN", currency: "NGN", rate: 1587.4, change24h: -0.2 },
      ],
    },
    isPending: false,
    isError: false,
    failureCount: 0,
    isFetching: false,
    refetch: vi.fn(),
    dataUpdatedAt: Date.now(),
  }),
}));

afterEach(cleanup);

describe("MarketOverview", () => {
  it("links each card to the matching convert pair", () => {
    render(<MarketOverview />);
    expect(
      screen.getByRole("link", { name: "Convert NGN to USD" }),
    ).toHaveAttribute("href", "/convert?from=NGN&to=USD");
    expect(
      screen.getByRole("link", { name: "Convert USD to NGN" }),
    ).toHaveAttribute("href", "/convert?from=USD&to=NGN");
  });
});
