# Security

## Reporting a vulnerability

Please do not open a public issue for a security problem. Contact the maintainers privately through GitHub's "Report a vulnerability" option on this repository.

## Secrets

Never commit credentials. Configuration is read from environment variables; see `.env.example`. Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser, so never put a secret in one.

## Secret-scanning triage

The `Secret Scan` workflow runs Gitleaks on pushes and pull requests targeting `main` or `v2`.

When a finding is reported:

1. Stop merging the affected change and treat the value as compromised. Do not paste the secret into an issue, pull request, chat message, or log.
2. Revoke or rotate the credential through its provider and check recent activity for unauthorized use.
3. Remove the secret from the working tree and read it from the environment instead. Removing it from the latest commit does not remove it from Git history; coordinate a history rewrite when required.
4. Rerun the workflow and confirm the replacement credential works.
5. For a confirmed false positive, add the narrowest possible Gitleaks allowlist entry with a reason in the same change. Never allowlist a live credential to make CI pass.

## Production dependency audit

The `Dependency Audit` workflow (`.github/workflows/audit.yml`) runs:

```sh
npm audit --omit=dev --audit-level=high
```

on every pull request, on pushes to `main`/`v2`, and on a weekly schedule. It is
intentionally separate from the secret-scan workflow.

### Temporarily accepting an advisory

1. Confirm there is no safe upgrade path yet.
2. Add an entry to `audit-exceptions.md`:

   ```markdown
   ## <package-name> — <advisory-id>
   - reason: Why this is accepted and the mitigation in place
   - expires: YYYY-MM-DD
   ```

3. `scripts/check-audit-exceptions.mjs` fails CI when any `expires` date is in
   the past — renew or remove the entry before that day.
4. Prefer upgrading the package over extending an exception.

## Production environment guard

`scripts/check-production-env.mjs` (wired as `prebuild`) fails production builds
when development tokens or mocking flags are present. See README → Deployment.
