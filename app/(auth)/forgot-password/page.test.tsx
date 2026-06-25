import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import ForgotPasswordPage from "./page";
import { server } from "@/test/msw/server";

const genericMessage =
  "If an account exists for that email, we sent password reset instructions.";

async function submitEmail(email: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email"), email);
  await user.click(
    screen.getByRole("button", { name: "Send reset instructions" }),
  );
}

describe("ForgotPasswordPage", () => {
  it("calls POST /auth/forgot-password with the email", async () => {
    const requests: unknown[] = [];
    server.use(
      http.post("*/api/proxy/auth/forgot-password", async ({ request }) => {
        requests.push(await request.json());
        return HttpResponse.json({ message: "Sent" });
      }),
    );
    render(<ForgotPasswordPage />);

    await submitEmail("user@example.com");

    await waitFor(() => {
      expect(requests).toEqual([{ email: "user@example.com" }]);
    });
  });

  it("shows the same generic success message when the email does not exist", async () => {
    server.use(
      http.post("*/api/proxy/auth/forgot-password", () =>
        HttpResponse.json({ message: "Email not found" }, { status: 404 }),
      ),
    );
    render(<ForgotPasswordPage />);

    await submitEmail("missing@example.com");

    expect(await screen.findByRole("status")).toHaveTextContent(genericMessage);
  });

  it("does not reveal whether an email exists", async () => {
    server.use(
      http.post("*/api/proxy/auth/forgot-password", () =>
        HttpResponse.json(
          { message: "There is no account for this email" },
          { status: 400 },
        ),
      ),
    );
    render(<ForgotPasswordPage />);

    await submitEmail("private@example.com");

    expect(await screen.findByRole("status")).toHaveTextContent(genericMessage);
    expect(screen.queryByText(/no account/i)).not.toBeInTheDocument();
    expect(screen.queryByText("private@example.com")).not.toBeInTheDocument();
  });
});
