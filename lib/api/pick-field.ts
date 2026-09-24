/**
 * DTO field-fallback helper (Issue #862).
 *
 * API responses are normalised defensively across the app because the
 * backend is not consistent about camelCase vs snake_case keys and sometimes
 * wraps results under `data`. `pickField` returns the first present
 * non-null/undefined value for any of the given keys in order, and supports
 * dotted paths for nested values (e.g. `"data.id"`). Callers that need a
 * default chain it on with `??`, exactly as they did with the hand-written
 * `a ?? b ?? c` fallbacks this helper replaces.
 */

export function pickField(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: Record<string, any> | undefined | null,
  ...keys: string[]
): unknown {
  if (!source) return undefined;
  for (const key of keys) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = source;
    let found = true;
    for (const segment of key.split(".")) {
      if (current === undefined || current === null) {
        found = false;
        break;
      }
      current = current[segment];
    }
    if (found && current !== undefined && current !== null) return current;
  }
  return undefined;
}
