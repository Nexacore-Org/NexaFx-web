# NexaFX Web — API Integration Audit

**Date:** 2026-05-27
**Tester:** devhenryno
**Backend URL:** https://nexafx-backend.onrender.com/v1
**Method:** Static code audit of all relevant source files + live HTTP probe of every endpoint.

---

## Endpoint Test Results

> **Legend:** ✅ Live 2xx (working) · ❌ Wrong path / not connected · ⚠️ Wired but broken · 🔴 Backend error (5xx) · 🔒 Requires auth (401 confirmed — route exists)

| Endpoint | Method | Status | Live Result | Notes |
|----------|--------|--------|-------------|-------|
| `/auth/login` | POST | ✅ 200 | `{"success":true,"data":{"message":"If an account exists…"}}` | Wired correctly in `lib/api/auth.ts`. Returns a generic "OTP sent" response regardless of whether the email exists — no account enumeration leakage. |
| `/auth/signup` | POST | ✅ 200 | `{"success":true,"data":{"message":"User has been created…"}}` | Wired correctly. Required payload: `{ email, phone, password }`. Returns 400 on duplicate email or validation failure. |
| `/auth/verify-signup-otp` | POST | 🔒 401 on bad OTP | `"Invalid OTP code"` | Route exists and responds correctly to wrong OTP. Wired in `app/signup/verify/page.tsx`. |
| `/auth/resend-signup-otp` | POST | ✅ 200 | `{"success":true,"data":{"message":"If a pending signup exists…"}}` | Wired correctly. |
| `/auth/verify-login-otp` | POST | 🔒 401 on bad OTP | `"Invalid credentials"` | Route exists. **Code bug:** `app/(auth)/verify-otp/page.tsx` casts response as `{ user: { id, name, email, role } }` but backend returns `firstName`/`lastName` — `user.name` will be `undefined` in the Zustand store after login. |
| `/auth/refresh` | POST | 🔴 500 (empty body) | `"Internal server error"` | Empty body crashes the endpoint — backend bug. The client in `lib/api-client.ts` sends `{ refreshToken }` which is correct, but the endpoint itself should return 400 not 500 on missing body. Client also bypasses the proxy for this call (`useProxy: false`), so `NEXT_PUBLIC_API_URL` being unset causes a silent logout. |
| `/auth/forgot-password` | POST | ✅ 200 | `{"success":true,"data":{"message":"If an account exists…"}}` | Wired correctly. Returns generic message — no email enumeration. |
| `/auth/reset-password` | POST | ⚠️ 400 on all payloads tested | `"Bad Request Exception"` | Returns 400 for `{ email, otp, newPassword }`, `{ otp, newPassword }`, `{ token, newPassword }`, and `{ otp, password }`. The exact required DTO could not be determined from probe responses. Either the backend uses a different field name or requires a session header. Needs backend team input. |
| `/users/profile` | GET | 🔒 401 | `"Unauthorized"` | Route exists and is protected. Wired in `lib/api/users.ts` (`useProxy: false`). Used by `components/dashboard/deposit.tsx` to fetch `walletAddress` for QR modal. PATCH and DELETE also wired. |
| `/exchange-rates?from=NGN&to=USD` | GET | 🔴 500 | `"Internal server error"` | **Backend bug** — returns 500 with or without an auth token. The Next.js route handler at `app/api/exchange-rates/route.ts` correctly calls this endpoint but will always receive a 500 error in the current backend state. The `MarketOverview` component and the Convert form rate lookup are therefore broken. |
| `/transactions` | GET | 🔒 401 | `"Unauthorized"` | Route exists. Wired correctly in `lib/api/transactions.ts` (via proxy). |
| `/transactions/:id` | GET | 🔒 401 | `"Unauthorized"` | Route exists. Wired in `lib/api/transactions.ts`. |
| `/transactions/deposit` | POST | 🔒 401 | `"Unauthorized"` | Route exists. **Code bug:** `createDeposit()` sends only `{ amount, currency }`. If backend requires `sourceAddress` (the user's Stellar public key), every deposit submission will return 400. Needs DTO verification with backend team. |
| `/transactions/withdraw` | POST | 🔒 401 | `"Unauthorized"` | Route exists. **Code bug:** `createWithdrawal()` sends `walletAddress` but backend DTO likely uses `destinationAddress`. Needs verification. |
| `/transactions/swap` | POST | 🔒 401 | `"Unauthorized"` | Route exists on backend. **Not connected** — `components/dashboard/convert/convert-form.tsx` has `disabled={true}` on its submit button (`title="Backend API integration coming soon"`). No `createSwap()` function exists in `lib/api/transactions.ts`. |
| `/transactions/convert` | POST | ❌ 404 | `"Cannot POST /v1/transactions/convert"` | This path does not exist. The correct backend route is `/transactions/swap`. |
| `/wallets/balances` | GET | ❌ 404 | `"Cannot GET /v1/wallets/balances"` | **Wrong path.** `lib/api/wallet.ts` calls `/wallets/balances` which does not exist. The correct path is `/users/wallet/balances` (confirmed 401 on that path). `WithdrawalForm.tsx` will show "Unable to load currencies or balances" on every authenticated render. |
| `/users/wallet/balances` | GET | 🔒 401 | `"Unauthorized"` | Correct path confirmed. |
| `/currencies` | GET | 🔴 500 | `"Internal server error"` | **Backend bug** — returns 500 with or without a Bearer token. `WithdrawalForm.tsx` calls `getCurrencies()` which relies on this endpoint; the currency selector will be empty for all users. |
| `/notifications` | GET | 🔒 401 | `"Unauthorized"` | Route exists. Wired in `lib/api/notifications.ts` (`useProxy: false`). |
| `/notifications/unread-count` | GET | 🔒 401 | `"Unauthorized"` | Route exists and is protected. Wired in `lib/api/notifications.ts`. |
| `/notifications/batch/mark-all-read` | PATCH | 🔒 401 | `"Unauthorized"` | Route exists. Wired correctly. |
| `/notifications/:id` (DELETE) | DELETE | 🔒 401 (expected) | Not directly probed (needs a real notification ID) | Wired in `lib/api/notifications.ts`. Route assumed to exist given the batch route works. |
| `/admin/metrics` | GET | 🔒 401 | `"Unauthorized"` | Route exists. **Not connected** — admin analytics page uses `mockAdminMetrics` from `lib/admin-mock-data.ts`. |
| `/admin/users` | GET | 🔒 401 | `"Unauthorized"` | Route exists. **Not connected** — admin users page uses `mockAdminUsers`. |
| `/admin/transactions` | GET | 🔒 401 | `"Unauthorized"` | Route exists. **Not connected** — admin transactions page uses mock data. |
| `/admin/push-notifications` | GET/POST | 🔒 401 | `"Unauthorized"` | Route exists at `/admin/push-notifications`. **Not connected** — admin push notification pages use `lib/admin-mock-data.ts`. Note: bare `/push-notifications` returns 404 — correct path has `/admin/` prefix. |
| MoonPay deposit modal | — | ❌ Silent fail | N/A | `handleMoonPayOpen()` in `components/dashboard/deposit.tsx` silently returns with no user-facing error when `NEXT_PUBLIC_MOONPAY_API_KEY` is missing from `.env`. |

---

## Sections Still Using Mock Data

| Section | File | Mock Data Source | Backend Endpoint Available? |
|---------|------|------------------|-----------------------------|
| Admin analytics metrics | `app/(admin)/admin/analytics/page.tsx` | `mockAdminMetrics`, `mockAdminUsers` from `lib/admin-mock-data.ts` | **Yes** — `GET /admin/metrics` (401 confirmed) |
| Admin transaction table | `components/admin/AdminUserTable.tsx` and transaction page | `mockAdminTransactions` from `lib/admin-mock-data.ts` | **Yes** — `GET /admin/transactions` (401 confirmed) |
| Admin push notifications | `app/(admin)/admin/push-notifications/page.tsx` | `mockPushNotifications` from `lib/admin-mock-data.ts` | **Yes** — `GET /admin/push-notifications`, `POST /admin/push-notifications` (401 confirmed) |
| Admin user list | `app/(admin)/admin/users/page.tsx` | `mockAdminUsers` from `lib/admin-mock-data.ts` | **Yes** — `GET /admin/users` (401 confirmed) |
| Admin user detail panel | `components/admin/UserDetailPanel.tsx` | `AdminUser` from `mockAdminUsers` | **Yes** — `GET /admin/users/:id` (assumed, base route confirmed) |
| Revenue chart | `components/admin/RevenueChart.tsx` | `mockRevenueData` (100 generated data points) in `lib/admin-mock-data.ts` | **Partial** — `GET /admin/metrics` returns summary totals; a time-series revenue endpoint was not confirmed during the probe. |
| Convert form rates & balances | `components/dashboard/convert/convert-form.tsx` | `MOCK_RATES` and `MOCK_BALANCES` hardcoded inline constants | **Yes** — `GET /exchange-rates` for rates (currently 500 backend bug); `GET /users/wallet/balances` for balances (401 confirmed). Submit button is permanently disabled. |
| Account overview balances | `components/dashboard/account-overview.tsx` | Hardcoded `"₦ 325,980.65"`, `"₦250,250"`, `"$1,160.52"`, and a fake wallet address `0x1234...` | **Yes** — `GET /users/wallet/balances` (401 confirmed). `getBalances()` API function exists in `lib/api/wallet.ts` but is not called from this component at all. |
| Transaction secondary currency | `components/transactions/transaction-table.tsx` line 70 | Hardcoded `80 USD` string on every row | No backend needed — should render `tx.toAmount + ' ' + tx.toCurrency` when available (for Convert transactions), and nothing for Deposit/Withdraw. |
| `app/lib/api/transactions.ts` | Orphaned duplicate file | `mockTransactions` local array, `setTimeout` delay | **Yes** — same backend as `lib/api/transactions.ts`. This file is NOT imported anywhere in the active app (transaction page correctly uses `lib/api/transactions.ts`). Should be deleted to avoid confusion. |
| `lib/mock-notifications.ts` | Orphaned file | 10 hardcoded `Notification` objects | Not imported anywhere. Safe to delete. |
| `lib/mock-data.ts` | Deprecated stub | Re-exports real types; `mockTransactions: never[]` | Marked `@deprecated` in JSDoc. Not imported anywhere meaningfully. Safe to delete. |

---

## Broken or Disconnected Integrations

### 1. `GET /wallets/balances` → 404 (wrong path) — HIGH
**File:** `lib/api/wallet.ts`
Client calls `/wallets/balances`. Live test confirms **404 Not Found**. Correct backend path is `/users/wallet/balances` (confirmed via live 401 test). The `WithdrawalForm.tsx` component shows "Unable to load currencies or balances. Please try again." on every render for authenticated users because this call always fails.

### 2. `GET /currencies` → 500 (backend error) — HIGH
**Live result:** Returns 500 "Internal server error" with or without an Authorization header — this is a **backend bug**, not a missing auth token. The `WithdrawalForm.tsx` currency dropdown is empty for every user. The `ConvertForm` also relies on this data (currently uses `MOCK_BALANCES` inline, so not immediately visible). Needs investigation by the backend team.

### 3. `GET /exchange-rates` → 500 (backend error) — HIGH
**Live result:** Returns 500 "Internal server error" with or without an Authorization header — **backend bug**. The `MarketOverview` component on the dashboard (NGN/USD, NGN/GBP, NGN/EUR rate cards) receives 500 on every poll. The `app/api/exchange-rates/route.ts` Next.js handler correctly calls the backend but will always return the error to the client. Needs backend team investigation.

### 4. `POST /transactions/withdraw` — field name mismatch (unverified) — HIGH
**File:** `lib/api/transactions.ts`, `CreateWithdrawalDto`
Client sends `{ currency, amount, walletAddress }`. Backend `CreateWithdrawalDto` likely uses `destinationAddress`. Could not verify field names without an authenticated test (backend returns 401, not 400 with validation detail). Every withdrawal attempt is expected to fail with a 400.

### 5. `POST /transactions/deposit` — possibly missing required field — HIGH
**File:** `lib/api/transactions.ts`, `CreateDepositDto`
Client sends only `{ amount, currency }`. Backend may additionally require a `sourceAddress` (the user's Stellar wallet public key). Could not verify without an authenticated test. Deposit submissions may fail.

### 6. Convert button permanently disabled — MEDIUM
**File:** `components/dashboard/convert/convert-form.tsx`
`disabled={true}` is hardcoded on the submit button with `title="Backend API integration coming soon in a future release"`. The backend endpoint `POST /transactions/swap` is confirmed to exist (returns 401, not 404). No `createSwap()` function exists in `lib/api/transactions.ts`. The form also uses `MOCK_RATES` and `MOCK_BALANCES` inline constants.

### 7. Hardcoded `80 USD` in transaction table — MEDIUM
**File:** `components/transactions/transaction-table.tsx` line 70
`<div className="text-xs text-muted-foreground font-normal">80 USD</div>` with comment `{/* Hardcoded secondary currency for visual match */}`. Should render `tx.toAmount` + `tx.toCurrency` when both are present (applicable only to Convert transactions), and be omitted entirely for Deposit/Withdraw rows.

### 8. Account overview shows hardcoded mock balances — MEDIUM
**File:** `components/dashboard/account-overview.tsx`
The `fetchAccount` function is a stub with `await new Promise(res => setTimeout(res, 1000))` and sets hardcoded values: `₦ 325,980.65`, `₦250,250`, `$1,160.52`, and fake wallet address `0x1234567890123456789012345678901234567890`. The `getBalances()` function in `lib/api/wallet.ts` exists but is not called here. This is the most visible mock data issue for end users — every authenticated user sees the same fake balance.

### 9. Exchange rate route handler sends no auth token — MEDIUM
**File:** `app/api/exchange-rates/route.ts`
The server-side route handler fetches from the backend without forwarding an Authorization header. Since the backend's `/exchange-rates` endpoint returns 500 (currently a backend bug anyway), this cannot be fully tested — but once the backend is fixed, if the endpoint requires auth, this handler will need to forward the user's token from the incoming request.

### 10. `POST /auth/reset-password` DTO mismatch — MEDIUM
**File:** `app/(auth)/reset-password/page.tsx` (via `lib/api/auth.ts`)
Client sends `{ email, otp, newPassword }`. Live tests show 400 for every payload variant tested including without `email`, without `otp`, with `token` instead of `otp`, and with `password` instead of `newPassword`. The exact required DTO cannot be determined from response bodies (backend returns generic "Bad Request Exception" without field details). Backend team must confirm the expected shape.

### 11. Login response shape mismatch — `user.name` undefined — MEDIUM
**File:** `app/(auth)/verify-otp/page.tsx` line 75
Type assertion: `{ user: { id: string; name: string; email: string; role: 'USER' | 'ADMIN' } }`. Backend returns `firstName`/`lastName` separately with no `name` field. The `User.name` field in the Zustand `useAuthStore` will be `undefined` after every login. Any UI element rendering `user.name` (topbar, admin panel header) will show nothing.

### 12. `POST /auth/refresh` — backend returns 500 on empty body — LOW (backend bug)
**File:** Backend `/auth/refresh`
Live test with empty body `{}` returns 500 instead of the expected 400. The client-side call in `lib/api-client.ts` sends `{ refreshToken: refreshTokenStr }` which is the correct shape, so this is unlikely to be hit in normal use. However, it reveals the backend endpoint lacks input validation guarding.

### 13. MoonPay integration silently fails with no user feedback — LOW
**File:** `components/dashboard/deposit.tsx` lines 86–93
`handleMoonPayOpen()` calls `return` with no error state or toast when `NEXT_PUBLIC_MOONPAY_API_KEY` is absent. The MoonPay button does not visually indicate a disabled or error state when the key is missing — users click it and nothing happens.

### 14. `app/lib/api/transactions.ts` orphaned mock file still present — LOW
**File:** `app/lib/api/transactions.ts`
Returns hardcoded mock data via a `setTimeout` stub. Also defines a **different** `Transaction` type (uses `'Completed'`/`'Cancelled'` statuses vs. the real file's `'Success'`/`'Failed'`). Confirmed it is **not imported** by any active page — `app/(dashboard)/transactions/page.tsx` correctly imports from `lib/api/transactions.ts`. Leaving this file is a maintenance risk — a future contributor could accidentally import from the wrong path.

---

## Proxy and Token Behaviour

### How the proxy works
`app/api/proxy/[...path]/route.ts` reads the auth token with this priority:
1. `x-client-token` request header (set by `apiClient` when `useProxy: true`)
2. `access_token` cookie on the incoming request
3. `DEV_TOKEN` (value of `process.env.TEST_ACCESS_TOKEN` environment variable)

It then sets `Authorization: Bearer <token>` on the outbound backend request.

### DEV_TOKEN auth bypass risk — **SECURITY CONCERN**
If `TEST_ACCESS_TOKEN` is set in any deployed environment (Render staging/production), **every proxied request from any visitor — including unauthenticated ones — will be authorised using that dev token**. This means:
- All `GET /transactions`, `GET /notifications`, `PATCH /notifications/:id` calls made by unauthenticated users would succeed and return data belonging to whoever owns the dev token.
- This would silently mask all authentication failures for proxy-routed endpoints during testing, making the auth guard appear to work when it does not.

**Recommendation:** `TEST_ACCESS_TOKEN` must only be set in local development. The `.env.example` file should add a warning comment to this effect. Long term, the proxy should return 401 when no client token is present rather than falling back to a dev credential.

### Token forwarding — proxy calls (useProxy: true)
`apiClient` (browser) → `x-client-token: <localStorage access_token>` header → Next.js proxy handler → `Authorization: Bearer <token>` header → backend. This chain is **correct**. Confirmed by live test showing 401 (not 404) on all proxy-routed authenticated endpoints.

### Direct backend calls (useProxy: false)
The following API modules bypass the proxy and call `NEXT_PUBLIC_API_URL` directly from the browser: `lib/api/auth.ts`, `lib/api/users.ts`, `lib/api/notifications.ts`, `lib/api/currencies.ts`. This requires the backend to have CORS configured for the frontend origin. If `NEXT_PUBLIC_API_URL` is unset (empty string), all these calls will hit the Next.js server itself and fail silently.

---

## Recommended Next Steps

**Priority: Immediate (blocks core functionality for all users)**

1. **Fix `GET /wallets/balances` path** (`lib/api/wallet.ts`)
   Change the path from `/wallets/balances` to `/users/wallet/balances`. This unblocks `WithdrawalForm.tsx` which currently shows an error on every load and also allows `AccountOverview` to be wired up.

2. **Investigate `/currencies` and `/exchange-rates` 500 errors on backend**
   Both endpoints return 500 server error regardless of auth token. This is a backend bug that blocks the currency dropdown in `WithdrawalForm.tsx`, the market rate cards in `MarketOverview`, and the convert form rate display. Backend team must investigate and fix.

3. **Wire real balances into `AccountOverview`** (`components/dashboard/account-overview.tsx`)
   Replace the `setTimeout` stub with a call to `getBalances()` from `lib/api/wallet.ts` (after fixing the path per item 1). Every authenticated user currently sees fake hardcoded balances.

**Priority: High (breaks key transaction flows)**

4. **Verify and fix `POST /transactions/withdraw` DTO** (`lib/api/transactions.ts`)
   Confirm the backend's expected field name (`walletAddress` vs `destinationAddress`). Update `CreateWithdrawalDto` and the `createWithdrawal` call accordingly.

5. **Verify and fix `POST /transactions/deposit` DTO** (`lib/api/transactions.ts`)
   Confirm whether `sourceAddress` or any additional field is required by the backend. Update `CreateDepositDto` accordingly.

6. **Fix login response mapping — `user.name`** (`app/(auth)/verify-otp/page.tsx`, `hooks/use-auth-store.ts`)
   Update the type assertion and `User` interface to use `firstName`/`lastName` (or a combined `name` field if the backend can return one). Any UI rendering `user?.name` currently shows nothing.

7. **Clarify `POST /auth/reset-password` expected DTO**
   Four payload variants all returned 400 during live testing. Backend team must document or expose the required field names. Update `lib/api/auth.ts` `resetPassword()` accordingly.

**Priority: Medium (visible gaps / broken features)**

8. **Wire up the Convert form** (`components/dashboard/convert/convert-form.tsx`)
   Replace `MOCK_RATES`/`MOCK_BALANCES` with live calls. Add `createSwap()` to `lib/api/transactions.ts` calling `POST /transactions/swap`. Remove the `disabled={true}` once DTO is confirmed.

9. **Fix the hardcoded `80 USD`** (`components/transactions/transaction-table.tsx` line 70)
   Render `tx.toAmount + ' ' + tx.toCurrency` when both fields are present (Convert transactions only); omit the secondary line for Deposit/Withdraw rows.

10. **Add auth token forwarding to the exchange rate route handler** (`app/api/exchange-rates/route.ts`)
    Once the backend 500 is resolved, ensure this route forwards the user's token from the incoming request to the backend, or confirm with the backend team whether the endpoint is intended to be public.

11. **Wire admin panel to real API**
    Replace all `lib/admin-mock-data.ts` imports in `app/(admin)/` with real calls to `GET /admin/metrics`, `GET /admin/users`, `GET /admin/transactions`, `GET /admin/push-notifications`, and `POST /admin/push-notifications`. All backend routes exist (confirmed 401 on all).

**Priority: Low (clean-up / UX)**

12. **Add user-facing error for missing MoonPay API key** (`components/dashboard/deposit.tsx`)
    `handleMoonPayOpen()` should display a toast or error message when `NEXT_PUBLIC_MOONPAY_API_KEY` is absent, rather than silently doing nothing.

13. **Delete orphaned mock files**
    - `app/lib/api/transactions.ts` — mock data, not imported anywhere
    - `lib/mock-notifications.ts` — not imported anywhere
    - `lib/mock-data.ts` — deprecated stub, not meaningfully imported

14. **Restrict and document `TEST_ACCESS_TOKEN`** (`.env.example`, `app/api/proxy/[...path]/route.ts`)
    Add a warning comment to `.env.example` that `TEST_ACCESS_TOKEN` must never be set in staging or production. Consider removing the dev-token fallback from the proxy route and requiring explicit token presence.

15. **Investigate `POST /auth/refresh` returning 500 on empty body**
    The backend should return 400 for a missing/invalid body, not 500. Flag to backend team.
