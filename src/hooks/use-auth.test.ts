import { describe, test, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from './use-auth';
import { useAuthStore } from '../lib/store/auth-store';

describe('useAuth Custom Access Hook Compute Utilities', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  test("fullName computes structural combinations and returns firstName + ' ' + lastName", () => {
    useAuthStore.setState({
      user: { id: '1', firstName: 'Jane', lastName: 'Smith', role: 'USER' }
    });
    const { result } = renderHook(() => useAuth());
    expect(result.current.fullName).toBe('Jane Smith');
  });

  test('fullName returns a blank empty string (not "undefined undefined") when user context profile evaluates null', () => {
    useAuthStore.setState({ user: null });
    const { result } = renderHook(() => useAuth());
    expect(result.current.fullName).toBe('');
  });

  test("isAdmin resolves true only when evaluating high clearance user roles match with 'ADMIN'", () => {
    // Check standard user fallback profile
    useAuthStore.setState({
      user: { id: '1', firstName: 'A', lastName: 'B', role: 'USER' }
    });
    const { result: userResult } = renderHook(() => useAuth());
    expect(userResult.current.isAdmin).toBe(false);

    // Check escalation role profiles match correctly
    useAuthStore.setState({
      user: { id: '2', firstName: 'Admin', lastName: 'Node', role: 'ADMIN' }
    });
    const { result: adminResult } = renderHook(() => useAuth());
    expect(adminResult.current.isAdmin).toBe(true);
  });
});