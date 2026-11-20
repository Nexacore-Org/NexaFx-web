import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationBell } from "@/components/notifications/notification-bell";

const markRead = vi.fn();
const markAllRead = vi.fn();
const refetch = vi.fn();

let notificationsState: {
  notifications: Array<{
    id: string;
    title: string;
    body: string;
    category: "transactions" | "security" | "promotions" | "system";
    createdAt: string;
    read: boolean;
  }>;
  unreadCount: number;
  isPending: boolean;
  isError: boolean;
};

vi.mock("@/hooks/use-notifications", () => ({
  useNotifications: () => ({
    ...notificationsState,
    markRead,
    markAllRead,
    refetch,
  }),
}));

// The panel imports a label helper from the notifications API module, which in
// turn pulls in lib/api-client. Stub it so this component test stays isolated.
vi.mock("@/lib/api/notifications", () => ({
  categoryLabel: (category: string) => category,
}));

function items(count: number, read = false) {
  return Array.from({ length: count }, (_, index) => ({
    id: `n-${index}`,
    title: `Notification ${index}`,
    body: "Body",
    category: "system" as const,
    createdAt: "2026-01-01T00:00:00.000Z",
    read,
  }));
}

describe("NotificationBell", () => {
  beforeEach(() => {
    markRead.mockClear();
    markAllRead.mockClear();
    notificationsState = {
      notifications: items(3),
      unreadCount: 3,
      isPending: false,
      isError: false,
    };
  });

  afterEach(cleanup);

  it("shows the unread count on the badge and in the accessible label", () => {
    render(<NotificationBell />);
    const bell = screen.getByRole("button", { name: /3 unread/i });
    expect(within(bell).getByText("3")).toBeInTheDocument();
    expect(bell).toHaveAttribute("aria-expanded", "false");
  });

  it("shows 9+ when more than nine notifications are unread", () => {
    notificationsState = {
      ...notificationsState,
      notifications: items(12),
      unreadCount: 12,
    };
    render(<NotificationBell />);
    const bell = screen.getByRole("button", { name: /12 unread/i });
    expect(within(bell).getByText("9+")).toBeInTheDocument();
  });

  it("says so when there are no unread notifications", () => {
    notificationsState = {
      ...notificationsState,
      notifications: items(2, true),
      unreadCount: 0,
    };
    render(<NotificationBell />);
    expect(
      screen.getByRole("button", { name: /no unread notifications/i }),
    ).toBeInTheDocument();
  });

  it("marks every unread notification read from the panel", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    await user.click(screen.getByRole("button", { name: /3 unread/i }));

    const panel = screen.getByRole("dialog", { name: "Notifications" });
    await user.click(within(panel).getByRole("button", { name: "Mark all read" }));

    expect(markAllRead).toHaveBeenCalledWith(["n-0", "n-1", "n-2"]);
  });

  it("returns focus to the bell when the panel is closed with Escape", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    const bell = screen.getByRole("button", { name: /3 unread/i });

    await user.click(bell);
    const panel = screen.getByRole("dialog", { name: "Notifications" });
    expect(panel).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(bell).toHaveFocus());
  });

  it("returns focus to the bell when clicking outside the panel", async () => {
    const user = userEvent.setup();
    render(
      <>
        <NotificationBell />
        <div data-testid="elsewhere">Elsewhere</div>
      </>,
    );
    const bell = screen.getByRole("button", { name: /3 unread/i });

    await user.click(bell);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByTestId("elsewhere"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(bell).toHaveFocus());
  });
});
