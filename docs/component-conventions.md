# Component Conventions

This guide documents the component patterns the codebase already follows, so
new components stay consistent with the project instead of inventing their own
local conventions.

## Client vs server components ("use client")

Next.js defaults components to **server components** (RSC). Add `"use client"`
**only when the component actually needs browser/client behavior**. In this
codebase the observed pattern is:

**Mark a component as a client component (`"use client"` at the top of the file)
when it uses any of:**

- React hooks: `useState`, `useEffect`, `useRef`, `useRouter`, `useSearchParams`,
  `usePathname`, custom hooks like `useFocusTrap`, or Zustand stores
  (`useAuthStore`, `useSidebarStore`, `useNotificationsStore`, `useWithdrawalStore`).
- Event handlers (`onClick`, `onChange`, ...) or browser APIs (`window`,
  `localStorage`, `sessionStorage`, `document`).
- `createPortal` (e.g. `components/profile/verification-modal.tsx`).

**Otherwise keep it a server component.** Data that can be fetched/rendered
without interactivity stays server-side. Pages themselves can stay server by
default and only opt in where their content is interactive (every page that
handles a form or reads auth state is `"use client"` in this repo — that is the
norm here).

Use it at the **top of the file**, before imports, like the existing components.

## The `components/ui` primitive layer

`components/ui` holds the **shadcn-style primitive layer**:

- Configured via `components.json` with `"style": "new-york"` (the New York
  variant). Keep new primitives consistent with that style (baseColor
  "neutral", lucide icons, `cn()` from `@/lib/utils`).
- Components here are **generic, presentational building blocks** — e.g.
  `button`, `dialog`, `select`, `switch`, `tabs`, `checkbox`. They are styled
  primitives with no feature/business knowledge.

**When to add a primitive vs a feature component:**

- Add to `components/ui/` when the element is a **reusable control** with no
  app-specific meaning (a button, dialog, select, etc.) and you expect it to be
  reused or to match the shadcn catalog.
- Create a **feature component** under `components/<area>/` (e.g.
  `components/dashboard/`, `components/profile/`, `components/admin/`) when the
  component is specific to a feature — it composes primitives, fetches data, or
  implements feature logic (`deposit.tsx`, `market-overview.tsx`,
  `verification-modal.tsx`, `AdminGuard.tsx`).

A feature component should build on primitives rather than re-styling raw
elements; add a primitive when you find yourself repeating the same styling
across features.

## Prop & API conventions

Observed conventions to match:

- **camelCase prop names**, including event callbacks (`onClose`, `onToggle`,
  `handleSubmit`), booleans (`isOpen`, `isMobile`, `isLoading`), and everything
  else — no snake_case or PascalCase props.
- **Boolean state variables use `is` / `has` prefixes** (`isLoading`,
  `isQRModalOpen`, `showNotification`, `moonPayError`).
- Destructure props with **typed interfaces** declared next to the component
  (`interface DepositMethodTypes { toggleDeposit: () => void }`), and use
  `React.FC<Props>` or plain function components consistently — both appear in
  the codebase; match the file you're editing.
- **Default export** for page-level components in `app/`, **named exports**
  (`export function`) for reusable components in `components/`.
- Use `cn()` (`clsx` + `tailwind-merge`) for conditional/merged class names.
- Accessibility props where visible behavior needs them: `aria-label` on
  icon-only buttons, `role="dialog"` + `aria-modal` on modals (see `deposit.tsx`).