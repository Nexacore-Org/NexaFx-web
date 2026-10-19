#!/usr/bin/env node
/**
 * Compare Next.js build first-load JS sizes against bundle-budget.json (#1076).
 *
 * Usage: node scripts/check-bundle-budget.mjs
 *
 * How to update a budget:
 * 1. Run `npm run build` and note route JS sizes.
 * 2. Edit `bundle-budget.json` for that route (or defaultFirstLoadJsKb).
 * 3. In the PR, justify the increase.
 */

import { readFileSync, existsSync, readdirSync, statSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const budgetPath = join(root, "bundle-budget.json");

function loadBudget() {
  const raw = JSON.parse(readFileSync(budgetPath, "utf8"));
  return {
    defaultFirstLoadJsKb: Number(raw.defaultFirstLoadJsKb ?? 350),
    routes: raw.routes ?? {},
  };
}

function collectSizes() {
  const sizes = new Map();
  const appDir = join(root, ".next/static/chunks/app");
  if (!existsSync(appDir)) {
    const chunksDir = join(root, ".next/static/chunks");
    if (!existsSync(chunksDir)) {
      console.error("No .next build output found. Run `npm run build` first.");
      process.exit(2);
    }
    let total = 0;
    for (const name of readdirSync(chunksDir)) {
      if (!name.endsWith(".js")) continue;
      total += statSync(join(chunksDir, name)).size;
    }
    sizes.set("/", total);
    return sizes;
  }

  function walk(dir, routePrefix) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        const seg = entry.name.startsWith("(") ? routePrefix : join(routePrefix, entry.name);
        walk(full, seg === "" ? "/" : seg.replace(/\\/g, "/"));
      } else if (entry.name.endsWith(".js")) {
        const route = routePrefix === "" ? "/" : routePrefix.replace(/\\/g, "/");
        sizes.set(route, (sizes.get(route) ?? 0) + statSync(full).size);
      }
    }
  }
  walk(appDir, "");
  if (sizes.size === 0) sizes.set("/", 0);
  return sizes;
}

export function compareBudgets(sizesBytes, budget) {
  const rows = [];
  for (const [route, bytes] of sizesBytes) {
    const sizeKb = Math.round((bytes / 1024) * 10) / 10;
    const budgetKb =
      budget.routes[route] ??
      budget.routes[route.replace(/\/$/, "") || "/"] ??
      budget.defaultFirstLoadJsKb;
    const deltaKb = Math.round((sizeKb - budgetKb) * 10) / 10;
    rows.push({
      route,
      sizeKb,
      budgetKb,
      deltaKb,
      ok: sizeKb <= budgetKb,
    });
  }
  rows.sort((a, b) => a.route.localeCompare(b.route));
  return rows;
}

function printTable(rows) {
  const header = ["Route", "Size (KB)", "Budget (KB)", "Delta", "Status"];
  const lines = [
    header.join(" | "),
    header.map(() => "---").join(" | "),
    ...rows.map((r) =>
      [
        r.route,
        String(r.sizeKb),
        String(r.budgetKb),
        (r.deltaKb >= 0 ? "+" : "") + r.deltaKb,
        r.ok ? "OK" : "EXCEEDED",
      ].join(" | "),
    ),
  ];
  const table = lines.join("\n");
  console.log(table);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `## Bundle budget\n\n\`\`\`\n${table}\n\`\`\`\n`,
    );
  }
  return table;
}

function main() {
  const budget = loadBudget();
  const sizes = collectSizes();
  const rows = compareBudgets(sizes, budget);
  printTable(rows);
  const failed = rows.filter((r) => !r.ok);
  if (failed.length) {
    console.error(
      `\n${failed.length} route(s) exceeded budget. Update bundle-budget.json with justification in the PR.`,
    );
    process.exit(1);
  }
  console.log("\nAll routes within budget.");
}

const entry = process.argv[1] || "";
if (entry.includes("check-bundle-budget")) {
  main();
}
