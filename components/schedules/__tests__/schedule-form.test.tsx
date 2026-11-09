import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ScheduleForm from "@/components/schedules/schedule-form";
import type { Schedule } from "@/lib/api/schedules";

const mockCreateSchedule = vi.fn();

vi.mock("@/lib/api/schedules", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/schedules")>(
    "@/lib/api/schedules",
  );
  return {
    ...actual,
    createSchedule: (input: unknown) => mockCreateSchedule(input),
  };
});

const sampleSchedule: Schedule = {
  id: "sched-1",
  fromCurrency: "USD",
  toCurrency: "NGN",
  amount: "50",
  frequency: "monthly",
  startDate: "2026-12-01",
  endDate: null,
  status: "active",
  nextRunAt: "2026-12-01T00:00:00Z",
  lastRun: null,
};

describe("ScheduleForm", () => {
  const onClose = vi.fn();
  const onCreated = vi.fn();

  beforeEach(() => {
    mockCreateSchedule.mockReset();
    onClose.mockReset();
    onCreated.mockReset();
  });

  afterEach(cleanup);

  it("renders with default inputs and displays End date when frequency is monthly", () => {
    render(<ScheduleForm open={true} onClose={onClose} onCreated={onCreated} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/Start date/)).toBeInTheDocument();
    expect(screen.getByLabelText(/End date/)).toBeInTheDocument();
  });

  it("hides and clears End date when frequency is changed to once", () => {
    render(<ScheduleForm open={true} onClose={onClose} onCreated={onCreated} />);

    // Initially End date is shown
    const endDateInput = screen.getByLabelText(/End date/);
    fireEvent.change(endDateInput, { target: { value: "2026-12-31" } });
    expect(endDateInput).toHaveValue("2026-12-31");

    // Change frequency to "once"
    const frequencySelect = screen.getByLabelText("Frequency");
    fireEvent.change(frequencySelect, { target: { value: "once" } });

    // End date input must be removed from the DOM
    expect(screen.queryByLabelText(/End date/)).not.toBeInTheDocument();

    // Summary text reads "once, on ..." instead of awkward "one-off" mid-sentence
    expect(
      screen.getByText(/We'll convert 0 USD to NGN once, on the chosen date\./),
    ).toBeInTheDocument();
  });

  it("rejects malformed amount and sets aria-invalid and aria-describedby", () => {
    render(<ScheduleForm open={true} onClose={onClose} onCreated={onCreated} />);

    const amountInput = screen.getByLabelText(/Amount/);
    fireEvent.change(amountInput, { target: { value: "12abc" } });

    const startDateInput = screen.getByLabelText(/Start date/);
    fireEvent.change(startDateInput, { target: { value: "2026-12-01" } });

    fireEvent.click(screen.getByRole("button", { name: "Create schedule" }));

    // Amount error appears and links to input
    const errorMsg = screen.getByText("Enter an amount greater than zero");
    expect(errorMsg).toBeInTheDocument();
    expect(amountInput).toHaveAttribute("aria-invalid", "true");
    expect(amountInput).toHaveAttribute("aria-describedby", "sched-amount-error");
    expect(mockCreateSchedule).not.toHaveBeenCalled();
  });

  it("displays server errors at form level, NOT under the amount field", async () => {
    mockCreateSchedule.mockRejectedValue(new Error("Rate limit exceeded on backend"));
    render(<ScheduleForm open={true} onClose={onClose} onCreated={onCreated} />);

    const amountInput = screen.getByLabelText(/Amount/);
    fireEvent.change(amountInput, { target: { value: "50" } });

    const startDateInput = screen.getByLabelText(/Start date/);
    fireEvent.change(startDateInput, { target: { value: "2026-12-01" } });

    fireEvent.click(screen.getByRole("button", { name: "Create schedule" }));

    // Form-level error alert appears
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Rate limit exceeded on backend");

    // Amount field has no error and is not marked aria-invalid
    expect(amountInput).toHaveAttribute("aria-invalid", "false");
    expect(screen.queryByText("Enter an amount greater than zero")).not.toBeInTheDocument();
  });

  it("submits one-off schedule with endDate as null and calls onCreated", async () => {
    mockCreateSchedule.mockResolvedValue(sampleSchedule);
    render(<ScheduleForm open={true} onClose={onClose} onCreated={onCreated} />);

    // Set frequency to once
    const frequencySelect = screen.getByLabelText("Frequency");
    fireEvent.change(frequencySelect, { target: { value: "once" } });

    const amountInput = screen.getByLabelText(/Amount/);
    fireEvent.change(amountInput, { target: { value: "50" } });

    const startDateInput = screen.getByLabelText(/Start date/);
    fireEvent.change(startDateInput, { target: { value: "2026-12-01" } });

    fireEvent.click(screen.getByRole("button", { name: "Create schedule" }));

    await waitFor(() => {
      expect(mockCreateSchedule).toHaveBeenCalledWith({
        fromCurrency: "USD",
        toCurrency: "NGN",
        amount: "50",
        frequency: "once",
        startDate: "2026-12-01",
        endDate: null,
      });
    });

    expect(onCreated).toHaveBeenCalledWith(sampleSchedule);
    expect(onClose).toHaveBeenCalled();
  });
});
