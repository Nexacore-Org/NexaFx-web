# Runtime Security Runbook

## DEV_TOKEN / TEST_ACCESS_TOKEN alert

The API proxy must never accept the local fallback token in a deployed environment. The proxy now emits a warning when `TEST_ACCESS_TOKEN` is present in a non-development environment so the team can detect a misconfiguration before it can be abused.

### Where the alert appears

The warning is emitted from the server-side proxy route in `app/api/proxy/[...path]/route.ts` and is written to the deployed app's standard server logs:

- Vercel/Next.js server logs
- Render container stdout/stderr
- any centralized log collector that ingests the application output

The log message is:

`[NexaFx] TEST_ACCESS_TOKEN was configured outside local development. This is a security risk and should be removed immediately.`

### What to do if the alert appears

1. Treat it as a production security incident.
2. Remove `TEST_ACCESS_TOKEN` from the deployment environment immediately.
3. Verify the deployment is not running in a local-dev or staging-only configuration by mistake.
4. Review recent proxy requests for evidence of unauthenticated access or leaked protected data.
5. Check whether the environment is using a fallback token accidentally instead of the real client token flow.
6. If the deployment has already served requests under this misconfiguration, rotate any exposed credentials and notify the on-call owner.
7. Reopen the deployment config and confirm the proxy no longer accepts the dev fallback outside `NODE_ENV === "development"`.

### Prevention

- Keep `TEST_ACCESS_TOKEN` unset in all staging and production environments.
- Keep the value in `.env.local` only for local debugging.
- Prefer the request-scoped `x-client-token` or `access_token` flow over any fallback credential.
- Add alerts in the deployment provider so the warning is routed to Slack, PagerDuty, or another on-call channel when it appears.
# NexaFx Operational Runbook

This runbook describes how to respond to a bad deploy, roll back to a known-good version, and where to check runtime logs.

## 1. Identify a Bad Deploy

**Symptoms to watch for:**
- CI/CD pipeline shows a successful deploy but the live site has errors
- Users report broken functionality (transactions failing, pages not loading, auth issues)
- Monitoring alerts for increased error rates or latency
- Health check endpoint (`/api/health` or similar) returns non-200 status

**Quick verification steps:**
1. Visit the production URL and check for console errors
2. Check the deployment timestamp in Vercel/GitHub Actions
3. Compare with the last known-good commit SHA

## 2. Rollback Procedure

### Option A: Vercel Instant Rollback (Recommended)
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) for the `NexaFx-web` project
2. Navigate to **Deployments** tab
3. Find the last known-good deployment (green checkmark)
4. Click the **...** menu → **Promote to Production**
5. Confirm promotion — traffic switches within seconds

### Option B: Git Revert + Redeploy
If Vercel rollback is unavailable:
```bash
# 1. Find the last good commit
git log --oneline -20

# 2. Revert the bad commit(s)
git revert <bad-commit-sha>

# 3. Push to main — triggers CI/CD
git push origin main
```

### Option C: Vercel CLI Rollback
```bash
# Install Vercel CLI if needed
npm i -g vercel@latest

# List recent deployments
vercel list nexafx-web

# Rollback to a specific deployment URL
vercel promote <deployment-url> --scope=Nexacore-Org
```

## 3. Log Checking

### Application Logs
- **Vercel Functions Logs**: Vercel Dashboard → Project → Functions → View Logs
- **Runtime Logs**: Filter by time range around the incident
- **Search for**: `ERROR`, `exception`, `failed`, timeout traces

### Build/Deploy Logs
- **GitHub Actions**: Actions tab → latest workflow run → `build` / `deploy` jobs
- **Vercel Build Logs**: Vercel Dashboard → Deployments → click deployment → Build Logs

### Access Logs (if configured)
- Vercel Analytics / Logs integration
- Any external logging service (Datadog, Logtail, etc.)

## 4. Post-Rollback Verification

1. Wait 2-3 minutes for rollback to propagate globally
2. Run smoke tests against production:
   ```bash
   # If a smoke test script exists
   npm run smoke:prod
   # Or manually check critical paths:
   # - Homepage loads
   # - Sign-in / Sign-up flow
   # - Dashboard loads for authenticated user
   # - Transaction flow (deposit/withdrawal)
   ```
3. Monitor error rates for 10-15 minutes
4. If stable, communicate rollback to team; if not, escalate

## 5. Escalation Contacts

- **Primary On-Call**: Check GitHub repo `CODEOWNERS` or team rotation
- **Platform/Infra**: Vercel support (if platform issue)
- **Security**: If breach suspected, follow security incident procedure

## 6. Incident Documentation

After resolution:
1. Create a GitHub Issue titled `INCIDENT: <date> - <brief description>`
2. Document: timeline, root cause, rollback method used, duration
3. Link to relevant PR/commit that introduced the regression
5. Add action items to prevent recurrence

---

**Last Updated**: 2026-09-24  
**Maintainer**: Engineering Team  
**Review Cadence**: Quarterly or after any major incident

