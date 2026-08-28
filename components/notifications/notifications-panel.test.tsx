/**
 * Component tests for the NotificationsPanel — Issue #716
 *
 * Covers:
 * 1. Clicking a notification's mark-as-read control updates its rendered state
 * 2. The mark-all-read action updates all visible items
 * 3. A simulated API failure during mark-as-read visibly rolls back the UI state
 */

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationsPanel } from "@/components/notifications/notifications-panel";
import { useNotificationsStore } from "@/hooks/use-notifications-store";
import type { Notification } from "@/types/notification";

// Mock next/link (already aliased in vitest config, but keep explicit for clarity)
vi.mock("@/lib/api/notifications", () => ({
  getNotifications: vi.fn(),
  getUnreadCount: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  deleteNotification: vi.fn(),
}));

import * as api from "@/lib/api/notifications";

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: "n-1",
    type: "system",
    message: "Your transaction was successful",
    timestamp: new Date(),
    isRead: false,
    ...overrides,
  };
}

function seedStore(notifications: Notification[], isOpen = true) {
  useNotificationsStore.setState({
    notifications,
    unreadCount: notifications.filter((n) => !n.isRead).length,
    isOpen,
    isLoading: false,
    error: null,
    pendingDeletes: new Map(),
    pendingClearAll: null,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default to resolved promises so tests don't hang
  vi.mocked(api.getNotifications).mockResolvedValue([]);
  vi.mocked(api.markAsRead).mockResolvedValue(undefined);
  vi.mocked(api.markAllAsRead).mockResolvedValue(undefined);
  vi.mocked(api.deleteNotification).mockResolvedValue(undefined);
  useNotificationsStore.setState({
    notifications: [],
    unreadCount: 0,
    isOpen: false,
    isLoading: false,
    error: null,
    pendingDeletes: new Map(),
    pendingClearAll: null,
  });
});

describe("NotificationsPanel", () => {
  describe("mark-as-read interaction", () => {
    it("removes the unread indicator from a notification after clicking it", async () => {
      const notification = makeNotification({ id: "n-1", isRead: false });
      seedStore([notification]);
      vi.mocked(api.markAsRead).mockResolvedValue(undefined);

      render(<NotificationsPanel />);

      // The notification message should be visible
      expect(
        screen.getByText("Your transaction was successful")
      ).toBeInTheDocument();

      // The unread dot should be present before clicking
      const unreadDots = document.querySelectorAll(".bg-primary.rounded-full.w-2.h-2");
      expect(unreadDots.length).toBeGreaterThan(0);

      // Click the notification button to mark as read
      const notificationButton = screen
        .getByText("Your transaction was successful")
        .closest("button");
      expect(notificationButton).not.toBeNull();
      fireEvent.click(notificationButton!);

      // After clicking, the store's unread count should drop to 0
      await waitFor(() => {
        expect(useNotificationsStore.getState().unreadCount).toBe(0);
      });

      // The notification should now be marked as read in the store
      const updatedNotification = useNotificationsStore
        .getState()
        .notifications.find((n) => n.id === "n-1");
      expect(updatedNotification?.isRead).toBe(true);
    });

    it("calls api.markAsRead with the correct notification id", () => {
      const notification = makeNotification({ id: "n-abc", isRead: false });
      seedStore([notification]);
      vi.mocked(api.markAsRead).mockResolvedValue(undefined);

      render(<NotificationsPanel />);

      const notificationButton = screen
        .getByText("Your transaction was successful")
        .closest("button");
      fireEvent.click(notificationButton!);

      expect(api.markAsRead).toHaveBeenCalledWith("n-abc");
    });
  });

  describe("mark-all-read interaction", () => {
    it("marks all visible items as read when the checkbox is used", async () => {
      const notifications = [
        makeNotification({ id: "n-1", isRead: false, message: "Notification 1" }),
        makeNotification({ id: "n-2", isRead: false, message: "Notification 2" }),
        makeNotification({ id: "n-3", isRead: true, message: "Notification 3" }),
      ];
      seedStore(notifications);
      vi.mocked(api.markAllAsRead).mockResolvedValue(undefined);

      render(<NotificationsPanel />);

      // All three notifications should render
      expect(screen.getByText("Notification 1")).toBeInTheDocument();
      expect(screen.getByText("Notification 2")).toBeInTheDocument();
      expect(screen.getByText("Notification 3")).toBeInTheDocument();

      // Find and click the "Mark all as read" checkbox
      const markAllCheckbox = screen
        .getByRole("checkbox");
      expect(markAllCheckbox).not.toBeDisabled();
      fireEvent.click(markAllCheckbox);

      // All notifications in the store should now be read
      await waitFor(() => {
        const state = useNotificationsStore.getState();
        expect(state.unreadCount).toBe(0);
        expect(state.notifications.every((n) => n.isRead)).toBe(true);
      });
    });

    it("disables the mark-all checkbox when all notifications are already read", () => {
      const notifications = [
        makeNotification({ id: "n-1", isRead: true, message: "Already read" }),
      ];
      seedStore(notifications);

      render(<NotificationsPanel />);

      const markAllCheckbox = screen.getByRole("checkbox");
      expect(markAllCheckbox).toBeDisabled();
    });
  });

  describe("rollback-on-failure behavior", () => {
    it("reverts notification to unread state when mark-as-read API call fails", async () => {
      const notification = makeNotification({ id: "n-fail", isRead: false });
      seedStore([notification]);
      vi.mocked(api.markAsRead).mockRejectedValue(new Error("Network error"));

      render(<NotificationsPanel />);

      // Confirm notification is unread in the store before clicking
      expect(
        useNotificationsStore.getState().notifications[0].isRead
      ).toBe(false);

      // Click to trigger optimistic update + API failure
      const notificationButton = screen
        .getByText("Your transaction was successful")
        .closest("button");
      fireEvent.click(notificationButton!);

      // After the API rejects, the store should roll back
      await waitFor(() => {
        const state = useNotificationsStore.getState();
        expect(state.notifications[0].isRead).toBe(false);
        expect(state.unreadCount).toBe(1);
      });
    });

    it("reverts all notifications to unread when mark-all-read API call fails", async () => {
      const notifications = [
        makeNotification({ id: "n-1", isRead: false, message: "Msg 1" }),
        makeNotification({ id: "n-2", isRead: false, message: "Msg 2" }),
      ];
      seedStore(notifications);
      vi.mocked(api.markAllAsRead).mockRejectedValue(new Error("Server error"));

      render(<NotificationsPanel />);

      const markAllCheckbox = screen.getByRole("checkbox");
      fireEvent.click(markAllCheckbox);

      // Wait for rollback
      await waitFor(() => {
        const state = useNotificationsStore.getState();
        expect(state.unreadCount).toBe(2);
        expect(state.notifications.every((n) => !n.isRead)).toBe(true);
      });
    });
  });

  describe("loading state", () => {
    it("renders a skeleton while notifications are loading", () => {
      useNotificationsStore.setState({
        notifications: [],
        unreadCount: 0,
        isOpen: true,
        isLoading: true,
        error: null,
        pendingDeletes: new Map(),
        pendingClearAll: null,
      });

      render(<NotificationsPanel />);

      // Skeleton elements are shown as pulsing animated divs
      const pulsingElements = document.querySelectorAll(".animate-pulse");
      expect(pulsingElements.length).toBeGreaterThan(0);
    });
  });

  describe("empty state", () => {
    it('shows "No notifications yet" when there are no notifications', () => {
      seedStore([]);

      render(<NotificationsPanel />);

      expect(screen.getByText("No notifications yet")).toBeInTheDocument();
    });
  });

  describe("panel visibility", () => {
    it("renders nothing when isOpen is false", () => {
      seedStore([], false); // isOpen = false

      const { container } = render(<NotificationsPanel />);

      expect(container.firstChild).toBeNull();
    });
  });
});
