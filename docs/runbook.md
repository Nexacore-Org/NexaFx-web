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