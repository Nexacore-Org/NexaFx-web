import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

const api = vi.hoisted(() => ({ getDataExportStatus: vi.fn(), requestDataExport: vi.fn() }));
vi.mock("@/lib/api/user", () => api);
import DataExport from "./data-export";

afterEach(() => vi.useRealTimers());

describe("DataExport", () => {
  it("shows a load error with retry", async () => {
    api.getDataExportStatus.mockRejectedValueOnce(new Error("x")).mockResolvedValueOnce(null);
    render(<DataExport />);
    fireEvent.click(await screen.findByRole("button", { name: "Retry" }));
    expect(api.getDataExportStatus).toHaveBeenCalledTimes(2);
  });

  it("polls from requested through to ready", async () => {
    vi.useFakeTimers();
    api.getDataExportStatus
      .mockResolvedValueOnce({ requestId: "r1", status: "requested" })
      .mockResolvedValueOnce({ requestId: "r1", status: "ready", downloadUrl: "/x.zip" });
    render(<DataExport />);
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(screen.getByText("Ready")).toBeTruthy();
  });
});
