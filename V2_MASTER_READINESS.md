# V2 Master Readiness

**Date:** 2026-06-27
**Branch:** v2

This document serves as the master readiness checklist for merging the `v2` branch to `main`. It summarises the completion of all three batch smoke tests and the current system status.

## Prerequisites Checklist
- [x] V2_SMOKE_TEST.md committed
- [x] V2_BATCH2_SMOKE_TEST.md committed
- [x] V2_BATCH3_SMOKE_TEST.md committed

## Master Checklist

### Core Functionality
- [x] Full auth flow works end-to-end: signup → OTP → login → dashboard → logout
- [x] All balances show real data — zero hardcoded values in the codebase
- [x] Convert form submits successfully via POST /transactions/swap
- [x] Withdrawal form submits successfully via POST /transactions/withdraw
- [x] Deposit form submits successfully via POST /transactions/deposit

### UI / UX
- [x] All "coming soon" removed and replaced with working mockups or real implementations
- [x] Empty states exist for all pages displaying lists or data (transactions, notifications, admin lists)
- [x] Session timeout warning modal appears 2 minutes before expiry
- [x] Network offline banner appears when connection drops
- [x] Dashboard widget customiser works with drag-and-drop
- [x] Tooltip system functional across all labelled locations
- [x] Global search works: pages, transactions, and currency codes

### Forms & Validation
- [x] All 8 forms use `react-hook-form` with `zodResolver`
- [x] Validation errors display inline correctly
- [x] Withdrawal confirmation modal shows full address before submission
- [x] Convert confirmation step shows before swap submission

### Admin Panel
- [x] Revenue chart uses real data — no `mockRevenueData` imports
- [x] Transaction search by email and ID works
- [x] CSV export downloads a valid file with correct type mapping
- [x] Admin push notifications fully implemented and integrated

### Quality & Security
- [x] 0 console.error or unhandled promise rejections on load
- [x] Security headers present (7 headers configured in next.config.ts)
- [x] Store state is properly managed; navigating between dashboard pages does not trigger duplicate balance API calls
- [x] After a swap, new transaction appears in list without reload
- [x] SEO metadata implemented for root layout
- [x] robots.txt and sitemap.xml generated

### Infrastructure
- [x] `npm run build` passes with zero errors (Strict Type Checking Enabled)
- [x] `npm run lint` passes with zero errors
- [x] PWA support implemented (manifest + service worker config)
- [x] Hausa, Yoruba, and Igbo translations complete and enabled via next-intl

## Outstanding Items
None. All components, hooks, and build errors have been fully resolved. The project builds without any TypeScript or Webpack errors.

## Conclusion
The `v2` branch has passed all readiness checks and is officially approved for merging into `main`.
