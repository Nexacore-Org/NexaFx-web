# Local Development Setup

This guide explains how to run the NexaFX frontend locally, including a
**mock backend** that lets you develop against the app's most-used endpoints
without credentials or access to the real backend.

## Prerequisites

- Node.js 20+ (the CI pipeline uses Node 20)
- npm (the project is npm-based — it ships a `package-lock.json`)

## 1. Clone and install

```sh
git clone https://github.com/Nexacore-Org/NexaFx-web.git
cd NexaFx-web
npm install
```

## 2. Configure environment variables

```sh
cp .env.example .env
```

The frontend talks to a backend through two paths:

- `NEXT_PUBLIC_API_URL` — the base URL used both by the client (`lib/api-client.ts`),
  the `/api/proxy/[...path]` route handler, and the `/api/exchange-rates` route.
- `TEST_ACCESS_TOKEN` — **local development only** fallback token used by the
  proxy when no user token is present. Never set it in deployed environments.

## 3. Choose your backend

You have two options:

### Option A — Real backend

If you have access to the real backend, set:

```sh
NEXT_PUBLIC_API_URL=<your-backend-url>
TEST_ACCESS_TOKEN=<token-for-local-dev>
```

### Option B — Mock backend (no backend credentials required)

The repository includes a dependency-free mock backend that serves canned data
for the app's most-used endpoints (auth, exchange rates, transactions, wallet
balances, notifications, and the admin endpoints).

1. Start the mock server:

   ```sh
   node mock-backend/server.mjs
   ```

   It listens on `http://localhost:3001` by default (override with `PORT=4000`).

2. Point the frontend at it in `.env`:

   ```sh
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

   (This is already the value in `.env.example`.)

3. Start the frontend:

   ```sh
   npm run dev
   ```

The mock server answers:

| Endpoint | Method | What it returns |
| --- | --- | --- |
| `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-*`, `/auth/resend-*`, `/auth/refresh` | POST | Fixed success payloads (any credentials/OTP are accepted) |
| `/exchange-rates?from=NGN&to=USD` | GET | A deterministic fake rate |
| `/transactions` | GET | A small list of sample transactions |
| `/transactions/withdraw`, `/transactions/deposit`, `/transactions/swap` | POST | Fixed "pending" results |
| `/users/wallet/balances`, `/users/me` | GET | Sample balances / profile |
| `/notifications`, `/notifications/unread-count` | GET | Sample notifications |
| `/notifications/*` | PATCH/DELETE | Empty success responses |
| `/admin/metrics`, `/admin/users`, `/admin/transactions`, `/admin/push-notifications` | GET/POST | Sample admin data |

The mock server sends CORS headers, so both server-side proxied requests and
direct browser requests work. All OTPs, passwords, and tokens are accepted —
you can complete the full signup → verify → dashboard flow with any input.

### Which set of endpoints is "the app's most-used"?

The mock covers everything exercised by the primary user journeys: sign in /
sign up / verify OTP, reset password, dashboard exchange rates, deposit /
withdraw / convert, the notification bell, and the admin overview pages.

## 4. Useful scripts

```sh
npm run dev          # start the Next.js dev server
npm run lint         # ESLint on the whole repo
npm test             # run the Jest unit tests
npm run test:watch   # run Jest in watch mode while writing tests
npm run build        # production build
```

## Troubleshooting

- **Stale build / confusing dev-server errors.** Delete the `.next` and
  `node_modules/.cache` directories, then restart the dev server.
- **CORS errors when using a real backend.** Make sure the backend allows the
  `Origin` your dev server runs on, and that `NEXT_PUBLIC_API_URL` has no
  trailing slash.