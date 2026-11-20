import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import WithdrawalReview from '@/components/dashboard/withdrawal/WithdrawalReview';
import { currencies, formatMoney } from '@/lib/currencies';

describe('WithdrawalReview', () => {
  it('shows the correct currency name and icon for a non-USDC currency', () => {
    const ngn = currencies.find((c) => c.code === 'NGN');
    if (!ngn) {
      throw new Error('NGN currency missing from registry');
    }

    render(
      <WithdrawalReview
        amount="1000"
        currency="NGN"
        destination="GC..."
      />,
    );

    expect(screen.getByText(ngn.name)).toBeInTheDocument();
    expect(screen.queryByText('USDC')).not.toBeInTheDocument();
  });

  it('formats the amount with formatMoney', () => {
    render(
      <WithdrawalReview amount="1234.5" currency="USDC" destination="GC..." />,
    );

    expect(screen.getByText(formatMoney(1234.5, 'USDC'))).toBeInTheDocument();
  });
});
