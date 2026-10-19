# NexaFx Web

NexaFx is a Web3-powered currency exchange platform for Naira-to-multi-currency and crypto conversions on the Stellar network.

This branch (`v2`) is a fresh rebuild on Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS 4. The previous v2 code is preserved on the `archive/v2-2026-10` branch for reference.

## Getting started

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command                  | What it does                                           |
| ------------------------ | ------------------------------------------------------ |
| `npm run dev`            | Start the development server                           |
| `npm run build`          | Production build (runs the production-env guard first) |
| `npm run start`          | Serve the production build                             |
| `npm run lint`           | ESLint                                                 |
| `npm run type-check`     | Generate route types and run `tsc --noEmit`            |
| `npm run format`         | Format all files with Prettier                         |
| `npm run format:check`   | Check that files are formatted, without writing        |
| `npm run test`           | Unit tests (Node test runner)                          |
| `npm run check:prod-env` | Run the production environment guard manually          |
| `npm run audit:prod`     | `npm audit` for production deps at high severity       |
| `npm run lighthouse`     | Run Lighthouse CI against a local production server    |
| `npm run verify`         | Lint, type-check and build, the same checks CI runs    |

## Deployment

Production builds refuse to ship development credentials or mocking flags.

`scripts/check-production-env.mjs` runs automatically as a `prebuild` step. When
`NODE_ENV=production` or `VERCEL_ENV=production` it exits non-zero if any of
these are set:

- `DEV_TOKEN`
- `TEST_ACCESS_TOKEN`
- `NEXT_PUBLIC_API_MOCKING`
- any `NEXT_PUBLIC_FLAG_*` key not on the allow-list in the script

It also requires `NEXT_PUBLIC_API_URL` to start with `https://`. Error messages
name the offending variable but never print its value.

Local `npm run dev` builds are unaffected. To simulate a failing production
build:

```sh
NODE_ENV=production DEV_TOKEN=x NEXT_PUBLIC_API_URL=https://example.com npm run build
```

## Lighthouse CI

Public pages (`/`, `/login`, `/signup`) are measured on pull requests by
`.github/workflows/lighthouse.yml`. Thresholds (see `lighthouserc.json`):

| Metric / category | Threshold | Notes |
| ----------------- | --------- | ----- |
| Performance       | ≥ 0.80    | Baseline from initial desktop run on the marketing shell |
| Accessibility     | ≥ 0.90    | Aligns with axe-core gate already in CI |
| Best practices    | ≥ 0.85    | |
| LCP               | ≤ 4000 ms | Soft warn budget |
| CLS               | ≤ 0.1     | Hard error |

The workflow is a **non-required** PR check at first so regressions are visible
without blocking merges; mark it required once the baseline is stable.

Locally:

```sh
npm run build && npm run start &
npx @lhci/cli autorun
```

Reports are written to `.lighthouseci/` and uploaded as CI artifacts.

## Dependency audit

`.github/workflows/audit.yml` runs `npm audit --omit=dev --audit-level=high` on
PRs, pushes to `main`/`v2`, and on a weekly schedule. Temporary acceptances live
in `audit-exceptions.md` and are enforced by
`scripts/check-audit-exceptions.mjs` (expired entries fail CI). See
[SECURITY.md](SECURITY.md).

## Rate alerts

Signed-in users can manage currency rate-threshold alerts at `/alerts`
(create, list, delete with confirmation). Client-side validation rejects
non-positive thresholds before any network request. The per-user limit is
enforced by the API and surfaced in the UI when reached.

Backend contract (implement behind a feature flag if not yet available):

- `GET /api/alerts` → `{ alerts, maxAlerts }`
- `POST /api/alerts` → alert
- `DELETE /api/alerts/:id`

## Contributing

See [Contribution.md](Contribution.md). Branch from `v2` and open pull requests into `v2`.
