# Bundle size budgets (#1076)

`bundle-budget.json` defines a default First Load JS budget (KB) and optional per-route overrides.

```bash
npm run build
npm run check:bundle
```

## Updating a budget

1. Confirm the increase is intentional.
2. Edit `bundle-budget.json` for the affected route or `defaultFirstLoadJsKb`.
3. In the PR description, state previous size, new size, and justification.

Exceeding a budget fails CI and prints a table of route / size / budget / delta.
