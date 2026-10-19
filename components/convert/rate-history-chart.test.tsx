import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  RateHistoryChart,
  summarizeRates,
} from "@/components/convert/rate-history-chart";

vi.mock("next/dynamic", () => ({
  default: () => () => <div data-testid="chart-canvas" />,
}));

const getRateHistory = vi.fn();
vi.mock("@/lib/api/rates", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/api/rates")>("@/lib/api/rates");
  return { ...actual, getRateHistory: (p: unknown) => getRateHistory(p) };
});

const points = [
  { timestamp: "2026-10-01T00:00:00Z", rate: 1500 },
  { timestamp: "2026-10-02T00:00:00Z", rate: 1560 },
  { timestamp: "2026-10-03T00:00:00Z", rate: 1470 },
  { timestamp: "2026-10-04T00:00:00Z", rate: 1530 },
];

function renderChart() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <RateHistoryChart from="USD" to="NGN" />
    </QueryClientProvider>,
  );
}

beforeEach(() => getRateHistory.mockReset());
afterEach(cleanup);

describe("summarizeRates", () => {
  it("reports start, end, high, low and change", () => {
    expect(summarizeRates(points)).toEqual({
      start: 1500,
      end: 1530,
      high: 1560,
      low: 1470,
      change: 2,
    });
  });

  it("returns null for no data", () => {
    expect(summarizeRates([])).toBeNull();
  });
});

describe("RateHistoryChart", () => {
  it("shows a loading state, then the chart and a text summary", async () => {
    getRateHistory.mockResolvedValue(points);
    renderChart();
    expect(screen.getByText("Loading rate history")).toBeInTheDocument();

    expect(await screen.findByTestId("chart-canvas")).toBeInTheDocument();
    expect(
      screen.getByText(
        /started at 1,500.00, now 1,530.00 \(\+2.00%\)\. High 1,560.00, low 1,470.00/,
      ),
    ).toBeInTheDocument();
  });

  it("gives screen reader users the data as a table", async () => {
    getRateHistory.mockResolvedValue(points);
    renderChart();
    const table = await screen.findByRole("table", {
      name: "USD to NGN exchange rate, 30D",
    });
    expect(within(table).getAllByRole("row")).toHaveLength(points.length + 1);
    expect(within(table).getByText("1,560.00")).toBeInTheDocument();
    // The drawing itself is hidden from assistive tech.
    expect(screen.getByTestId("chart-canvas").parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("requests a new range when a tab is selected", async () => {
    getRateHistory.mockResolvedValue(points);
    renderChart();
    await screen.findByTestId("chart-canvas");
    expect(getRateHistory).toHaveBeenLastCalledWith({
      from: "USD",
      to: "NGN",
      range: "30D",
    });

    fireEvent.click(screen.getByRole("tab", { name: "7D" }));
    await waitFor(() =>
      expect(getRateHistory).toHaveBeenLastCalledWith({
        from: "USD",
        to: "NGN",
        range: "7D",
      }),
    );
    fireEvent.click(screen.getByRole("tab", { name: "90D" }));
    await waitFor(() =>
      expect(getRateHistory).toHaveBeenLastCalledWith({
        from: "USD",
        to: "NGN",
        range: "90D",
      }),
    );
    expect(
      await screen.findByRole("table", {
        name: "USD to NGN exchange rate, 90D",
      }),
    ).toBeInTheDocument();
  });

  it("shows an empty state without drawing a chart", async () => {
    getRateHistory.mockResolvedValue([]);
    renderChart();
    expect(
      await screen.findByText(
        "No rate history is available for USD to NGN in this range.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("chart-canvas")).not.toBeInTheDocument();
  });

  it("shows an unavailable state with retry on error, never fake data", async () => {
    getRateHistory.mockRejectedValueOnce(new Error("404"));
    renderChart();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Rate history is unavailable right now.",
    );
    expect(screen.queryByTestId("chart-canvas")).not.toBeInTheDocument();

    getRateHistory.mockResolvedValueOnce(points);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByTestId("chart-canvas")).toBeInTheDocument();
  });
});

describe("range tabs keyboard support", () => {
  it("moves selection with the arrow keys", async () => {
    getRateHistory.mockResolvedValue(points);
    renderChart();
    await screen.findByTestId("chart-canvas");
    const selected = screen.getByRole("tab", { selected: true });
    expect(selected).toHaveTextContent("30D");
    selected.focus();
    fireEvent.keyDown(selected, { key: "ArrowRight" });
    await waitFor(() =>
      expect(screen.getByRole("tab", { selected: true })).toHaveTextContent(
        "90D",
      ),
    );
  });
});
