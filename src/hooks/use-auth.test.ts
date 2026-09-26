import { describe, it, expect, vi } from 'vitest';
import { useAuth } from './use-auth';

vi.mock('@/lib/store/auth-store', () => {
  let innerState = { user: null };
  return {
    useAuthStore: (selector: any) => selector(innerState),
    __setMockUser: (user: any) => { innerState.user = user; }
  };
});

describe('useAuth Composite Computed Properties Hook', () => {
  it('fullName concatenates firstName and lastName strings with a clean divider space', async () => {
    const { __setMockUser } = await import('@/lib/store/auth-store') as any;
    __setMockUser({ firstName: 'Jane', lastName: 'Doe', role: 'USER' });

    const hookData = useAuth();
    expect(hookData.fullName).toBe('Jane Doe');
  });

  it('fullName returns an isolated empty string safely when user object context is null', async () => {
    const { __setMockUser } = await import('@/lib/store/auth-store') as any;
    __setMockUser(null);

    const hookData = useAuth();
    expect(hookData.fullName).toBe('');
  });

  it('isAdmin returns authorization state truthiness rules based on user role strings', async () => {
    const { __setMockUser } = await import('@/lib/store/auth-store') as any;

    __setMockUser({ firstName: 'Admin', lastName: 'User', role: 'ADMIN' });
    expect(useAuth().isAdmin).toBe(true);

    __setMockUser({ firstName: 'Standard', lastName: 'User', role: 'USER' });
    expect(useAuth().isAdmin).toBe(false);
  });
});
