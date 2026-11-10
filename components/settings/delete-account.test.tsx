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
import DeleteAccount from "./delete-account";
import { AccountDeletionBlockedError, deleteAccount } from "../../lib/api/user";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("../../lib/api/user", () => ({
  deleteAccount: vi.fn(),
  AccountDeletionBlockedError: class AccountDeletionBlockedError extends Error {
    blockers: { code: string; message: string }[];
    constructor(blockers: { code: string; message: string }[]) {
      super("Account deletion is blocked");
      this.name = "AccountDeletionBlockedError";
      this.blockers = blockers;
    }
  },
}));

function renderDeleteAccount(queryClient?: QueryClient) {
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
        <DeleteAccount />
      </QueryClientProvider>,
    ),
    queryClient: client,
  };
}

describe("DeleteAccount", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders trigger button and initial copy, with dialog closed", () => {
    renderDeleteAccount();

    expect(
      screen.getByText(
        /Deleting your account permanently removes your profile/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete account" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("opens confirmation dialog when clicking Delete account", async () => {
    const user = userEvent.setup();
    renderDeleteAccount();

    await user.click(screen.getByRole("button", { name: "Delete account" }));

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByRole("heading", { name: "Delete your account" }),
    ).toBeInTheDocument();
  });

  it("keeps confirm button disabled until confirmation phrase is DELETE and password is provided", async () => {
    const user = userEvent.setup();
    renderDeleteAccount();

    await user.click(screen.getByRole("button", { name: "Delete account" }));
    const dialog = screen.getByRole("alertdialog");
    const confirmBtn = within(dialog).getByRole("button", {
      name: "Permanently delete my account",
    });

    const confirmInput = screen.getByLabelText(/Type DELETE to confirm/i);
    const passwordInput = screen.getByLabelText("Your password");

    // Initially disabled
    expect(confirmBtn).toBeDisabled();

    // Wrong casing
    await user.type(confirmInput, "delete");
    await user.type(passwordInput, "secret123");
    expect(confirmBtn).toBeDisabled();

    // Exact phrase DELETE but empty password
    await user.clear(confirmInput);
    await user.type(confirmInput, "DELETE");
    await user.clear(passwordInput);
    expect(confirmBtn).toBeDisabled();

    // Exact phrase DELETE with non-empty password
    await user.type(passwordInput, "secret123");
    expect(confirmBtn).toBeEnabled();
  });

  it("closes dialog and clears entered state when clicking Cancel", async () => {
    const user = userEvent.setup();
    renderDeleteAccount();

    await user.click(screen.getByRole("button", { name: "Delete account" }));
    const dialog = screen.getByRole("alertdialog");

    const confirmInput = screen.getByLabelText(/Type DELETE to confirm/i);
    await user.type(confirmInput, "DELETE");

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    // Reopen and verify cleared
    await user.click(screen.getByRole("button", { name: "Delete account" }));
    expect(screen.getByLabelText(/Type DELETE to confirm/i)).toHaveValue("");
  });

  it("displays blocker items when server rejects with AccountDeletionBlockedError", async () => {
    const user = userEvent.setup();
    vi.mocked(deleteAccount).mockRejectedValueOnce(
      new AccountDeletionBlockedError([
        {
          code: "non_zero_balance",
          message: "You must withdraw your remaining $150.00 balance first.",
        },
        {
          code: "pending_transactions",
          message: "You have 1 pending transaction in flight.",
        },
      ]),
    );

    renderDeleteAccount();

    await user.click(screen.getByRole("button", { name: "Delete account" }));
    const dialog = screen.getByRole("alertdialog");

    await user.type(screen.getByLabelText(/Type DELETE to confirm/i), "DELETE");
    await user.type(screen.getByLabelText("Your password"), "SecretPass123");

    await user.click(
      within(dialog).getByRole("button", {
        name: "Permanently delete my account",
      }),
    );

    await waitFor(() => {
      expect(
        within(dialog).getByText("Before you can delete your account:"),
      ).toBeInTheDocument();
      expect(
        within(dialog).getByText(
          "You must withdraw your remaining $150.00 balance first.",
        ),
      ).toBeInTheDocument();
      expect(
        within(dialog).getByText("You have 1 pending transaction in flight."),
      ).toBeInTheDocument();
      expect(
        within(dialog).getByText(
          "Your account cannot be deleted until you resolve the following.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("renders generic error message when deletion fails unexpectedly", async () => {
    const user = userEvent.setup();
    vi.mocked(deleteAccount).mockRejectedValueOnce(
      new Error("Database connection error"),
    );

    renderDeleteAccount();

    await user.click(screen.getByRole("button", { name: "Delete account" }));
    const dialog = screen.getByRole("alertdialog");

    await user.type(screen.getByLabelText(/Type DELETE to confirm/i), "DELETE");
    await user.type(screen.getByLabelText("Your password"), "SecretPass123");

    await user.click(
      within(dialog).getByRole("button", {
        name: "Permanently delete my account",
      }),
    );

    await waitFor(() => {
      expect(
        within(dialog).getByText("Database connection error"),
      ).toBeInTheDocument();
    });
  });

  it("clears queryClient cache, closes dialog, and redirects to /account-deleted on success", async () => {
    const user = userEvent.setup();
    vi.mocked(deleteAccount).mockResolvedValueOnce(undefined);

    const client = new QueryClient();
    const clearSpy = vi.spyOn(client, "clear");

    renderDeleteAccount(client);

    await user.click(screen.getByRole("button", { name: "Delete account" }));
    const dialog = screen.getByRole("alertdialog");

    await user.type(screen.getByLabelText(/Type DELETE to confirm/i), "DELETE");
    await user.type(screen.getByLabelText("Your password"), "SecretPass123");

    await user.click(
      within(dialog).getByRole("button", {
        name: "Permanently delete my account",
      }),
    );

    await waitFor(() => {
      expect(vi.mocked(deleteAccount).mock.calls[0][0]).toEqual({
        confirmation: "DELETE",
        password: "SecretPass123",
      });
      expect(clearSpy).toHaveBeenCalled();
      expect(replaceMock).toHaveBeenCalledWith("/account-deleted");
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });
});
