# NexaFx `src/` Directory Status

This document explains the current state of the `src/` directory, which contains a mix of genuine modules and auto-generated dummy stubs.

## Current Status (as of 2026-09-23)

### ✅ Genuine Modules (Production Code)

| File | Purpose |
|------|---------|
| `src/utils/logger.ts` | Structured logging utility with log levels (info, warn, error, debug) |
| `src/utils/fonts.ts` | Next.js font optimization (Inter, Roboto, Montserrat) |
| `src/store/hydration.ts` | Zustand store hydration helpers (if implemented) |
| `src/components/layout/Meta.tsx` | SEO/meta tag components |
| `src/components/admin/UserDisplay.tsx` | Admin user display component |
| `src/components/admin/RevenueChart.tsx` | Admin revenue chart component |
| `src/components/common/ImageOpt.tsx` | Optimized image component |
| `src/components/common/ClientOnly.tsx` | Client-only rendering wrapper |
| `src/components/common/AvatarInitials.tsx` | Avatar initials generator |
| `src/middleware/csp.ts` | Content Security Policy middleware |
| `src/types/api.ts` | API type definitions (if implemented) |

### ⚠️ Dummy Stubs (To Be Removed)

| File | Reason |
|------|--------|
| `src/utils/form.ts` | Contains only `export const dummy_1 = 'nottherealalanturing';` |
| `src/types/api.ts` | Contains only `export const dummy_0 = 'nottherealalanturing';` |
| `src/store/hydration.ts` | Contains only `export const dummy_3 = 'nurudeenmuzainat';` |
| `src/components/layout/Meta.tsx` | Contains only `export const dummy_3 = 'nottherealalanturing';` |
| `src/components/admin/UserDisplay.tsx` | Contains only `export const dummy_1 = 'aaseenib';` |
| `src/components/admin/RevenueChart.tsx` | Contains only `export const dummy_3 = 'S-Mubarak';` |
| `src/components/common/ImageOpt.tsx` | Contains only `export const dummy_3 = 'aaseenib';` |
| `src/components/common/ClientOnly.tsx` | Contains only `export const dummy_2 = 'S-Mubarak';` |
| `src/components/common/AvatarInitials.tsx` | Contains only `export const dummy_2 = 'aaseenib';` |

## Why This Mix Exists

The `src/` directory was partially populated by an automated contribution-wave script that generated placeholder files. Some files were later replaced with genuine implementations, while others remain as stubs.

## Resolution Path

The separately-tracked cleanup issue **#895** will:
1. Remove all dummy stub files listed above
2. Move any genuine modules to their canonical locations (`lib/`, `hooks/`, `components/`)
3. Remove the `src/` directory entirely if empty

## For Contributors

**Do not** add new code to `src/` — it is being phased out. Instead:

- **Utilities** → `lib/utils/` or `lib/`
- **Hooks** → `hooks/`
- **Components** → `components/` (or `components/ui/`, `components/admin/`, etc.)
- **Types** → `types/` or co-located with implementation
- **Middleware** → `middleware/` (or `lib/middleware/`)

## Timeline

- **2026-09-23**: This documentation added
- **Pending**: Cleanup issue #895 implementation
- **Target**: `src/` directory removed after cleanup

---

**Last Updated**: 2026-09-23  
**Related Issues**: #895 (cleanup), #894 (test coverage), #903 (store conventions)