import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/__tests__/msw-server";
import { useNotificationsStore } from "@/hooks/use-notifications-store";
import { Topbar } from "./topbar";

// On v2 the notification bell lives in the Topbar (the issue's standalone
// notification-bell component does not exist). next/navigation and next/link
// are aliased to test stubs in vitest.config.ts so Topbar renders without
// App Router context.

beforeEach(() => {
  useNotificationsStore.setState({
    notifications: [],
    isOpen: false,
    unreadCount: 0,
    isLoading: false,
    error: null,
  });
});

describe("Topbar notification bell", () => {
  it("shows the badge with the unread count from GET /notifications/unread-count", async () => {
    server.use(
      http.get("*/notifications/unread-count", () =>
        HttpResponse.json({ count: 5 })
      )
    );

    render(<Topbar />);

    await waitFor(() =>
      expect(document.querySelector(".bg-red-500")).toBeInTheDocument()
    );
  });

  it("hides the badge when the unread count is 0", async () => {
    server.use(
      http.get("*/notifications/unread-count", () =>
        HttpResponse.json({ count: 0 })
      )
    );

    render(<Topbar />);

    // Let the mount fetch resolve, then confirm no badge is shown.
    await waitFor(() =>
      expect(useNotificationsStore.getState().unreadCount).toBe(0)
    );
    expect(document.querySelector(".bg-red-500")).not.toBeInTheDocument();
  });

  it("opens the notification panel on click", async () => {
    render(<Topbar />);

    fireEvent.click(
      screen.getByRole("button", { name: /Toggle notifications/i })
    );

    await waitFor(() =>
      expect(useNotificationsStore.getState().isOpen).toBe(true)
    );
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });
});
