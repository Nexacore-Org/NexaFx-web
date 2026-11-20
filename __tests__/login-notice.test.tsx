import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => searchParams,
}));

import LoginPage from '../app/(auth)/login/page';

describe('LoginPage notices', () => {
  it('shows a status banner for a known notice', () => {
    searchParams.set('notice', 'password-reset');
    render(<LoginPage />);

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent('Your password has been reset');
  });

  it('shows a status banner for reset-email-sent', () => {
    searchParams.set('notice', 'reset-email-sent');
    render(<LoginPage />);

    expect(screen.getByRole('status')).toHaveTextContent('password reset link has been sent');
  });

  it('ignores unknown notices', () => {
    searchParams.set('notice', 'something-unknown');
    render(<LoginPage />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('links to the forgot password page', () => {
    searchParams.delete('notice');
    render(<LoginPage />);

    const link = screen.getByRole('link', { name: /forgot password/i });
    expect(link).toHaveAttribute('href', '/forgot-password');
  });
});
