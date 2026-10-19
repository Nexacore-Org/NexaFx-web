/**
 * Validates audit-exceptions.md entries (#1075).
 *
 * Each exception must include: package, advisory id, reason, expiry (ISO date).
 * The script exits non-zero when any expiry date is in the past.
 *
 * Expected format (one exception per block):
 *
 * ## <package> — <advisory-id>
 * - reason: <text>
 * - expires: YYYY-MM-DD
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXCEPTIONS_PATH = join(root, "audit-exceptions.md");

/**
 * @param {string} markdown
 * @param {Date} [now]
 * @returns {{ ok: boolean, expired: Array<{ package: string, advisory: string, expires: string }>, parseErrors: string[] }}
 */
export function evaluateAuditExceptions(markdown, now = new Date()) {
  const expired = [];
  const parseErrors = [];

  // Split on ## headings
  const blocks = markdown.split(/^##\s+/m).slice(1);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    const heading = lines[0]?.trim() ?? "";
    const body = lines.slice(1).join("\n");

    // Split on em/en dash first; fall back to " - " (spaced hyphen) so package
    // names like left-pad keep their hyphens.
    const titleMatch =
      heading.match(/^(.+?)\s+[—–]\s+(\S+)/) ||
      heading.match(/^(.+?)\s+-\s+(\S+)/);
    if (!titleMatch) {
      parseErrors.push(`Could not parse exception heading: "${heading}"`);
      continue;
    }
    const pkg = titleMatch[1].trim();
    const advisory = titleMatch[2].trim();

    const expiresMatch = body.match(/expires:\s*(\d{4}-\d{2}-\d{2})/i);
    if (!expiresMatch) {
      parseErrors.push(
        `Missing or invalid expires date for ${pkg} (${advisory})`,
      );
      continue;
    }
    const expires = expiresMatch[1];
    const expiryDate = new Date(`${expires}T23:59:59.999Z`);
    if (Number.isNaN(expiryDate.getTime())) {
      parseErrors.push(`Invalid expires date for ${pkg}: ${expires}`);
      continue;
    }
    if (expiryDate.getTime() < now.getTime()) {
      expired.push({ package: pkg, advisory, expires });
    }
  }

  return {
    ok: expired.length === 0 && parseErrors.length === 0,
    expired,
    parseErrors,
  };
}

function main() {
  if (!existsSync(EXCEPTIONS_PATH)) {
    console.log("No audit-exceptions.md found — nothing to check.");
    process.exit(0);
  }

  const markdown = readFileSync(EXCEPTIONS_PATH, "utf8");
  // Empty / header-only file is fine
  if (!/^##\s+/m.test(markdown)) {
    console.log("audit-exceptions.md has no exception entries.");
    process.exit(0);
  }

  const result = evaluateAuditExceptions(markdown);
  if (!result.ok) {
    if (result.parseErrors.length > 0) {
      console.error("audit-exceptions.md parse errors:\n");
      for (const err of result.parseErrors) console.error(`  • ${err}`);
    }
    if (result.expired.length > 0) {
      console.error("\nExpired audit exceptions (remove or renew):\n");
      for (const e of result.expired) {
        console.error(
          `  • ${e.package} (${e.advisory}) expired on ${e.expires}`,
        );
      }
    }
    process.exit(1);
  }

  console.log("All audit exceptions are still valid.");
}

// Only run the CLI when this file is the entrypoint, not when imported by tests.
const entry = process.argv[1] ? resolve(process.argv[1]) : "";
if (entry === fileURLToPath(import.meta.url)) {
  main();
}
