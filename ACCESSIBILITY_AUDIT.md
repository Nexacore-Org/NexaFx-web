# Accessibility Audit — v2 Pages

Audit scope: dashboard, transactions, settings, auth (sign-in, verify-otp, forgot-password, reset-password), and shared UI components.

## Violations Found & Fixes Applied

### Keyboard navigation
| Issue | Location | Fix |
|-------|----------|-----|
| Mobile transaction rows used non-focusable `<div>` click handlers | `transaction-list.tsx` | Replaced with `<button type="button">` for keyboard access |
| Delete account modal lacked focus trap | `danger-zone.tsx` | Added `useFocusTrap`, `role="dialog"`, `aria-modal="true"` |
| OTP inputs not fully labeled for screen readers | `verify-otp`, `reset-password` | Added `aria-label` per digit and `role="group"` with visible/sr-only labels |

### ARIA labels
| Issue | Location | Fix |
|-------|----------|-----|
| Icon-only copy button missing label | `WithdrawalSuccess.tsx` | Added `aria-label` for copy action |
| Password visibility toggles unlabeled | `sign-in`, `reset-password` | Added `aria-label` (Show/Hide password) |
| Status badges not announced | `transaction-table.tsx`, `transaction-list.tsx` | Added `aria-label="Transaction status: …"` |
| Back button unlabeled (mobile OTP) | `verify-otp/page.tsx` | Added `aria-label="Go back"` |
| Withdrawal modal `aria-labelledby` pointed to missing id | `WithdrawalForm`, `WithdrawalReview` | Added `id="withdrawal-modal-title"` to step headings |

### Color contrast (WCAG AA)
| Issue | Location | Fix |
|-------|----------|-----|
| Muted text `#666666` borderline on light backgrounds | `globals.css` | Updated `--muted-foreground` to `#525252` (≥7:1 on white) |
| Yellow/red status text on tinted badges below 4.5:1 | `transaction-table.tsx`, `transaction-list.tsx` | Switched to `text-green-700`, `text-yellow-700`, `text-red-700` |

### Semantic HTML
| Issue | Location | Fix |
|-------|----------|-----|
| Table headers missing `scope` | `transaction-table.tsx` | Added `scope="col"` to all `<th>` elements |
| Settings page lacked structured heading | `settings/page.tsx` | Added `<header>` with page title and description |
| Navigation already semantic | `sidebar.tsx`, `dashboard/layout.tsx` | Verified `<nav>` and `<main>` in place |

### Forms
| Issue | Location | Fix |
|-------|----------|-----|
| Withdrawal address field label didn't match API DTO | `WithdrawalForm.tsx` | Renamed label to **Destination Address** with `htmlFor` |
| Settings profile inputs missing explicit label association | `profile-tab.tsx` | All inputs use `<label htmlFor="…">` |

## Tooling

Run locally (with dev server on port 3000):

```bash
npx @axe-core/cli http://localhost:3000/dashboard --exit
npx @axe-core/cli http://localhost:3000/settings --exit
npx @axe-core/cli http://localhost:3000/transactions --exit
npx @axe-core/cli http://localhost:3000/login --exit
```

Also verify with axe DevTools browser extension on each page after login for authenticated routes.
