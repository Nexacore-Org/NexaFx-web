import { render, screen, waitFor } from '@testing-library/react';
import OnboardingChecklist from '../onboarding-checklist';
import * as usersApi from '@/lib/api/users';
import * as txApi from '@/lib/api/transactions';

vi.mock('@/lib/api/users', () => ({ getProfile: vi.fn() }));
vi.mock('@/lib/api/transactions', () => ({ getTransactions: vi.fn() }));

describe('OnboardingChecklist', () => {
  beforeEach(() => {
    (usersApi.getProfile as unknown as vi.Mock).mockResolvedValue({ id: 'u1', firstName: 'A', lastName: 'B', email: 'a@b.com' });
    (txApi.getTransactions as unknown as vi.Mock).mockResolvedValue({ data: [] });
  });

  it('renders and shows steps', async () => {
    render(<OnboardingChecklist />);
    await waitFor(() => expect(screen.getByText('Get started')).toBeInTheDocument());
    expect(screen.getByText('Complete profile')).toBeInTheDocument();
    expect(screen.getByText('Verify identity')).toBeInTheDocument();
+  });
+});
