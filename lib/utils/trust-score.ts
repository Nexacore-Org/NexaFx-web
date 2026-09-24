import type { AdminUser } from '@/lib/api/admin';
import type { Transaction } from '@/lib/api/transactions';

export interface TrustScoreBreakdown {
  kyc: number;
  accountAge: number;
  successfulTransactions: number;
  noRecentFailures: number;
  noFlagged: number;
  loginPattern: number;
  twoFactor: number;
  total: number;
}

export function parseCreatedAt(createdAt: string | undefined): Date | null {
  if (!createdAt) return null;
  
  const raw = createdAt.trim();
  
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getAccountAgeDays(user: AdminUser): number {
  const raw = (user as any).createdAtRaw as string | undefined;
  const date = parseCreatedAt(raw || user.createdAt);
  if (!date) return 0;
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function calculateTrustScore(
  user: AdminUser,
  transactions: Transaction[] = [],
  allFlaggedIds: Set<string> = new Set()
): TrustScoreBreakdown {
  const breakdown: TrustScoreBreakdown = {
    kyc: 0,
    accountAge: 0,
    successfulTransactions: 0,
    noRecentFailures: 0,
    noFlagged: 0,
    loginPattern: 0,
    twoFactor: 0,
    total: 0,
  };

  breakdown.kyc = user.kycStatus === 'Verified' ? 30 : 0;

  const accountAge = getAccountAgeDays(user);
  breakdown.accountAge = accountAge > 90 ? 20 : 0;

  const successfulTx = transactions.filter(t => t.status === 'Success').length;
  breakdown.successfulTransactions = successfulTx >= 10 ? 10 : 0;

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentFailedTx = transactions.filter(t => {
    const txDate = new Date(t.date).getTime();
    return (t.status === 'Failed') && Number.isFinite(txDate) && txDate >= thirtyDaysAgo;
  }).length;
  breakdown.noRecentFailures = recentFailedTx === 0 && transactions.length > 0 ? 10 : 0;

  const userFlaggedTx = transactions.filter(t => allFlaggedIds.has(t.id)).length;
  breakdown.noFlagged = userFlaggedTx === 0 && transactions.length > 0 ? 10 : 0;

  breakdown.loginPattern = 0;

  breakdown.twoFactor = (user as any).twoFactorEnabled ? 10 : 0;

  breakdown.total = Math.min(
    breakdown.kyc +
    breakdown.accountAge +
    breakdown.successfulTransactions +
    breakdown.noRecentFailures +
    breakdown.noFlagged +
    breakdown.loginPattern +
    breakdown.twoFactor,
    100
  );

  return breakdown;
}
