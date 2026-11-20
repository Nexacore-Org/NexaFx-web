import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Toaster } from "@/app/(client)/toaster";
import {
  NOTIFY_DISMISS_EVENT,
  NOTIFY_SHOW_EVENT,
  type ToastMessage,
} from "@/lib/notify";

function publish(detail: ToastMessage) {
  act(() => {
    window.dispatchEvent(new CustomEvent(NOTIFY_SHOW_EVENT, { detail }));
  });
}

function dismiss(id: number) {
  act(() => {
    window.dispatchEvent(
      new CustomEvent(NOTIFY_DISMISS_EVENT, { detail: { id } }),
    );
  });
}

describe("Toaster", () => {
  afterEach(cleanup);

  it("stacks toasts in one live region and marks errors assertive", () => {
    render(<Toaster />);

    publish({ id: 1, type: "info", message: "Converting" });
    publish({ id: 2, type: "error", message: "Conversion failed" });

    const region = screen.getByRole("status", { name: "Notifications" });
    expect(region).toHaveTextContent("Converting");
    expect(region).toHaveTextContent("Conversion failed");
    expect(screen.getByRole("alert")).toHaveTextContent("Conversion failed");
  });

  it("removes a toast when it is dismissed", () => {
    render(<Toaster />);
    publish({ id: 1, type: "success", message: "Saved" });
    expect(screen.getByRole("status")).toHaveTextContent("Saved");

    dismiss(1);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
