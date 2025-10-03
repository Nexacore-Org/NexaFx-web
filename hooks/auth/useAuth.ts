import { userService } from "@/services/api/userService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

// Define types for auth state
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  username: string;
  address: string;
  email: string | null;
  picture: string | null;
  isVerified: boolean;
  roles: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  tokens: AuthTokens | null;
}

// API response types
interface LoginResponse {
  message: string;
  user?: AuthUser;
  tokens: AuthTokens;
}

// Local storage keys
const AUTH_TOKENS_KEY = "auth_tokens";
const AUTH_USER_KEY = "auth_user";

// Helper functions for localStorage
const getStoredTokens = (): AuthTokens | null => {
  if (typeof window === "undefined") return null;
  const tokensStr = localStorage.getItem(AUTH_TOKENS_KEY);
  return tokensStr ? JSON.parse(tokensStr) : null;
};

const getStoredUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

// Set stored values
const setStoredAuth = (tokens: AuthTokens | null, user: AuthUser | null) => {
  if (typeof window === "undefined") return;

  if (tokens) {
    localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
  } else {
    localStorage.removeItem(AUTH_TOKENS_KEY);
  }

  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
};

export function useAuth() {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const tokens = getStoredTokens();
    const user = getStoredUser();

    if (tokens) {
      queryClient.setQueryData(["auth"], {
        isAuthenticated: true,
        tokens,
        user,
      });
    }

    setIsInitialized(true);
  }, [queryClient]);

  const authState = queryClient.getQueryData<AuthState>(["auth"]) || {
    isAuthenticated: false,
    tokens: null,
    user: null,
  };

  // Create User mutation
  const createUserMutation = useMutation<LoginResponse, Error, any>({
    mutationFn: userService.createUser,
    onSuccess: (data) => {
      console.log("User created successfully:", data);
      const newAuthState = {
        isAuthenticated: true,
        tokens: data.tokens,
        user: data.user || getStoredUser(),
      };

      // Update query cache
      queryClient.setQueryData(["auth"], newAuthState);

      // Store in localStorage
      setStoredAuth(data.tokens, data.user || getStoredUser());
    },
  });

  // Login mutation
  const loginMutation = useMutation<LoginResponse, Error, any>({
    mutationFn: userService.createUser,
    onSuccess: (data) => {
      console.log("Login successful:", data);
      const newAuthState = {
        isAuthenticated: true,
        tokens: data.tokens,
        user: data.user || getStoredUser(),
      };

      // Update query cache
      queryClient.setQueryData(["auth"], newAuthState);

      // Store in localStorage
      setStoredAuth(data.tokens, data.user || getStoredUser());
    },
  });

  // Logout function
  const logout = () => {
    queryClient.setQueryData(["auth"], {
      isAuthenticated: false,
      tokens: null,
      user: null,
    });

    setStoredAuth(null, null);

    // Invalidate queries that depend on auth
    queryClient.invalidateQueries({ queryKey: ["auth"] });
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    tokens: authState.tokens,
    login: loginMutation.mutateAsync,
    signup: createUserMutation.mutateAsync,
    logout,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  };
}
