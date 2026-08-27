import { render, screen, waitFor } from "@testing-library/react";
import { InfoAvatar } from "./info-avatar";
import { useAuthStore } from "@/hooks/use-auth-store";

describe("InfoAvatar", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: "u1",
        firstName: "Ada",
        lastName: "Lovelace",
        name: "Ada Lovelace",
        email: "ada@example.com",
        role: "USER",
      },
    });
  });

  it("renders the signed-in user's name, not a hardcoded identity", () => {
    render(<InfoAvatar />);
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    // The old prototype hardcoded "cerseiload" — it must never appear.
    expect(screen.queryByText(/cerseiload/i)).not.toBeInTheDocument();
  });

  it("renders the real wallet address returned by the profile API", async () => {
    render(<InfoAvatar />);
    // The default MSW profile handler returns an address truncated to 0x1234...5678.
    await waitFor(() =>
      expect(document.body.textContent).toContain("0x1234...5678"),
    );
    expect(document.body.textContent).not.toContain("0xAbc...123");
  });
});
