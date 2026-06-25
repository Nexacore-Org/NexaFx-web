import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import SignupPage from "./page";
import { mockPush } from "@/test/mocks/navigation";
import { server } from "@/test/msw/server";

async function fillSignupForm(
  password = "password123",
  confirmPassword = password,
) {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Email"), "user@example.com");
  await user.type(screen.getByLabelText("Phone"), "08012345678");
  await user.type(screen.getByLabelText("Password"), password);
  await user.type(screen.getByLabelText("Confirm password"), confirmPassword);

  return user;
}

describe("SignupPage", () => {
  it("shows a validation error when passwords do not match", async () => {
    render(<SignupPage />);
    const user = await fillSignupForm("password123", "different123");

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Passwords do not match",
    );
  });

  it("shows a validation error when the password is under 8 characters", async () => {
    render(<SignupPage />);
    const user = await fillSignupForm("short", "short");

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Password must be at least 8 characters",
    );
  });

  it("calls POST /auth/signup with email, phone, and password", async () => {
    const requests: unknown[] = [];
    server.use(
      http.post("*/api/proxy/auth/signup", async ({ request }) => {
        requests.push(await request.json());
        return HttpResponse.json({ message: "Account created" });
      }),
    );
    render(<SignupPage />);
    const user = await fillSignupForm();

    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(requests).toEqual([
        {
          email: "user@example.com",
          phone: "08012345678",
          password: "password123",
        },
      ]);
    });
  });

  it("shows a duplicate email error on a 400 response", async () => {
    server.use(
      http.post("*/api/proxy/auth/signup", () =>
        HttpResponse.json(
          { message: "Email already exists" },
          { status: 400 },
        ),
      ),
    );
    render(<SignupPage />);
    const user = await fillSignupForm();

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email already exists",
    );
  });

  it("redirects to /signup/verify on success", async () => {
    server.use(
      http.post("*/api/proxy/auth/signup", () =>
        HttpResponse.json({ message: "Account created" }),
      ),
    );
    render(<SignupPage />);
    const user = await fillSignupForm();

    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/signup/verify");
    });
  });
});
