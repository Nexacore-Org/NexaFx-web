# NexaFx v2

NexaFx is a web app for currency exchange, crypto payments, wallet operations, invoices, KYC, and admin operations. The v2 branch is the active rebuild of the product frontend.

## Tech Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS
- Zustand for client state
- Stellar blockchain integrations
- Vitest, Testing Library, Playwright, and Storybook

## Live App

The production URL is managed by the NexaCore team. Ask a maintainer for the current deployed v2 URL before testing production-only flows.

## Branch Strategy

- `main`: production branch
- `v1`: final touches on the original codebase
- `v2`: full rebuild and active frontend development

Always target pull requests to `v2` unless a maintainer explicitly says otherwise.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- GitHub CLI (`gh`) for issue and PR workflows
- A NexaFx test account. Use the configured backend in `NEXT_PUBLIC_API_URL` to register one for local testing.

## Environment Setup

```bash
git clone https://github.com/Nexacore-Org/NexaFx-web
cd NexaFx-web
git checkout v2
npm install
cp .env.example .env.local
npm run dev
```

Fill in required values in `.env.local` before testing authenticated, payment, notification, or e2e flows.

## Environment Variables

| Variable                         | Required             | Description                                                                                      |
| -------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_API_URL`            | Yes                  | Backend API origin used by direct API calls and the local proxy.                                 |
| `NEXT_PUBLIC_MOONPAY_API_KEY`    | For MoonPay deposits | MoonPay publishable key from the MoonPay dashboard.                                              |
| `TEST_ACCESS_TOKEN`              | Development only     | Optional local development fallback token for the API proxy. Never set in staging or production. |
| `NEXT_PUBLIC_SESSION_TIMEOUT_MS` | Optional             | Session timeout in milliseconds. Defaults should match product requirements.                     |
| `NEXT_PUBLIC_CRISP_WEBSITE_ID`   | For support chat     | Crisp website ID from the Crisp dashboard.                                                       |
| `E2E_TEST_EMAIL`                 | For e2e tests        | Test user email used by Playwright flows.                                                        |
| `E2E_TEST_PASSWORD`              | For e2e tests        | Test user password used by Playwright flows.                                                     |
| `E2E_TEST_OTP`                   | For e2e tests        | OTP value for test login flows.                                                                  |
| `E2E_BASE_URL`                   | For e2e tests        | App URL used by Playwright, usually `http://localhost:3000`.                                     |

## Available Scripts

| Command                   | Description                                 |
| ------------------------- | ------------------------------------------- |
| `npm run dev`             | Start the local Next.js development server. |
| `npm run build`           | Create a production build.                  |
| `npm run start`           | Start the production server after a build.  |
| `npm run lint`            | Run ESLint.                                 |
| `npm run test`            | Run unit tests with Vitest.                 |
| `npm run test:ui`         | Launch the Vitest UI.                       |
| `npm run test:watch`      | Run Vitest in watch mode.                   |
| `npm run test:coverage`   | Run unit tests with coverage.               |
| `npm run e2e`             | Run Playwright end-to-end tests.            |
| `npm run storybook`       | Launch Storybook on port 6006.              |
| `npm run build-storybook` | Build Storybook.                            |

## How To Pick Up An Issue

1. Browse open GitHub issues and filter by the `frontend` label.
2. Comment `I'll take this` on the issue before starting work.
3. Create a branch from `v2`:

```bash
git checkout v2
git pull origin v2
git checkout -b feat/issue-123-your-description
```

4. Make the smallest complete change that satisfies the issue.
5. Run the required checks:

```bash
npm run build
npm run lint
npm run test
```

6. Open a PR targeting `v2`.
7. Add `Closes #123` to the PR description.

## PR Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes when code is changed
- [ ] No hardcoded balances, users, wallet addresses, or mock-only data in production paths
- [ ] No imports from `lib/admin-mock-data.ts`
- [ ] PR targets the `v2` branch
- [ ] PR description references the issue with `Closes #<issue-number>`

## Notes For Contributors

This project uses Next.js 16. Read the relevant local guide in `node_modules/next/dist/docs/` before changing Next-specific APIs, routing conventions, or configuration.

For product and exchange terminology, see the [contributor glossary](docs/glossary.md).

Commits run ESLint and Prettier on staged files through Husky. Bypass the hook with `git commit --no-verify` only when a genuine exception is necessary; the normal expectation is to fix the reported issues before committing.
