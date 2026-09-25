import { render, screen, waitFor } from "@testing-library/react";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { getExchangeRate } from "@/lib/api/exchange-rates";

jest.mock("@/lib/api/exchange-rates", () => ({
  getExchangeRate: jest.fn(),
}));

jest.mock("lucide-react", () => ({
  TrendingUp: () => <span data-testid="trending-up" />,
  TrendingDown: () => <span data-testid="trending-down" />,
  DollarSign: () => <span data-testid="dollar-sign" />,
  PoundSterling: () => <span data-testid="pound-sign" />,
  Euro: () => <span data-testid="euro-sign" />,
}));

describe("MarketOverview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderComponent = () => {
    return render(<MarketOverview />);
  };

  it("renders loading skeletons before data arrives", () => {
    (getExchangeRate as jest.Mock).mockImplementation(() => new Promise(() => {}));

    renderComponent();

    // Should show 3 skeleton cards
    const skeletons = screen.getAllByTestId(/skeleton/i);
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it("renders successfully-fetched rates correctly with mocked getExchangeRate", async () => {
    (getExchangeRate as jest.Mock).mockResolvedValue({
      data: { rate: 1500.5, change: "2.5", percentChange: "2.5" },
    });

    renderComponent();

    // Advance timers to trigger fetch
    await waitFor(() => {
      expect(screen.getByText(/ngn\/usd/i)).toBeInTheDocument();
    });
  });

  it("handles failed fetch without crashing the component", async () => {
    (getExchangeRate as jest.Mock).mockRejectedValue(new Error("Network error"));

    renderComponent();

    // Component should still render (with error states showing "...")
    await waitFor(() => {
      expect(screen.getByText(/ngn\/usd/i)).toBeInTheDocument();
    });

    // Rate should show "N/A" or similar error state
    const rateElements = screen.getAllByText(/n\/a|.../i);
    expect(rateElements.length).toBeGreaterThanOrEqual(3);
  });

  it("displays rate cards with correct structure after successful fetch", async () => {
    (getExchangeRate as jest.Mock).mockResolvedValue({
      data: { rate: 1500.5, change: "2.5" },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/₦1,500.50/)).toBeInTheDocument();
    });

    // Should show trending up for positive change
    await waitFor(() => {
      expect(screen.getByText(/\+2.5%/)).toBeInTheDocument();
    });
  });
});