#!/usr/bin/env node
/*
 * Guard against the auto-generated `export const dummy_<N> = '<placeholder>';`
 * placeholder pattern that a prior automated PR-generation script left in
 * src/ (and elsewhere). If any file still contains the pattern this script
 * fails, so CI can block the change before it is merged.
 */
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

const IGNORED_DIRS = new Set([".git", "node_modules", ".next", "out", "build", "dist", "coverage", "public", ".turbo"]);
const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".jsx", ".mts", ".cts"]);

// Matches `export const dummy_123 = '<anything>';`
const DUMMY_STUB_PATTERN = /export\s+const\s+dummy_\d+\s*=/;

function collectFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (IGNORED_DIRS.has(entry)) continue;
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      collectFiles(fullPath, acc);
    } else if (stats.isFile() && TEXT_EXTENSIONS.has(entry.slice(entry.lastIndexOf(".")))) {
      acc.push(fullPath);
    }
  }
  return acc;
}

const offenders = collectFiles(root).filter((file) =>
  DUMMY_STUB_PATTERN.test(readFileSync(file, "utf8")),
);

if (offenders.length > 0) {
  console.error("Found dummy-stub placeholder files (export const dummy_<N> = ...):");
  for (const file of offenders) {
    console.error(`  - ${file.replace(root, "")}`);
  }
  console.error("Please replace these placeholder files with real implementations.");
  process.exitCode = 1;
} else {
  console.log("No dummy-stub placeholder files found.");
}