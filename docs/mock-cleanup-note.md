# Historical Mock/Orphaned File Cleanup

## What Was Removed

The following mock/orphaned files were removed in a prior cleanup (tracked in separate issues):

| File | Purpose | Replacement |
|------|---------|-------------|
| `app/lib/api/transactions.ts` | Mock transaction API responses for development | Use `lib/api/transactions.ts` (real API client) + MSW handlers for tests |
| `lib/mock-notifications.ts` | Mock notification data for storybook/dev | Use `lib/__tests__/fixtures/notifications.ts` for test fixtures |
| `lib/mock-data.ts` | Generic mock data (currencies, rates, users) | Use `lib/__tests__/fixtures/` per-domain fixture files |
| `src/` dummy stubs | Auto-generated placeholder files from a prior contribution script | Genuine modules moved to appropriate `lib/`, `hooks/`, `components/` |

## Where to Add New Test Fixtures

**Do NOT** recreate mock files in `lib/mock-*.ts` or `app/lib/api/`.

Instead, add test fixtures under:

```
lib/__tests__/fixtures/
├── notifications.ts     # Notification fixtures
├── transactions.ts      # Transaction fixtures
├── users.ts             # User/profile fixtures
├── exchange-rates.ts    # Rate fixtures
└── currencies.ts        # Currency fixtures
```

**Convention:**
- One fixture file per domain/entity
- Export named `const` fixtures (e.g., `export const mockNotification = ...`)
- Use realistic but non-production data
- Keep fixtures minimal — only fields the test actually needs

## Why This Matters

Centralized fixtures under `lib/__tests__/fixtures/`:
- Are discoverable (`grep -r "__tests__/fixtures"`)
- Avoid duplication across test files
- Make it easy to update all tests when API shapes change
- Separate test concerns from implementation code

## Related Issues

- Mock file cleanup: (separate tracked issues)
- `src/` stub cleanup: #905
- Test coverage issues: #886–#894, #897–#903

---

**Last Updated**: 2026-09-24  
**Owner**: Frontend Team