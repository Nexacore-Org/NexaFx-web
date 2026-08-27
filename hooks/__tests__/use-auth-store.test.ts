import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/hooks/use-auth-store";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  });

  it("setAuth updates state correctly", () => {
    const user = {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      name: "John Doe",
      email: "john@example.com",
      role: "USER" as const,
    };
    useAuthStore.getState().setAuth(user, "access-token", "refresh-token");
    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.accessToken).toBe("access-token");
    expect(state.refreshToken).toBe("refresh-token");
    expect(state.isAuthenticated).toBe(true);
  });

  it("logout clears everything", () => {
    const user = {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      name: "John Doe",
      email: "john@example.com",
      role: "USER" as const,
    };
    useAuthStore.getState().setAuth(user, "access-token", "refresh-token");
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("setTokens updates tokens", () => {
    useAuthStore.getState().setTokens("new-access", "new-refresh");
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe("new-access");
    expect(state.refreshToken).toBe("new-refresh");
  });
});
