#!/usr/bin/env node
/*
 * Runs `next build` with bundle analysis enabled (ANALYZE=true), so
 * `npm run analyze` produces the @next/bundle-analyzer report.
 *
 * The analyzer wiring in next.config.ts is optional: if the
 * `@next/bundle-analyzer` package is not installed the build succeeds as a
 * normal build. Install it (it is added to devDependencies by the
 * bundle-size-budget CI work) to generate the report into `.next/analyze/`.
 */
import { spawnSync } from "node:child_process";

process.env.ANALYZE = "true";

const { status } = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", "build"],
  { stdio: "inherit", shell: process.platform === "win32" },
);

process.exit(status ?? 1);