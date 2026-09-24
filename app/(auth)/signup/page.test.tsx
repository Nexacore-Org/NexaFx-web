import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/__tests__/msw-server";
import SignupPage from "./page";

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
  usePathname: () => "/signup",
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  push.mockClear();
  sessionStorage.clear();
});

const fields = () => ({
  email: screen.getByPlaceholderText(/email address/i),
  phone: screen.getByPlaceholderText(/phone number/i),
  password: screen.getByPlaceholderText("Password"),
  confirm: screen.getByPlaceholderText("Confirm Password"),
});

describe("SignupPage", () => {
  it("shows an error when the passwords do not match", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);
    const f = fields();

    await user.type(f.email, "ada@example.com");
    await user.type(f.phone, "08012345678");
    await user.type(f.password, "Password123");
    await user.type(f.confirm, "Different123");
    await user.click(screen.getByRole("button", { name: /create an account/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows an error when the password is under 8 characters", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);
    const f = fields();

    await user.type(f.email, "ada@example.com");
    await user.type(f.phone, "08012345678");
    await user.type(f.password, "short");
    await user.type(f.confirm, "short");
    await user.click(screen.getByRole("button", { name: /create an account/i }));

    expect(
      await screen.findByText(/password must be at least 8 characters/i)
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("calls POST /auth/signup with { email, phone, password } and redirects on success", async () => {
    const user = userEvent.setup();
    let body: unknown;
    server.use(
      http.post("*/auth/signup", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ message: "created" });
      })
    );

    render(<SignupPage />);
    const f = fields();
    await user.type(f.email, "ada@example.com");
    await user.type(f.phone, "08012345678");
    await user.type(f.password, "Password123");
    await user.type(f.confirm, "Password123");
    await user.click(screen.getByRole("button", { name: /create an account/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/signup/verify"));
    expect(body).toEqual({
      email: "ada@example.com",
      phone: "08012345678",
      password: "Password123",
    });
    expect(sessionStorage.getItem("signup_email")).toBe("ada@example.com");
  });

  it("shows a duplicate-email error on a 400 response", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("*/auth/signup", () =>
        HttpResponse.json({ message: "Email already exists" }, { status: 400 })
      )
    );

    render(<SignupPage />);
    const f = fields();
    await user.type(f.email, "ada@example.com");
    await user.type(f.phone, "08012345678");
    await user.type(f.password, "Password123");
    await user.type(f.confirm, "Password123");
    await user.click(screen.getByRole("button", { name: /create an account/i }));

    expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
