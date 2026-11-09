import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ScheduleList from "../schedule-list";
import type { Schedule } from "@/lib/api/schedules";

const mockSchedules: Schedule[] = [
  {
    id: "sched-1",
    userId: "u1",
    fromCurrency: "USD",
    toCurrency: "NGN",
    amount: "100.00",
    frequency: "monthly",
    startDate: "2026-11-01",
    endDate: null,
    nextRunAt: "2026-12-01T12:00:00Z",
    lastRunAt: "2026-11-01T12:00:00Z",
    totalRuns: 1,
    status: "active",
    createdAt: "2026-11-01T00:00:00Z",
    updatedAt: "2026-11-01T12:00:00Z",
  },
  {
    id: "sched-2",
    userId: "u1",
    fromCurrency: "EUR",
    toCurrency: "USD",
    amount: "250.00",
    frequency: "weekly",
    startDate: "2026-11-05",
    endDate: null,
    nextRunAt: "2026-11-12T12:00:00Z",
    lastRunAt: null,
    totalRuns: 0,
    status: "paused",
    createdAt: "2026-11-05T00:00:00Z",
    updatedAt: "2026-11-05T00:00:00Z",
  },
];

describe("ScheduleList per-row busy state and actions", () => {
  afterEach(cleanup);

  it("renders schedules and tracks busy state on a per-row basis", () => {
    const onPause = vi.fn();
    const onResume = vi.fn();
    const onRequestCancel = vi.fn();

    // Sched-1 is busy, Sched-2 is not
    render(
      <ScheduleList
        schedules={mockSchedules}
        onPause={onPause}
        onResume={onResume}
        onRequestCancel={onRequestCancel}
        busyIds={new Set(["sched-1"])}
      />
    );

    // Row 1 Pause button should be disabled and show "Pausing…"
    const pauseBtn = screen.getByRole("button", { name: "Pausing…" });
    expect(pauseBtn).toBeDisabled();

    // Row 2 Resume button should be enabled
    const resumeBtn = screen.getByRole("button", { name: "Resume" });
    expect(resumeBtn).toBeEnabled();
  });

  it("triggers onResume and onPause callbacks for specific rows", async () => {
    const user = userEvent.setup();
    const onPause = vi.fn();
    const onResume = vi.fn();
    const onRequestCancel = vi.fn();

    render(
      <ScheduleList
        schedules={mockSchedules}
        onPause={onPause}
        onResume={onResume}
        onRequestCancel={onRequestCancel}
        busyIds={new Set()}
      />
    );

    const pauseBtn = screen.getByRole("button", { name: "Pause" });
    await user.click(pauseBtn);
    expect(onPause).toHaveBeenCalledWith("sched-1");

    const resumeBtn = screen.getByRole("button", { name: "Resume" });
    await user.click(resumeBtn);
    expect(onResume).toHaveBeenCalledWith("sched-2");
  });

  it("triggers onRequestCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onPause = vi.fn();
    const onResume = vi.fn();
    const onRequestCancel = vi.fn();

    render(
      <ScheduleList
        schedules={mockSchedules}
        onPause={onPause}
        onResume={onResume}
        onRequestCancel={onRequestCancel}
        busyIds={new Set()}
      />
    );

    const cancelButtons = screen.getAllByRole("button", { name: "Cancel" });
    await user.click(cancelButtons[0]);
    expect(onRequestCancel).toHaveBeenCalledWith(mockSchedules[0]);
  });
});
