import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ActiveSessions, { formatRelative } from "./active-sessions";
import {
  fetchSessions,
  revokeOtherSessions,
  revokeSession,
  type UserSession,
} from "../../lib/api/sessions";
import { notify } from "../../lib/notify";

vi.mock("../../lib/api/sessions", async () => {
  const actual = await vi.importActual("../../lib/api/sessions");
  return {
    ...actual,
    fetchSessions: vi.fn(),
    revokeSession: vi.fn(),
    revokeOtherSessions: vi.fn(),
    SESSIONS_SUPPORTED: true,
  };
});

vi.mock("../../lib/notify", () => ({
  notify: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

const mockSessions: UserSession[] = [
  {
    id: "sess-1",
    device: "MacBook Pro",
    browser: "Chrome",
    location: "Sofia, Bulgaria",
    lastActiveAt: new Date(Date.now() - 1000 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    current: true,
  },
  {
    id: "sess-2",
    device: "iPhone 15",
    browser: "Safari",
    location: "Plovdiv, Bulgaria",
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    current: false,
  },
  {
    id: "sess-3",
    device: "Windows PC",
    browser: "Firefox",
    location: null,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    current: false,
  },
];

function renderActiveSessions(queryClient?: QueryClient) {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  return {
    ...render(
      <QueryClientProvider client={client}>
        <ActiveSessions />
      </QueryClientProvider>,
    ),
    queryClient: client,
  };
}

describe("ActiveSessions", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("formatRelative", () => {
    it("returns 'just now' for times under 45 seconds ago", () => {
      const now = Date.now();
      expect(formatRelative(new Date(now - 20_000).toISOString(), now)).toBe(
        "just now",
      );
    });

    it("returns 'unknown' for invalid date strings", () => {
      expect(formatRelative("invalid-iso")).toBe("unknown");
    });
  });

  it("renders loading skeleton when fetching sessions", () => {
    vi.mocked(fetchSessions).mockReturnValue(new Promise(() => {}));

    renderActiveSessions();

    expect(
      screen.getByLabelText("Loading active sessions"),
    ).toBeInTheDocument();
  });

  it("renders error alert with retry button on failure", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchSessions).mockRejectedValueOnce(new Error("Network failed"));

    renderActiveSessions();

    await waitFor(() => {
      expect(
        screen.getByText("We could not load your active sessions."),
      ).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole("button", { name: "Retry" });
    expect(retryBtn).toBeInTheDocument();

    vi.mocked(fetchSessions).mockResolvedValueOnce(mockSessions);
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText(/MacBook Pro on Chrome/i)).toBeInTheDocument();
    });
  });

  it("renders empty state when no sessions are returned", async () => {
    vi.mocked(fetchSessions).mockResolvedValueOnce([]);

    renderActiveSessions();

    await waitFor(() => {
      expect(screen.getByText("No active sessions found.")).toBeInTheDocument();
    });
  });

  it("renders session list with 'This device' badge and sign out actions", async () => {
    vi.mocked(fetchSessions).mockResolvedValueOnce(mockSessions);

    renderActiveSessions();

    await waitFor(() => {
      expect(screen.getByText(/MacBook Pro on Chrome/i)).toBeInTheDocument();
    });

    // Current session
    expect(screen.getByText("This device")).toBeInTheDocument();
    expect(
      screen.getByText("Use Logout to end this session"),
    ).toBeInTheDocument();

    // Other sessions
    expect(screen.getByText(/iPhone 15 on Safari/i)).toBeInTheDocument();
    expect(screen.getByText(/Plovdiv, Bulgaria/i)).toBeInTheDocument();
    expect(screen.getByText(/Windows PC on Firefox/i)).toBeInTheDocument();
    expect(screen.getByText(/Location unavailable/i)).toBeInTheDocument();

    // Sign out buttons for non-current sessions
    const signoutButtons = screen.getAllByRole("button", { name: "Sign out" });
    expect(signoutButtons).toHaveLength(2);

    // Sign out all other sessions button
    expect(
      screen.getByRole("button", { name: "Sign out all other sessions (2)" }),
    ).toBeInTheDocument();
  });

  it("optimistically revokes a session and restores it on error", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchSessions).mockResolvedValueOnce(mockSessions);

    let rejectRevoke!: (err: Error) => void;
    vi.mocked(revokeSession).mockImplementationOnce(
      () =>
        new Promise<void>((_, reject) => {
          rejectRevoke = reject;
        }),
    );

    renderActiveSessions();

    await waitFor(() => {
      expect(screen.getByText(/iPhone 15 on Safari/i)).toBeInTheDocument();
    });

    const signoutButtons = screen.getAllByRole("button", { name: "Sign out" });
    await user.click(signoutButtons[0]);

    // Optimistically removed
    await waitFor(() => {
      expect(
        screen.queryByText(/iPhone 15 on Safari/i),
      ).not.toBeInTheDocument();
    });

    // Now trigger rejection
    rejectRevoke(new Error("Could not revoke session"));

    // Reverted on error
    await waitFor(() => {
      expect(screen.getByText(/iPhone 15 on Safari/i)).toBeInTheDocument();
      expect(notify.error).toHaveBeenCalledWith("Could not revoke session");
    });
  });

  it("successfully revokes a session and calls revokeSession", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchSessions).mockResolvedValueOnce(mockSessions);
    vi.mocked(revokeSession).mockResolvedValueOnce(undefined);

    renderActiveSessions();

    await waitFor(() => {
      expect(screen.getByText(/iPhone 15 on Safari/i)).toBeInTheDocument();
    });

    const signoutButtons = screen.getAllByRole("button", { name: "Sign out" });
    await user.click(signoutButtons[0]);

    await waitFor(() => {
      expect(vi.mocked(revokeSession).mock.calls[0][0]).toBe("sess-2");
    });
  });

  it("confirms and revokes all other sessions", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchSessions).mockResolvedValueOnce(mockSessions);
    vi.mocked(revokeOtherSessions).mockResolvedValueOnce(undefined);

    renderActiveSessions();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Sign out all other sessions (2)" }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: "Sign out all other sessions (2)" }),
    );

    const dialog = screen.getByRole("alertdialog");
    expect(
      within(dialog).getByRole("heading", {
        name: "Sign out all other sessions",
      }),
    ).toBeInTheDocument();

    await user.click(
      within(dialog).getByRole("button", { name: "Sign out all others" }),
    );

    await waitFor(() => {
      expect(revokeOtherSessions).toHaveBeenCalled();
      expect(notify.success).toHaveBeenCalledWith(
        "Signed out of all other sessions.",
      );
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });
});
