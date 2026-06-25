import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import LoginPage from "./page";
import { mockPush } from "@/test/mocks/navigation";
import { server } from "@/test/msw/server";

async function enterCredentials(email = "user@example.com", password = "password123") {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Password"), password);

  return user;
}

describe("LoginPage", () => {
  it("renders email and password fields", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("shows a validation error when email is empty on submit", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("shows a validation error when password is empty on submit", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("calls POST /auth/login with the correct payload", async () => {
    const requests: unknown[] = [];
    server.use(
      http.post("*/api/proxy/auth/login", async ({ request }) => {
        requests.push(await request.json());
        return HttpResponse.json({ message: "OTP sent" });
      }),
    );
    render(<LoginPage />);
    const user = await enterCredentials();

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(requests).toEqual([
        { email: "user@example.com", password: "password123" },
      ]);
    });
  });

  it("shows an inline error when the API returns a 4xx response", async () => {
    server.use(
      http.post("*/api/proxy/auth/login", () =>
        HttpResponse.json(
          { message: "Invalid email or password" },
          { status: 401 },
        ),
      ),
    );
    render(<LoginPage />);
    const user = await enterCredentials();

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password",
    );
  });

  it("redirects to /verify-otp on success", async () => {
    server.use(
      http.post("*/api/proxy/auth/login", () =>
        HttpResponse.json({ message: "OTP sent" }),
      ),
    );
    render(<LoginPage />);
    const user = await enterCredentials();

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/verify-otp");
    });
  });

  it("shows a loading state while the request is in flight", async () => {
    let releaseRequest: (() => void) | undefined;
    const requestGate = new Promise<void>((resolve) => {
      releaseRequest = resolve;
    });
    server.use(
      http.post("*/api/proxy/auth/login", async () => {
        await requestGate;
        return HttpResponse.json({ message: "OTP sent" });
      }),
    );
    render(<LoginPage />);
    const user = await enterCredentials();

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    const loadingButton = await screen.findByRole("button", {
      name: "Signing in...",
    });
    expect(loadingButton).toBeDisabled();

    releaseRequest?.();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/verify-otp");
    });
  });
});
