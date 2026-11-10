import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ChangePasswordForm from "./change-password-form";
import { changePassword, WrongPasswordError } from "../../lib/api/auth";
import { notify } from "../../lib/notify";

vi.mock("../../lib/api/auth", () => ({
  changePassword: vi.fn(),
  WrongPasswordError: class WrongPasswordError extends Error {
    constructor() {
      super("Current password is incorrect");
      this.name = "WrongPasswordError";
    }
  },
}));

vi.mock("../../lib/notify", () => ({
  notify: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ChangePasswordForm />
    </QueryClientProvider>,
  );
}

describe("ChangePasswordForm", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders inputs and keeps submit button disabled initially", () => {
    renderForm();

    expect(screen.getByLabelText("Current password")).toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm new password")).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: "Change password" });
    expect(submitBtn).toBeDisabled();
  });

  it("shows an error and keeps submit disabled when confirm password does not match", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Current password"), "OldPass123");
    await user.type(screen.getByLabelText("New password"), "NewPass456");
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "Mismatch789",
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Passwords do not match.",
    );
    expect(
      screen.getByRole("button", { name: "Change password" }),
    ).toBeDisabled();
  });

  it("shows an error when new password is the same as current password", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Current password"), "SamePass123");
    await user.type(screen.getByLabelText("New password"), "SamePass123");
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "SamePass123",
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Your new password must be different from your current password.",
    );
    expect(
      screen.getByRole("button", { name: "Change password" }),
    ).toBeDisabled();
  });

  it("keeps submit disabled when new password is too weak", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Current password"), "OldPass123");
    await user.type(screen.getByLabelText("New password"), "weak");
    await user.type(screen.getByLabelText("Confirm new password"), "weak");

    expect(
      screen.getByRole("button", { name: "Change password" }),
    ).toBeDisabled();
  });

  it("enables submit when all validations pass and successfully changes password", async () => {
    const user = userEvent.setup();
    vi.mocked(changePassword).mockResolvedValueOnce({
      otherSessionsRevoked: false,
    });

    renderForm();

    const currentInput = screen.getByLabelText("Current password");
    const newInput = screen.getByLabelText("New password");
    const confirmInput = screen.getByLabelText("Confirm new password");
    const submitBtn = screen.getByRole("button", { name: "Change password" });

    await user.type(currentInput, "CurrentPassword123");
    await user.type(newInput, "ValidNewPassword456");
    await user.type(confirmInput, "ValidNewPassword456");

    expect(submitBtn).toBeEnabled();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(vi.mocked(changePassword).mock.calls[0][0]).toEqual({
        currentPassword: "CurrentPassword123",
        newPassword: "ValidNewPassword456",
      });
    });

    await waitFor(() => {
      expect(notify.success).toHaveBeenCalledWith("Password changed.");
      expect(screen.getByRole("status")).toHaveTextContent("Password changed.");
      expect(currentInput).toHaveValue("");
      expect(newInput).toHaveValue("");
      expect(confirmInput).toHaveValue("");
    });
  });

  it("notifies when other sessions are revoked on success", async () => {
    const user = userEvent.setup();
    vi.mocked(changePassword).mockResolvedValueOnce({
      otherSessionsRevoked: true,
    });

    renderForm();

    await user.type(
      screen.getByLabelText("Current password"),
      "CurrentPassword123",
    );
    await user.type(
      screen.getByLabelText("New password"),
      "ValidNewPassword456",
    );
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "ValidNewPassword456",
    );

    await user.click(screen.getByRole("button", { name: "Change password" }));

    await waitFor(() => {
      expect(notify.info).toHaveBeenCalledWith(
        "You were signed out on all other devices.",
      );
    });
  });

  it("handles WrongPasswordError by scoping error to current password and focusing it", async () => {
    const user = userEvent.setup();
    vi.mocked(changePassword).mockRejectedValueOnce(new WrongPasswordError());

    renderForm();

    const currentInput = screen.getByLabelText("Current password");
    const newInput = screen.getByLabelText("New password");
    const confirmInput = screen.getByLabelText("Confirm new password");

    await user.type(currentInput, "WrongCurrent123");
    await user.type(newInput, "ValidNewPassword456");
    await user.type(confirmInput, "ValidNewPassword456");

    await user.click(screen.getByRole("button", { name: "Change password" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Current password is incorrect",
      );
      expect(currentInput).toHaveFocus();
    });

    // Typing in current password clears the scoped error
    await user.type(currentInput, "x");
    expect(
      screen.queryByText("Current password is incorrect"),
    ).not.toBeInTheDocument();
  });

  it("renders generic form error on unexpected failure", async () => {
    const user = userEvent.setup();
    vi.mocked(changePassword).mockRejectedValueOnce(
      new Error("Network connection lost"),
    );

    renderForm();

    await user.type(
      screen.getByLabelText("Current password"),
      "CurrentPass123",
    );
    await user.type(
      screen.getByLabelText("New password"),
      "ValidNewPassword456",
    );
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "ValidNewPassword456",
    );

    await user.click(screen.getByRole("button", { name: "Change password" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Network connection lost",
      );
    });
  });
});
