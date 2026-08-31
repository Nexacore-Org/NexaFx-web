# Security Notes

## Admin Authorization

The current admin gate is implemented by the client-side `AdminGuard` component. After OTP login, the backend response supplies `user.role` as either `USER` or `ADMIN`; the login flow passes that value into `useAuthStore.setAuth`, where it is retained in the persisted user state. `AdminGuard` then allows the protected view only when the session is authenticated and `user.role === "ADMIN"`; unauthenticated users are redirected to sign-in and other users are redirected to the dashboard.

This is currently client-side-only enforcement. The role check and persisted client state must not be treated as a server-side security boundary, because a client can modify its own state. Server-side or middleware enforcement is tracked separately in issue #590 and is the intended resolution for this limitation.

## Dependency Vulnerability Scanning

Dependencies are scanned two ways:

- **CI gate**: every push/PR to `main` and `v2` runs `npm audit --audit-level=high` (see `.github/workflows/ci.yml`). The build fails if `npm audit` reports any new `high` or `critical` severity advisory.
- **Automated update PRs**: [`.github/dependabot.yml`](.github/dependabot.yml) opens weekly PRs for outdated npm packages and GitHub Actions. Dependabot also opens its own PRs immediately for any dependency with a known security advisory, independent of the weekly schedule.

### Triaging a flagged vulnerability

1. **Identify what's flagged.** Run `npm audit` locally (or read the CI job's output / the Dependabot PR description) to see the advisory ID, severity, and which package(s) pull in the vulnerable version — `npm ls <package>` shows the dependency chain.
2. **Check whether it's reachable.** Many advisories are in build-time or dev-only tooling that never ships to users, or affect a code path this app doesn't use (e.g. a server-only bug in a package only used client-side). This doesn't make the finding safe to ignore, but it changes the urgency.
3. **Prefer the smallest fix first.**
   - `npm audit fix` — applies fixes that stay within the version ranges already declared in `package.json` (safe, no breaking changes expected).
   - A Dependabot PR for the specific package — review the changelog/diff, run CI, and merge if green.
   - `npm audit fix --force` — only as a last resort. This can bump a dependency outside its declared semver range (including majors), so treat it like any other major-version upgrade: read the changelog, expect to fix breakage, and get it reviewed before merging.
4. **If there is no fix yet:**
   - Check whether the maintainer has a patched version in progress (the advisory page linked in the `npm audit` output usually says so).
   - Decide, with a maintainer, whether to pin/patch around it, remove the dependency, or explicitly accept the risk for a bounded time. Record that decision (a comment on the tracking issue is enough) so it isn't silently re-flagged forever.
5. **Never merge a PR to silence the CI gate** (e.g. lowering `--audit-level`, deleting the workflow step) without a maintainer sign-off — the gate existing is the point.

### Current known findings (informational, not a blocker for this doc)

As of this writing, `npm audit --audit-level=high` reports high-severity advisories inherited transitively through `next` (which in turn pulls in vulnerable `postcss`/`sharp`/`picomatch` versions). The available fix (`npm audit fix --force`) would bump `next` outside its currently declared range, which is a breaking change deserving its own reviewed PR rather than being bundled here — tracked as follow-up work.
