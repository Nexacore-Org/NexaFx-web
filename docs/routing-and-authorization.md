# Routing & Authorization Conventions

This note documents the app's route-group structure and which layout/guard is
responsible for which part of authentication and authorization.

## Route groups: `app/(admin)` vs `app/(dashboard)`

Both folders are Next.js **route groups** (parentheses), so they do **not**
appear in the URL:

| Route group | Example pages | Visible URL |
| --- | --- | --- |
| `app/(admin)` | `admin/analytics`, `admin/users`, `admin/transactions`, `admin/push-notifications` | `/admin/...` |
| `app/(dashboard)` | `dashboard`, `profile`, `settings`, `transactions`, `notifications` | `/dashboard` and `/...` |

The split exists so the two areas can have **completely different layouts**:

- **`app/(dashboard)/layout.tsx`** owns the user shell (sidebar, topbar, mobile
  drawer) and the **authentication gate** for the member area.
- **`app/(admin)/layout.tsx`** owns the admin shell (admin sidebar, header) and
  wraps everything in the **`AdminGuard`** role check.

## What each layout/guard is responsible for

### Dashboard layout (`app/(dashboard)/layout.tsx`) — client-side auth redirect

- A `"use client"` layout that subscribes to the auth store
  (`useAuthStore`) for `isAuthenticated` / `accessToken`.
- On mount, if the user is **not authenticated** (no token), it calls
  `router.replace('/sign-in')`.
- Until auth is confirmed it renders `null` (empty page) so the shell never
  flashes before the redirect.

### Admin layout + `AdminGuard` (`components/admin/AdminGuard.tsx`) — client-side role check

- `app/(admin)/layout.tsx` renders its children inside `<AdminGuard>`.
- `AdminGuard` enforces **two** rules, in order:

  1. **Not authenticated** → `router.push('/sign-in')`.
  2. **Authenticated but `user.role !== 'ADMIN'`** → `router.push('/dashboard')`.
  3. Only when `accessToken` + `isAuthenticated` and `user.role === 'ADMIN'`
     does it render the admin children.

- The `role` value comes from the auth store (`user.role: "USER" | "ADMIN"`),
  which is populated on OTP verification (`setAuth` in the verify-otp flow).

## The current limitation: client-side-only admin gating

The admin role gate is enforced **in the browser only** (the two layouts above
push the user elsewhere). There is **no server-side (middleware / fetch-handler)
enforcement** yet — an unauthenticated client could, in principle, request
admin data. This is a known limitation that is tracked for hardening; when the
server-side enforcement (e.g. in `middleware.ts`) lands, this doc and the guard
should be updated. **Do not** rely on `AdminGuard` alone to protect admin data —
the backend must also authorize admin routes.

## How to add a page to each area

- **Dashboard page:** create `app/(dashboard)/<slug>/page.tsx`. It automatically
  gets the member shell and the auth gate from the shared layout. No extra work.
- **Admin page:** create `app/(admin)/admin/<slug>/page.tsx`. It automatically
  gets the admin shell and `AdminGuard`. Remember any data fetch on the page
  still depends on backend-side authorization for admin endpoints.