import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_FLAGS,
  getFeatureFlags,
  isEnabled,
  resetFeatureFlags,
  setLocalFeatureFlags,
  setServerFeatureFlags,
} from '@/lib/feature-flags';

describe('feature flags', () => {
  beforeEach(() => {
    localStorage.clear();
    resetFeatureFlags();
    vi.restoreAllMocks();
  });

  it('returns default flags when no overrides are set', () => {
    expect(getFeatureFlags()).toEqual(DEFAULT_FLAGS);
    expect(isEnabled('referralProgram')).toBe(true);
    expect(isEnabled('scheduledTransfers')).toBe(false);
  });

  it('merges local overrides over defaults', () => {
    setLocalFeatureFlags({ referralProgram: false, scheduledTransfers: true });

    expect(getFeatureFlags().referralProgram).toBe(false);
    expect(getFeatureFlags().scheduledTransfers).toBe(true);
    expect(getFeatureFlags().priceAlerts).toBe(DEFAULT_FLAGS.priceAlerts);
  });

  it('merges server overrides over defaults', () => {
    setServerFeatureFlags({ webAuthn: true, developerApi: true });

    expect(getFeatureFlags().webAuthn).toBe(true);
    expect(getFeatureFlags().developerApi).toBe(true);
    expect(getFeatureFlags().pinLock).toBe(DEFAULT_FLAGS.pinLock);
  });
});
