# NexaFx Zustand Store Conventions

This document describes the conventions for Zustand stores in the NexaFx codebase.

## Store Inventory

| Store File | Purpose | Persisted? | Notes |
|------------|---------|------------|-------|
| `hooks/use-auth-store.ts` | User authentication, tokens, profile, role | **Yes** (`persist` middleware, key: `auth-storage`) | Stores access/refresh tokens in localStorage; `setAuth` syncs tokens to localStorage |
| `hooks/use-notifications-store.ts` | Notification panel, unread count, optimistic updates | **No** | Uses optimistic-update-with-rollback pattern for `markAsRead`, `markAllAsRead`, `removeNotification` |
| `hooks/use-sidebar-store.ts` | Mobile sidebar open/close state | **No** | Simple boolean toggle, no persistence needed |
| `hooks/useWithdrawalStore.ts` | Withdrawal modal step machine + form data | **No** | Step machine: `select` → `form` → `review` → `processing` → `success`/`error` |

## Persistence Convention

**Use `persist` middleware when:**
- State must survive page refresh / browser close (auth tokens, user preferences)
- State is user-specific and not derivable from server on next load
- The storage key is namespaced (e.g., `auth-storage`, not generic)

**Do NOT persist when:**
- State is purely UI/ephemeral (modals, sidebar, form drafts)
- State can be re-fetched from server on load (notifications list)
- State represents in-flight mutations (withdrawal form data)

## Optimistic-Update-with-Rollback Pattern

**Reference Implementation**: `hooks/use-notifications-store.ts` — `markAsRead`, `markAllAsRead`, `removeNotification`

**Pattern:**
```typescript
// 1. Capture pre-mutation state for potential rollback
const prevState = useStore.getState().relevantField;
const prevDerived = useStore.getState().derivedField;

// 2. Apply optimistic update immediately
set((state) => ({
  // ...updated state
  derivedField: recomputeDerived(updatedState),
}));

// 3. Fire-and-forget API call with rollback on failure
api.mutate(...).catch(() => {
  set({ relevantField: prevState, derivedField: prevDerived });
});
```

**When to apply:**
- User-visible mutations where latency matters (mark read, delete, toggle)
- Backend eventually consistent or fast enough that rollback is rare
- Derived state (like `unreadCount`) must stay in sync with source array

**Do NOT use for:**
- Critical financial transactions (withdrawals, deposits) — these use explicit `processing` → `success`/`error` steps
- Mutations where server response changes the result (use `await` + set from response instead)

## Store Structure Convention

1. **State shape first** — all fields at top level, no nested objects unless semantically grouped
2. **Actions grouped by concern** — panel actions, data actions, mutation actions
3. **Derived state computed in setters** — `unreadCount` recomputed inline in `setNotifications`/`addNotification`/`markAsRead`
4. **Type exports** — export `WithdrawalStep`, `TransactionStatus`, etc. for consumers
5. **Initial state constant** — `const initialState = { ... }` for easy reset

## Adding a New Store

1. Check if state truly needs global access (consider React context or props first)
2. Follow the structure above: state → actions → (optional) persist middleware
3. Document persistence choice in this file
4. If using optimistic updates, follow the reference pattern from `use-notifications-store.ts`
5. Add a test file under `__tests__/` covering actions and derived state

---

**Last Updated**: 2026-09-24  
**Owner**: Frontend Team