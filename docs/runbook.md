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
