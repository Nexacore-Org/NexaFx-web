# Currency List & Currency Icon Conventions

This note documents how supported currencies and their icons are registered
today, and gives a checklist for adding a new supported currency.

> **Status:** a consolidation refactor (a shared currency list plus a shared
> currency-icon utility) is planned for `lib/` and the dashboard components.
> Until that lands, follow the checklist below — every bullet is a place a new
> currency must be touched today.

## Where currency data currently lives

Today the supported-currency knowledge is spread across several files. Each
place must stay in sync when a currency is added/changed:

| Area | File(s) | Contents |
| --- | --- | --- |
| Convert form | `components/dashboard/convert/convert-form.tsx` | `CURRENCIES` array (`id`, `name`, `symbol`) used by the from/to dropdowns |
| Withdrawal review | `components/dashboard/withdrawal/WithdrawalReview.tsx` | Local `currencies` array mapping `id` → name + lucide icon component |
| Withdrawal success | `components/dashboard/withdrawal/WithdrawalSuccess.tsx` | Same local `currencies` array (icon + name for the success screen) |
| Exchange-rate cards | `components/dashboard/market-overview.tsx` | `defaultPairs` list with a lucide icon per pair (`NGN/USD`, `NGN/GBP`, `NGN/EUR`) |
| Backend-driven list | `lib/api/currencies.ts` → `getCurrencies()` | The authoritative list served by the backend for the withdrawal form |
| Mock backend | `mock-backend/server.mjs` | Deterministic `base` rates map used for local development |

Icons for the withdrawal/convert/overview components are **lucide-react**
components (`CircleDollarSign`, `BadgeDollarSign`, `DollarSign`, etc.) — a new
currency needs an icon asset chosen from `lucide-react` and wired into each
array that renders it.

## Checklist: add a new supported currency

1. **Backend list** — ensure the backend's list (`getCurrencies()`) returns the
   new currency (this is the source for the withdrawal form).
2. **Convert form** — add an entry to `CURRENCIES` in
   `components/dashboard/convert/convert-form.tsx` (`id`, `name`, `symbol`).
3. **Withdrawal review/success** — add an entry to the `currencies` array in
   both `WithdrawalReview.tsx` and `WithdrawalSuccess.tsx`, including a `lucide-react`
   icon.
4. **Exchange-rate cards** — if the currency appears on the dashboard overview,
   add/adjust a pair in `defaultPairs` in `components/dashboard/market-overview.tsx`.
5. **Mock backend (dev only)** — add a base rate for the currency in
   `mock-backend/server.mjs` if you want local dev to show plausible rates.
6. **Tests** — cover the new currency in the convert/withdrawal component tests
   and fixtures.

## Future state (after consolidation)

Once the consolidation refactor lands, the single correct place to add a
currency will be the **shared currency list** (with the shared icon utility
resolving its icon). The checklist above will then collapse to a one-file
change plus any new icon asset — update this document when that happens.