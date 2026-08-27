# V2 Batch 4A Smoke Test Results

**Date:** 2026-07-26  
**Branch:** v2  
**Scope:** Issues 111-148

This smoke test was completed by inspecting the v2 code paths and running available project checks. Full browser verification is blocked by existing unrelated build and lint failures listed in the Build section..

## KYC Flow

| Item | Status | Notes |
| --- | --- | --- |
| Multi-step KYC wizard completes all 6 steps end-to-end | PARTIAL | `src/components/kyc/kyc-wizard.tsx` contains the multi-step flow, but end-to-end completion could not be verified without a working app build. |
| BVN verification validates and shows name on record | PARTIAL | `src/components/kyc/bvn-verification-form.tsx` exists, but backend validation could not be exercised. |
| NIN verification offered as alternative to BVN | PASS | `src/components/kyc/nin-verification-form.tsx` exists as the alternate path. |
| Document upload works with image preview | PASS | `components/dashboard/kyc/file-upload-step.tsx` includes preview behavior. |
| Rejection reason displayed with resubmit option | PARTIAL | KYC status/review UI exists, but rejection resubmission could not be verified end-to-end. |

## Landing Page

| Item | Status | Notes |
| --- | --- | --- |
| Currency calculator visible and functioning without login | PASS | `src/components/landing/currency-calculator.tsx` is present for unauthenticated landing usage. |
| Live rate ticker scrolling and pausing on hover | PASS | `src/components/landing/rate-ticker.tsx` and CSS include ticker behavior. |
| Ticker hidden when rate API fails | PARTIAL | Error state exists, but runtime failure handling could not be verified in browser. |

## Mobile UX

| Item | Status | Notes |
| --- | --- | --- |
| Bottom navigation visible below 768px | PASS | `components/dashboard/mobile-bottom-nav.tsx` is present. |
| Bottom nav hidden on desktop | PASS | Responsive classes hide desktop/mobile surfaces appropriately. |
| "More" bottom sheet opens correctly | PARTIAL | Bottom sheet components exist; interaction was not browser-tested. |
| Swipeable transaction cards on mobile | PASS | Swipe helpers and transaction mobile UI are present. |
| Swipe-left reveals action buttons | PARTIAL | Swipe code exists, but gesture behavior was not browser-tested. |

## Productivity Features

| Item | Status | Notes |
| --- | --- | --- |
| Transaction tags can be added, removed, and filtered | PASS | `components/dashboard/tag-input.tsx` and transaction filter utilities exist. |
| Budget tracker shows real spending from transaction history | PASS | `components/dashboard/budget-tracker.tsx` derives from transaction input data. |
| Savings goals progress matches wallet balance | PARTIAL | Savings utilities exist, but wallet-balance integration could not be verified. |
| Multi-device sessions list and termination work | PASS | `components/settings/active-sessions.tsx` and user API functions exist. |
| Fee estimator shows correct fee breakdown | PASS | `components/shared/fee-estimator-modal.tsx` is integrated into withdrawal flow. |
| Memo field appears on convert and withdraw forms | PARTIAL | Memo handling is present in transaction APIs; form-level coverage is inconsistent. |

## Finance Tools

| Item | Status | Notes |
| --- | --- | --- |
| Tax report generates correct CSV and PDF for selected year | PARTIAL | Export utilities exist, but PDF/CSV output was not verified end-to-end. |
| Voucher/promo code applies discount to convert form | FAIL | No voucher or promo-code flow was found in the convert form. |
| QR scanner populates withdrawal address input | FAIL | No QR scanner input flow was found. |
| Account tier displays correct limits | PARTIAL | Limit APIs and UI exist, but tier display could not be verified end-to-end. |
| Split payment submits to all recipients | FAIL | No split payment submission flow was found. |

## Admin

| Item | Status | Notes |
| --- | --- | --- |
| Advanced user filters (KYC, tier, date range) work | PARTIAL | Admin user search/filtering exists, but full filter coverage is incomplete. |
| Flagged transaction queue shows pending reviews | PARTIAL | Transaction flag actions exist, but a dedicated review queue was not found. |
| Whitelist action removes transaction from queue | FAIL | No whitelist action for flagged transactions was found. |
| Trust score calculated and displayed on user cards | FAIL | No trust score calculation/display was found. |
| Admin notes save and display correctly | PARTIAL | Dispute notes exist; general user admin notes were not found. |
| Broadcast email sends with typed confirmation | FAIL | No broadcast email typed-confirmation flow was found. |

## Other

| Item | Status | Notes |
| --- | --- | --- |
| Referral leaderboard shows top 10 with medals | PARTIAL | Referral page exists, but leaderboard medal display could not be verified. |
| Rate history chart shows data for 7D/30D/90D | PARTIAL | Rate/history charting code exists, but controls were not verified. |
| Contact address book add, search, and send-to work | FAIL | No contact address book UI was found. |
| Two-step withdrawal security check appears for large amounts | PARTIAL | Withdrawal review exists; large-amount-specific two-step behavior was not confirmed. |
| Currency news feed displays articles | FAIL | No currency news feed UI was found. |
| OTP resend cooldown timer counts down from 60 seconds | PASS | OTP resend cooldown behavior exists in auth flows. |
| Sound notification toggle in settings works | PARTIAL | Notification settings exist, but sound toggle behavior was not verified. |
| PIN lock screen activates after inactivity | FAIL | PIN lock was not implemented on v2 during this smoke test. |

## Build

| Item | Status | Notes |
| --- | --- | --- |
| `npm run build` passes | FAIL | Fails with existing repo structure error: `pages` and `app` directories should be under the same folder. |
| `npm run lint` passes | FAIL | Fails on existing unrelated lint/syntax issues across admin, dashboard, shared components, and tests. |

## Summary

| Category | Pass | Fail | Partial |
| --- | ---: | ---: | ---: |
| KYC Flow | 2 | 0 | 3 |
| Landing Page | 2 | 0 | 1 |
| Mobile UX | 2 | 0 | 3 |
| Productivity Features | 3 | 0 | 3 |
| Finance Tools | 0 | 3 | 2 |
| Admin | 0 | 3 | 3 |
| Other | 1 | 3 | 4 |
| Build | 0 | 2 | 0 |

## Recommendation

Do not consider Batch 4A production-ready until the build/lint blockers are fixed and the failed feature areas are implemented or explicitly removed from scope.
