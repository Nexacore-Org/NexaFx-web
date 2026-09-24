import { formatCurrency } from '../formatCurrency';

describe('formatCurrency', () => {
  it('returns an empty string for undefined, null or empty amounts', () => {
    expect(formatCurrency(undefined, 'USD')).toBe('');
    expect(formatCurrency(null as unknown as string, 'USD')).toBe('');
    expect(formatCurrency('', 'USD')).toBe('');
  });

  it('formats numbers using the currency locale', () => {
    const result = formatCurrency(100000, 'NGN');
    expect(result).toContain('₦');
    expect(formatCurrency(500, 'USD')).toContain('$');
  });

  it('strips currency symbols from string amounts before formatting', () => {
    const result = formatCurrency('₦1,250.50', 'NGN');
    expect(result).toContain('1,250.50');
  });

  it('returns the original value when the amount is not a finite number', () => {
    expect(formatCurrency('1.2.3', 'USD')).toBe('1.2.3');
    expect(formatCurrency(Number.POSITIVE_INFINITY, 'USD')).toBe('Infinity');
  });

  it('falls back to the original value when formatting throws', () => {
    expect(formatCurrency(100, 'NOT_A_CURRENCY')).toBe('100');
  });
});