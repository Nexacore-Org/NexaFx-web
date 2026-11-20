import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileForm } from '@/components/profile/profile-form';

const updateProfileMock = vi.fn();

vi.mock('@/hooks/use-update-profile', () => ({
  useUpdateProfile: () => ({
    mutate: updateProfileMock,
    isPending: false,
  }),
}));

describe('ProfileForm', () => {
  beforeEach(() => {
    updateProfileMock.mockReset();
  });

  it('shows a validation error when the name is empty', async () => {
    const user = userEvent.setup();
    render(<ProfileForm initialName="Ada Lovelace" initialAvatarUrl="" />);

    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(updateProfileMock).not.toHaveBeenCalled();
  });

  it('submits the updated profile on success', async () => {
    const user = userEvent.setup();
    render(<ProfileForm initialName="Ada Lovelace" initialAvatarUrl="" />);

    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Grace Hopper');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Grace Hopper' }),
        expect.anything(),
      );
    });
  });
});
