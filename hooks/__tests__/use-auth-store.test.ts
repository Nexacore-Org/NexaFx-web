import { act } from "react";
import { useAuthStore } from "@/hooks/use-auth-store";

const mockUser = {
  id: "user-1",
  firstName: "John",
  lastName: "Doe",
  name: "John Doe",
  email: "john@example.com",
  role: "USER" as const,
};

const mockAdminUser = {
  ...mockUser,
  id: "admin-1",
  role: "ADMIN" as const,
};

describe("useAuthStore setProfile and role fields", () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.getState().logout();
    });
  });

  it("setProfile correctly updates the store's profile field", () => {
    const profile = {
      id: "user-1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "+2348012345678",
      avatarUrl: "https://example.com/avatar.png",
      isVerified: true,
    };

    act(() => {
      useAuthStore.getState().setProfile(profile);
    });

    const state = useAuthStore.getState();
    expect(state.profile).toEqual(profile);
  });

  it("setAuth correctly sets the role field from the provided user object (USER)", () => {
    act(() => {
      useAuthStore.getState().setAuth(mockUser, "access-token", "refresh-token");
    });

    const state = useAuthStore.getState();
    expect(state.user?.role).toBe("USER");
    expect(state.isAuthenticated).toBe(true);
  });

  it("setAuth correctly sets the role field from the provided user object (ADMIN)", () => {
    act(() => {
      useAuthStore.getState().setAuth(mockAdminUser, "access-token", "refresh-token");
    });

    const state = useAuthStore.getState();
    expect(state.user?.role).toBe("ADMIN");
    expect(state.isAuthenticated).toBe(true);
  });

  it("logout clears the role field", () => {
    act(() => {
      useAuthStore.getState().setAuth(mockAdminUser, "access-token", "refresh-token");
    });

    expect(useAuthStore.getState().user?.role).toBe("ADMIN");

    act(() => {
      useAuthStore.getState().logout();
    });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
  });

  it("setTokens preserves the role field", () => {
    act(() => {
      useAuthStore.getState().setAuth(mockAdminUser, "access-token", "refresh-token");
    });

    expect(useAuthStore.getState().user?.role).toBe("ADMIN");

    act(() => {
      useAuthStore.getState().setTokens("new-access", "new-refresh");
    });

    expect(useAuthStore.getState().user?.role).toBe("ADMIN");
    expect(useAuthStore.getState().accessToken).toBe("new-access");
  });
});