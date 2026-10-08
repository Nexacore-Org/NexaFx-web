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

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run type-check` | Generate route types and run `tsc --noEmit` |
| `npm run verify` | Lint, type-check and build, the same checks CI runs |

## Contributing

See [Contribution.md](Contribution.md). Branch from `v2` and open pull requests into `v2`.
