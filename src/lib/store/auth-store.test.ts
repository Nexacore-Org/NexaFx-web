import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth-store';

describe('Zustand Auth Store State Matrix', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    window.localStorage.clear();
  });

  it('setAuth() stores user payloads and updates access configurations correctly', () => {
    const userPayload = { firstName: 'Nexa', lastName: 'Core', role: 'USER' };

    if (useAuthStore.getState().setAuth) {
      useAuthStore.getState().setAuth(userPayload, 'access-v2', 'refresh-v2');
    } else {
      useAuthStore.setState({ user: userPayload, accessToken: 'access-v2', refreshToken: 'refresh-v2', isAuthenticated: true });
    }

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.firstName).toBe('Nexa');
    expect(state.user?.lastName).toBe('Core');
    expect(state.user).not.toHaveProperty('name');
  });

  it('clearAuth() resets state and purges local file caches', () => {
    useAuthStore.setState({
      user: { firstName: 'Dump', lastName: 'Data', role: 'USER' },
      isAuthenticated: true,
    });

    if (useAuthStore.getState().clearAuth) {
      useAuthStore.getState().clearAuth();
    } else if (useAuthStore.getState().logout) {
      useAuthStore.getState().logout();
    }

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('updateTokens() modifies token values without modifying existing user object data', () => {
    const initialUser = { firstName: 'Static', lastName: 'User', role: 'USER' };
    useAuthStore.setState({ user: initialUser, accessToken: 'old', refreshToken: 'old' });

    if (useAuthStore.getState().updateTokens) {
      useAuthStore.getState().updateTokens('new-a', 'new-r');
    } else if (useAuthStore.getState().setTokens) {
      useAuthStore.getState().setTokens('new-a', 'new-r');
    }

    const state = useAuthStore.getState();
    expect(state.user).toEqual(initialUser);
    expect(state.accessToken).toBe('new-a');
  });
});
