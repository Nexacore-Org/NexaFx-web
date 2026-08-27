# Security Notes

## Admin Authorization

The current admin gate is implemented by the client-side `AdminGuard` component. After OTP login, the backend response supplies `user.role` as either `USER` or `ADMIN`; the login flow passes that value into `useAuthStore.setAuth`, where it is retained in the persisted user state. `AdminGuard` then allows the protected view only when the session is authenticated and `user.role === "ADMIN"`; unauthenticated users are redirected to sign-in and other users are redirected to the dashboard.

This is currently client-side-only enforcement. The role check and persisted client state must not be treated as a server-side security boundary, because a client can modify its own state. Server-side or middleware enforcement is tracked separately in issue #590 and is the intended resolution for this limitation.