import { describe, test, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth-store';

describe('Zustand Auth Store Profile Operations', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  const mockUser = { id: '1', firstName: 'John', lastName: 'Doe', role: 'USER' };

  test('setAuth() stores user, tokens and sets isAuthenticated to true', () => {
    useAuthStore.getState().setAuth(mockUser, 'access_123', 'refresh_123');
    const state = useAuthStore.getState();

    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('access_123');
    expect(state.refreshToken).toBe('refresh_123');
    expect(state.isAuthenticated).toBe(true);
  });

  test('clearAuth() resets all atomic variables to null/false values', () => {
    useAuthStore.getState().setAuth(mockUser, 'access_123', 'refresh_123');
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  test('updateTokens() replaces tokens without touching core user attributes data profiles', () => {
    useAuthStore.getState().setAuth(mockUser, 'access_123', 'refresh_123');
    useAuthStore.getState().updateTokens('new_access_456', 'new_refresh_456');
    const state = useAuthStore.getState();

    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('new_access_456');
    expect(state.refreshToken).toBe('new_refresh_456');
  });

  test('user.firstName and user.lastName are stored correctly — no composite user.name field exists', () => {
    useAuthStore.getState().setAuth(mockUser, 'access', 'refresh');
    const state = useAuthStore.getState();

    expect(state.user?.firstName).toBe('John');
    expect(state.user?.lastName).toBe('Doe');
    expect(state.user).not.toHaveProperty('name');
  });

  test('State persists securely in localStorage cache arrays after executing setAuth()', () => {
    useAuthStore.getState().setAuth(mockUser, 'access_123', 'refresh_123');
    const storageItem = localStorage.getItem('auth-storage'); // Update matching your store's storage name key
    expect(storageItem).toBeDefined();
    expect(JSON.parse(storageItem!).state.accessToken).toBe('access_123');
  });

  test('clearAuth() wipes stored persistence parameters completely from localStorage context nodes', () => {
    useAuthStore.getState().setAuth(mockUser, 'access_123', 'refresh_123');
    useAuthStore.getState().clearAuth();
    const storageItem = localStorage.getItem('auth-storage');
    // Depending on Zustand persist middleware layout config, it will either delete the key or store null states:
    if (storageItem) {
      expect(JSON.parse(storageItem).state.accessToken).toBeNull();
    } else {
      expect(storageItem).toBeNull();
    }
  });
});