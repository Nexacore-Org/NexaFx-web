/**
 * Shared utility helpers.
 */

type ClassValue = string | number | null | undefined | false | ClassValue[] | Record<string, boolean | null | undefined>;

function collectClasses(value: ClassValue, out: string[]): void {
  if (!value) return;
  if (typeof value === "string" || typeof value === "number") {
    out.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectClasses(item, out);
    return;
  }
  if (typeof value === "object") {
    for (const [key, enabled] of Object.entries(value)) {
      if (enabled) out.push(key);
    }
  }
}

/**
 * Merge conditional class names into a single string.
 *
 * Accepts strings, arrays, and objects whose truthy keys are included.
 * Falsy values are ignored.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const input of inputs) collectClasses(input, out);
  return out.join(" ");
}
