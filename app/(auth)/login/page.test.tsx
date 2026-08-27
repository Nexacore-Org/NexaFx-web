import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse, delay } from "msw";
import { server } from "@/__tests__/msw-server";
import LoginPage from "./page";

// The global test setup aliases next/navigation to a no-op stub; override it
// here with spies so we can assert on navigation.
const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/login",
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  push.mockClear();
  sessionStorage.clear();
});

describe("LoginPage", () => {
  it("renders the identifier and password fields", () => {
    render(<LoginPage />);
    expect(
      screen.getByPlaceholderText(/email address or phone/i)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
  });

  it("shows validation errors when the form is submitted empty", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(
      await screen.findByText(/email or phone number is required/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/password is required/i)
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("calls POST /auth/login with the credentials and redirects to /verify-otp", async () => {
    const user = userEvent.setup();
    let body: unknown;
    server.use(
      http.post("*/auth/login", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ message: "OTP sent" });
      })
    );

    render(<LoginPage />);
    await user.type(
      screen.getByPlaceholderText(/email address or phone/i),
      "ada@example.com"
    );
    await user.type(screen.getByPlaceholderText(/enter password/i), "Password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/verify-otp"));
    expect(body).toEqual({ email: "ada@example.com", password: "Password123" });
    expect(sessionStorage.getItem("login-email")).toBe("ada@example.com");
  });

  it("shows an inline error when the API returns a 4xx", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("*/auth/login", () =>
        HttpResponse.json({ message: "Invalid credentials" }, { status: 400 })
      )
    );

    render(<LoginPage />);
    await user.type(
      screen.getByPlaceholderText(/email address or phone/i),
      "ada@example.com"
    );
    await user.type(screen.getByPlaceholderText(/enter password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows a loading state on the submit button while the request is in flight", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("*/auth/login", async () => {
        await delay(50);
        return HttpResponse.json({ message: "OTP sent" });
      })
    );

    render(<LoginPage />);
    await user.type(
      screen.getByPlaceholderText(/email address or phone/i),
      "ada@example.com"
    );
    await user.type(screen.getByPlaceholderText(/enter password/i), "Password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(
      await screen.findByRole("button", { name: /logging in/i })
    ).toBeInTheDocument();
    await waitFor(() => expect(push).toHaveBeenCalled());
  });
});
