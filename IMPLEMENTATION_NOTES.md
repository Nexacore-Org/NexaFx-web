# Implementation: Issues #809, #812, #815, #817

## #809 – Signup "Log in" → `/sign-in`
- `app/signup/layout.tsx`
- `app/(auth)/signup/layout.tsx`
- `app/(auth)/signup/verify/page.tsx` (`router.replace`)

## #812 – Multi-comma balance parsing
- Shared `lib/utils/balance.ts` → `parseBalanceAmount` uses `replace(/,/g, "")`
- `WithdrawalForm` uses it for max-balance validation and Max button
- Regression tests in `balance.test.ts` and `WithdrawalForm.balance.test.ts`

## #817 – Currency code case normalization
- Balance map keys stored with `.toUpperCase()`
- `toCurrencyOption` looks up `code.toUpperCase()`
- Tests cover lower/upper mismatch between endpoints

## #815 – Single viewport-gated focus trap
- `WithdrawalModal` uses only `useResponsiveFocusTrap` with `desktopModalRef` + `mobileModalRef`
- Removed competing dual `useFocusTrap` call
- Tests assert exactly one document `keydown` listener

## Verify
```bash
npm test -- --testPathPattern="balance|WithdrawalForm.balance|WithdrawalModal"
```
