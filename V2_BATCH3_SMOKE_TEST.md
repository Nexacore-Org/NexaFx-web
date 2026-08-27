# V2 Batch 3 Smoke Test

This document summarizes the results of the smoke test for the V2 Batch 3 features.

## Real-time

- **[PASS]** Real-time balance updates are received via WebSocket.
- **[PASS]** Real-time connection status indicator is visible and accurate.
- **[PASS]** WebSocket connection attempts use exponential backoff on failure.

## Security & Auth

- **[PASS]** 2FA setup flow (scan QR, enter code) works correctly.
- **[FAIL]** 2FA disable flow is broken.
- **[PASS]** Passkey registration flow works correctly.
- **[FAIL]** Passkey login is not integrated into the login page.
- **[PASS]** Session timeout warning appears 2 minutes before expiry..

## User Features

- **[PASS]** Referral link/code copies to clipboard.
- **[PASS]** Scheduled transfers can be created.
- **[FAIL]** Saved beneficiaries do not appear in the withdrawal form dropdown.
- **[FAIL]** Price alert creation and deletion are not implemented.
- **[FAIL]** Activity log does not show real login and account events.
- **[PASS]** Portfolio donut chart renders with real balances.
- **[FAIL]** Conversion history chart shows mock data.
- **[PASS]** Support FAQ accordion opens and closes correctly.
- **[PARTIAL]** Contact form submits and shows success state, but the API call is mocked.
- **[FAIL]** Rate comparison widget is not implemented on the convert page.
- **[FAIL]** Bank transfer tab does not show virtual account details.

## UX/Mobile

- **[PASS]** Dashboard is mobile-responsive.
- **[PASS]** "Pull to refresh" is implemented on mobile.
- **[PASS]** Main navigation is a slide-over menu on mobile.
- **[FAIL]** Settings page does not use tabs for navigation.
- **[PASS]** Forms are usable on mobile (inputs are not obscured by keyboard).
- **[PASS]** PWA "Add to Home Screen" prompt appears.

## Notifications

- **[PASS]** Notification bell shows an indicator for unread items.
- **[PASS]** Notification drawer opens and shows a list of notifications.
- **[PASS]** Clicking "Mark all as read" works.
- **[FAIL]** Real-time notifications do not appear without a page refresh.

## Admin

- **[FAIL]** Admin dashboard is not accessible at `/admin`.
- **[FAIL]** Admin cannot view a list of all users.
- **[FAIL]** Admin cannot view a specific user's details.
- **[FAIL]** Admin cannot suspend or unsuspend a user.
- **[FAIL]** Admin cannot view system health metrics.