#!/usr/bin/env node

/**
 * Pre-flight environment variable check.
 * Runs before `dev`/`build` (via predev/prebuild in package.json) and
 * fails fast with a clear message if a required variable is missing,
 * instead of letting the app start and fail confusingly at runtime.
 *
 * Related to, but distinct from, the runtime startup-guard (#565) —
 * this catches the problem before the dev server/build even starts.
 */

const fs = require('fs');
const path = require('path');

// Load .env.local / .env manually so this works even before Next.js
// has bootstrapped its own env loading.
function loadDotEnvFiles() {
  const candidates = ['.env.local', '.env'];
  for (const file of candidates) {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) continue;
    const contents = fs.readFileSync(fullPath, 'utf8');
    for (const line of contents.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }
}

// Required variables, derived from .env.example. Keep this list in
// sync with .env.example -- consider generating it automatically if
// the file grows (see "Future improvement" note in the PR).
const REQUIRED_VARS = [
  'NEXT_PUBLIC_API_URL',
  // ...add the remaining required keys from .env.example here
];

// Optional basic shape checks for specific variables.
const SHAPE_CHECKS = {
  NEXT_PUBLIC_API_URL: (value) => {
    try {
      new URL(value);
      return null;
    } catch {
      return 'must be a valid URL (e.g. https://api.example.com)';
    }
  },
};

function main() {
  loadDotEnvFiles();

  const missing = [];
  const invalid = [];

  for (const key of REQUIRED_VARS) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
      continue;
    }
    const check = SHAPE_CHECKS[key];
    if (check) {
      const error = check(value);
      if (error) invalid.push({ key, error });
    }
  }

  if (missing.length === 0 && invalid.length === 0) {
    console.log('✓ Environment check passed — all required variables are present.');
    return;
  }

  console.error('\n✗ Environment check failed.\n');

  if (missing.length > 0) {
    console.error('Missing required environment variable(s):');
    for (const key of missing) {
      console.error(`  - ${key}`);
    }
  }

  if (invalid.length > 0) {
    console.error('\nInvalid environment variable(s):');
    for (const { key, error } of invalid) {
      console.error(`  - ${key}: ${error}`);
    }
  }

  console.error(
    '\nSet the missing/invalid variable(s) in .env.local. See .env.example for reference.\n'
  );

  process.exit(1);
}

main();