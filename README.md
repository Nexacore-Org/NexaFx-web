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

| Command                          | What it does                                                          |
| -------------------------------- | --------------------------------------------------------------------- |
| `npm run dev`                    | Start the development server                                          |
| `npm run build`                  | Production build (runs the production-env guard first via `prebuild`) |
| `npm run start`                  | Serve the production build                                            |
| `npm run lint`                   | ESLint                                                                |
| `npm run type-check`             | Generate route types and run `tsc --noEmit`                           |
| `npm run format`                 | Format all files with Prettier                                        |
| `npm run format:check`           | Check that files are formatted, without writing                       |
| `npm run test`                   | Unit tests (`vitest run`)                                             |
| `npm run smoke`                  | Trivial smoke check used as a CI sanity step                          |
| `npm run e2e`                    | Run Playwright end-to-end tests headlessly                            |
| `npm run e2e:ui`                 | Run Playwright end-to-end tests in UI mode                            |
| `npm run check:nav`              | Verify nav links point at real routes                                 |
| `npm run check:bundle`           | Check production bundle sizes against `bundle-budget.json`            |
| `npm run check:prod-env`         | Run the production environment guard manually                         |
| `npm run check:audit-exceptions` | Validate that `audit-exceptions.md` entries haven't expired           |
| `npm run audit:prod`             | `npm audit` for production deps at high severity                      |
| `npm run lighthouse`             | Run Lighthouse CI against a local production server                   |
| `npm run verify`                 | Lint, type-check, nav check, build and bundle check locally           |

`npm run verify` is a fast local pre-flight, not a 1:1 mirror of CI: CI
(`.github/workflows/ci.yml`) additionally runs `format:check` and the full
Playwright `e2e` suite.

## Testing

- **Unit tests** (`npm test`) run with [Vitest](https://vitest.dev) in a jsdom
  environment (see `vitest.config.mts`). Test files live next to the code
  they cover, named `*.test.ts`/`*.test.tsx`, plus a few script tests under
  `__tests__/` and `scripts/__tests__/`.
- **Node test runner** scripts (e.g. `scripts/__tests__/check-bundle-budget.test.mjs`)
  can be run directly with `node --test <file>` when you want to exercise a
  single script in isolation, outside of Vitest.
- **End-to-end tests** (`npm run e2e`) use [Playwright](https://playwright.dev)
  against a production build started with `E2E_MOCK=1` (see
  `playwright.config.ts`), which routes auth and convert API handlers to
  their mock implementations instead of a real backend. Before running them
  the first time, install browser binaries:

  ```sh
  npx playwright install --with-deps chromium
  ```

  Then run `npm run e2e` (or `npm run e2e:ui` for the interactive runner).

- **`E2E_MOCK=1`** also works with `npm run dev`/`npm run build` for manual
  testing of the auth and convert flows without a real backend. The
  production-env guard (`npm run check:prod-env`) forbids `E2E_MOCK` from
  being set in a production environment.
| Command                  | What it does                                           |
| ------------------------ | ------------------------------------------------------ |
| `npm run dev`            | Start the development server                           |
| `npm run build`          | Production build (runs the production-env guard first) |
| `npm run start`          | Serve the production build                             |
| `npm run lint`           | ESLint                                                 |
| `npm run type-check`     | Generate route types and run `tsc --noEmit`            |
| `npm run format`         | Format all files with Prettier                         |
| `npm run format:check`   | Check that files are formatted, without writing        |
| `npm run test`           | Unit tests (Vitest, then the Node test runner scripts) |
| `npm run check:prod-env` | Run the production environment guard manually          |
| `npm run audit:prod`     | `npm audit` for production deps at high severity       |
| `npm run lighthouse`     | Build, then run Lighthouse CI on a production server   |
| `npm run verify`         | Lint, type-check and build, the same checks CI runs    |

## Deployment

Production builds refuse to ship development credentials or mocking flags.

`scripts/check-production-env.mjs` runs automatically as a `prebuild` step. When
`NODE_ENV=production` or `VERCEL_ENV=production` it exits non-zero if any of
these are set:

- `DEV_TOKEN`
- `TEST_ACCESS_TOKEN`
- `NEXT_PUBLIC_API_MOCKING`
- `E2E_MOCK`
- any `NEXT_PUBLIC_FLAG_*` key not on the allow-list in the script

It also requires `NEXT_PUBLIC_API_URL` to start with `https://`, and requires
`AUTH_API_URL` to be set (without it, `/api/auth/login` has no real backend to
forward to and refuses every request with `503`). Error messages name the
offending variable but never print its value.

Local `npm run dev` builds are unaffected. To simulate a failing production
build:

```sh
NODE_ENV=production DEV_TOKEN=x NEXT_PUBLIC_API_URL=https://example.com npm run build
```

## Lighthouse CI

Public pages (`/`, `/login`, `/signup`) are measured on pull requests by
`.github/workflows/lighthouse.yml`. Thresholds (see `lighthouserc.json`):

| Metric / category | Threshold | Notes                                                    |
| ----------------- | --------- | -------------------------------------------------------- |
| Performance       | ≥ 0.80    | Baseline from initial desktop run on the marketing shell |
| Accessibility     | ≥ 0.90    | Aligns with axe-core gate already in CI                  |
| Best practices    | ≥ 0.85    |                                                          |
| Accessibility     | ≥ 0.90    | Hard error                                               |
| Best practices    | ≥ 0.85    | Hard error                                               |
| SEO               | ≥ 0.90    | Soft warn budget                                         |
| LCP               | ≤ 4000 ms | Soft warn budget                                         |
| CLS               | ≤ 0.1     | Hard error                                               |

The workflow is a **non-required** PR check at first so regressions are visible
without blocking merges; mark it required once the baseline is stable.

Locally, run the same command CI runs:

```sh
npm run lighthouse
```

It builds the app, then `lhci autorun` starts `npm run start` itself
(`startServerCommand` in `lighthouserc.json`), so do not start a server on
port 3000 first. Reports are written to `.lighthouseci/` and uploaded as CI
artifacts.

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
