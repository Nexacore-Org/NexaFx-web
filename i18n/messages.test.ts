// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MESSAGES_DIR = path.join(process.cwd(), "messages");
const REFERENCE_LOCALE = "en";

/**
 * Flattens a catalogue into dot-separated leaf paths.
 *
 * Arrays are flattened by index so a missing array entry is reported as a
 * missing key instead of being hidden by a shallow comparison.
 */
function flattenKeys(value: unknown, prefix = ""): Map<string, unknown> {
  const leaves = new Map<string, unknown>();

  if (value !== null && typeof value === "object") {
    const entries: [string, unknown][] = Array.isArray(value)
      ? value.map((child, index) => [String(index), child])
      : Object.entries(value as Record<string, unknown>);

    if (entries.length === 0 && prefix) {
      leaves.set(prefix, value);
      return leaves;
    }

    for (const [key, child] of entries) {
      const keyPath = prefix ? `${prefix}.${key}` : key;
      for (const [leafPath, leaf] of flattenKeys(child, keyPath)) {
        leaves.set(leafPath, leaf);
      }
    }

    return leaves;
  }

  leaves.set(prefix, value);
  return leaves;
}

function loadCatalogue(fileName: string): Map<string, unknown> {
  const raw = readFileSync(path.join(MESSAGES_DIR, fileName), "utf8");
  return flattenKeys(JSON.parse(raw) as unknown);
}

const catalogueFiles = readdirSync(MESSAGES_DIR)
  .filter((fileName) => fileName.endsWith(".json"))
  .sort();

const locales = catalogueFiles.map((fileName) =>
  fileName.replace(/\.json$/, ""),
);
const catalogues = new Map(
  locales.map((locale) => [locale, loadCatalogue(`${locale}.json`)]),
);

describe("i18n message catalogues", () => {
  it("includes the English reference catalogue", () => {
    expect(locales).toContain(REFERENCE_LOCALE);
  });

  const reference = catalogues.get(REFERENCE_LOCALE)!;
  const translatedLocales = locales.filter(
    (locale) => locale !== REFERENCE_LOCALE,
  );

  it("has at least one translated catalogue to compare", () => {
    expect(translatedLocales.length).toBeGreaterThan(0);
  });

  for (const locale of translatedLocales) {
    const catalogue = catalogues.get(locale)!;

    it(`${locale}.json has every key in ${REFERENCE_LOCALE}.json`, () => {
      const missing = [...reference.keys()]
        .filter((key) => !catalogue.has(key))
        .sort();

      expect(
        missing,
        `Add the missing keys to messages/${locale}.json or remove them from messages/${REFERENCE_LOCALE}.json`,
      ).toEqual([]);
    });

    it(`${locale}.json has no keys absent from ${REFERENCE_LOCALE}.json`, () => {
      const extra = [...catalogue.keys()]
        .filter((key) => !reference.has(key))
        .sort();

      expect(
        extra,
        `Remove the extra keys from messages/${locale}.json or add them to messages/${REFERENCE_LOCALE}.json`,
      ).toEqual([]);
    });
  }

  it("has no empty strings in any catalogue", () => {
    const empty: string[] = [];

    for (const [locale, catalogue] of catalogues) {
      for (const [key, value] of catalogue) {
        if (typeof value === "string" && value.trim() === "") {
          empty.push(`${locale}.json:${key}`);
        }
      }
    }

    expect(empty.sort(), "Fill in or remove these empty strings").toEqual([]);
  });
});
