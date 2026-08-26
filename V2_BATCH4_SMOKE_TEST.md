# V2 Batch 4 Smoke Test

**Date:** 2026-07-26
**Branch:** v2

---




## Checklist

### KYC
- [ ] Multi-step KYC wizard completes end-to-end (6 steps)
- [ ] BVN verification returns name on record
- [ ] NIN verification offered as alternative
- [ ] Document upload with image preview works

### Landing Page
- [ ] Currency calculator works without login
- [ ] Rate ticker scrolls and pauses on hover

### Mobile UX
- [ ] Bottom navigation replaces hamburger on mobile
- [ ] Swipeable transaction cards work on mobile

### Finance Tools
- [ ] Budget tracker shows real monthly spend
- [ ] Savings goals show correct progress from wallet balance
- [ ] Fee estimator calculates correct amounts
- [ ] Tax report exports correct CSV and PDF
- [ ] Split payment submits to all recipients
- [ ] Memo field included in convert and withdraw payloads

### Security
- [ ] Two-step withdrawal security check fires for large amounts
- [ ] PIN lock activates after configured inactivity
- [ ] OTP resend cooldown timer counts down correctly
- [ ] Wallet address validation rejects invalid addresses
- [ ] Memo warning shown for known exchange addresses

### Admin
- [ ] Advanced user filters all work correctly
- [ ] Flagged transaction review queue shows pending items
- [ ] Whitelist action removes from queue
- [ ] Trust score displayed correctly with colour coding
- [ ] Admin notes save and are marked as internal-only
- [ ] Broadcast email sends with BROADCAST confirmation
- [ ] Geographic distribution chart shows top countries
- [ ] Registration trends chart shows 30D data
- [ ] User segment charts render correctly
- [ ] Peak usage hourly chart shows 24 bars
- [ ] Cohort retention table shows colour-coded percentages
- [ ] Real-time active users count updates

### New Features
- [ ] Referral leaderboard shows top 10 with medals
- [ ] Rate history chart shows 7D/30D/90D on convert page
- [ ] Contact address book add, search, send-to work
- [ ] CSV contact import works with error reporting
- [ ] Dashboard greeting personalised with real first name
- [ ] Transaction timeline view groups by date correctly
- [ ] Voucher code applies fee discount
- [ ] QR scanner populates withdrawal address
- [ ] Notification sounds play on correct events
- [ ] Currency news feed loads articles
- [ ] Stellar on-chain details shown in transaction modal

### Infrastructure
- [ ] Feature flags disable correct features
- [ ] Sentry captures errors in production build
- [ ] Error boundaries prevent full-page crashes
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero errors
- [ ] `npm run test` — zero failures

---

## Notes
- This document captures the final gate checklist for issues 111–169.
- All items must pass before Batch 4 features are considered production-ready.
