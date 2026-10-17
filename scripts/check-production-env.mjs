/**
 * Production environment guard (#1078).
 *
 * Fails the process when NODE_ENV=production or VERCEL_ENV=production and any
 * development-only credential or mocking flag is present. Also requires
 * NEXT_PUBLIC_API_URL to be https:// in production.
 *
 * The pure `evaluateProductionEnv` export is unit-tested; this file is also
 * the CLI entry used by `prebuild`.
 */

import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

/** @typedef {{ ok: boolean, errors: string[] }} EvalResult */

/** Flag names that are always forbidden in production. */
export const FORBIDDEN_ENV_KEYS = [
  "DEV_TOKEN",
  "TEST_ACCESS_TOKEN",
  "NEXT_PUBLIC_API_MOCKING",
];

/**
 * NEXT_PUBLIC_FLAG_* keys that are allowed in production.
 * Anything else matching NEXT_PUBLIC_FLAG_* is rejected.
 */
export const ALLOWED_PUBLIC_FLAGS = new Set([
  // Intentionally empty — add explicit allow-list entries here when needed.
]);

/**
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env
 * @returns {EvalResult}
 */
export function evaluateProductionEnv(env) {
  const errors = [];
  const nodeEnv = env.NODE_ENV;
  const vercelEnv = env.VERCEL_ENV;
  const isProduction = nodeEnv === "production" || vercelEnv === "production";

  if (!isProduction) {
    return { ok: true, errors: [] };
  }

  for (const key of FORBIDDEN_ENV_KEYS) {
    if (env[key] !== undefined && env[key] !== "") {
      errors.push(
        `Forbidden production environment variable is set: ${key}. Remove it before deploying.`,
      );
    }
  }

  for (const key of Object.keys(env)) {
    if (key.startsWith("NEXT_PUBLIC_FLAG_") && !ALLOWED_PUBLIC_FLAGS.has(key)) {
      if (env[key] !== undefined && env[key] !== "") {
        errors.push(
          `Unapproved public feature flag is set in production: ${key}. Add it to the allow-list or remove it.`,
        );
      }
    }
  }

  const apiUrl = env.NEXT_PUBLIC_API_URL;
  if (!apiUrl || typeof apiUrl !== "string") {
    errors.push(
      "NEXT_PUBLIC_API_URL must be set in production and must use https://.",
    );
  } else if (!apiUrl.startsWith("https://")) {
    errors.push(
      "NEXT_PUBLIC_API_URL must use https:// in production (got a non-https value).",
    );
  }

  return { ok: errors.length === 0, errors };
}

function main() {
  const result = evaluateProductionEnv(process.env);
  if (!result.ok) {
    console.error("Production environment check failed:\n");
    for (const message of result.errors) {
      console.error(`  • ${message}`);
    }
    console.error(
      "\nRefusing to build. Unset the offending variables and retry.",
    );
    process.exit(1);
  }
  console.log("Production environment check passed.");
}

// Only run the CLI when this file is the entrypoint, not when imported by tests.
const entry = process.argv[1] ? resolve(process.argv[1]) : "";
if (entry === fileURLToPath(import.meta.url)) {
  main();
}
