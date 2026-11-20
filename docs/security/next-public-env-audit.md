# `NEXT_PUBLIC_*` Environment Variable Audit (#758)

- **Date:** YYYY-MM-DD
- **Scope:** Full repository (`src/`, `next.config.ts`, `.env.example`, configs)
- **Rule:** Any `NEXT_PUBLIC_*` variable is bundled into client JS and treated as public.

## Audit Matrix

| Variable | Found In | Intended Purpose | Safe for Client? | Follow-Up Issue |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_EXAMPLE_URL` | `.env.example`, `next.config.ts` | Public base URL | Yes | None |
| `NEXT_PUBLIC_EXAMPLE_KEY` | `src/...` | Client widget / SDK key | Verify publishable-only | `#<issue>` (if secret) |

## Discovered Issues
- List follow-up issues filed for any non-public or ambiguous variables, including rotation/server-migration notes.