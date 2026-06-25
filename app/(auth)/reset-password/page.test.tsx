import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import ResetPasswordPage from "./page";
import {
  mockPush,
  setMockSearchParams,
} from "@/test/mocks/navigation";
import { server } from "@/test/msw/server";

async function fillResetForm(
  password = "password123",
  confirmPassword = password,
) {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Reset code"), "123456");
  await user.type(screen.getByLabelText("New password"), password);
  await user.type(
    screen.getByLabelText("Confirm new password"),
    confirmPassword,
  );

  return user;
}

describe("ResetPasswordPage", () => {
  it("shows a validation error when the password is under 8 characters", async () => {
    setMockSearchParams("email=user@example.com");
    render(<ResetPasswordPage />);
    const user = await fillResetForm("short", "short");

    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Password must be at least 8 characters",
    );
  });

  it("shows a validation error when passwords do not match", async () => {
    setMockSearchParams("email=user@example.com");
    render(<ResetPasswordPage />);
    const user = await fillResetForm("password123", "different123");

    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Passwords do not match",
    );
  });

  it("submits the reset payload and redirects to login", async () => {
    const requests: unknown[] = [];
    setMockSearchParams("email=user@example.com");
    server.use(
      http.post("*/api/proxy/auth/reset-password", async ({ request }) => {
        requests.push(await request.json());
        return HttpResponse.json({ message: "Password reset" });
      }),
    );
    render(<ResetPasswordPage />);
    const user = await fillResetForm();

    await user.click(screen.getByRole("button", { name: "Reset password" }));

    await waitFor(() => {
      expect(requests).toEqual([
        {
          email: "user@example.com",
          otp: "123456",
          password: "password123",
        },
      ]);
      expect(mockPush).toHaveBeenCalledWith("/login?reset=success");
    });
  });
});
