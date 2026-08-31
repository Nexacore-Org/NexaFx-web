# Security Notes

## Admin Authorization

The current admin gate is implemented by the client-side `AdminGuard` component. After OTP login, the backend response supplies `user.role` as either `USER` or `ADMIN`; the login flow passes that value into `useAuthStore.setAuth`, where it is retained in the persisted user state. `AdminGuard` then allows the protected view only when the session is authenticated and `user.role === "ADMIN"`; unauthenticated users are redirected to sign-in and other users are redirected to the dashboard.

This is currently client-side-only enforcement. The role check and persisted client state must not be treated as a server-side security boundary, because a client can modify its own state. Server-side or middleware enforcement is tracked separately in issue #590 and is the intended resolution for this limitation.

## CSP Rollout Process

`middleware.ts` sets two CSP headers on every non-static response:

- **`Content-Security-Policy`** -- the policy actually enforced today. Changing this directly enforces the change immediately for every user, with no way to see breakage before it happens.
- **`Content-Security-Policy-Report-Only`** -- a candidate policy that is stricter than what's enforced. The browser evaluates it and sends a violation report for anything that would have been blocked, but never actually blocks the resource. This is the safety net for any future tightening.

Violation reports are sent to `POST /api/csp-report` (`report-uri` for broad browser support, `report-to`/`Reporting-Endpoints` for browsers that have moved to the modern Reporting API) and logged to the server console, tagged `[source=csp-report-only]`, so they're queryable in whatever log aggregation is already in place without redeploying anything. (`@sentry/nextjs` is referenced elsewhere in this repo's config but isn't currently an installed dependency, so this endpoint intentionally doesn't depend on it -- wiring reports into Sentry once that's fixed is a natural follow-up.)

As of this PR, the report-only policy differs from the enforced one by dropping `'unsafe-inline'` from `style-src` -- that's the next tightening candidate. `script-src` is already nonce + `'strict-dynamic'` with no `unsafe-inline`/`unsafe-eval` in the header `middleware.ts` sets; the `'unsafe-eval' 'unsafe-inline'` entry still present in `next.config.ts`'s `securityHeaders` is effectively neutralized in browsers today (when multiple `Content-Security-Policy` headers are present, a resource must satisfy all of them), but removing it from that config is tracked as separate follow-up cleanup so it doesn't read as an active permission.

### Process for tightening the CSP further

1. **Propose the tightened directive** as a report-only change: edit the `reportOnlyCspHeader` in `middleware.ts` (not the enforced `cspHeader`) to remove or restrict the directive you want to validate.
2. **Ship it and wait.** Let it run in production against real traffic for a meaningful window (at least a few days, longer if the app has weekly-cadence flows like billing or scheduled reports that might only run on specific days).
3. **Review violation reports** in the server logs (filter by `[source=csp-report-only]`). Each report includes the blocked URI, violated directive, and the document URL, which is normally enough to tell whether a violation is a real regression (a legitimate script/style path outside the new policy) or expected noise (e.g. a browser extension injecting content, which shows up as `blocked-uri: about:blank` or similar and can be ignored).
4. **Fix any real findings** -- add the legitimate source to the policy (or move inline styles/scripts to a file so they pick up the nonce) -- and repeat from step 2 until reports are clean for the review window.
5. **Promote the change**: move the now-validated directive from `reportOnlyCspHeader` into the enforced `cspHeader`, so it's actually blocking. Keep the report-only header a step ahead with the next candidate tightening, if there is one.
6. **Never promote straight from "no data"** -- if a directive was never actually run in report-only mode in production, tightening it directly in the enforced header skips the entire point of this mechanism.
