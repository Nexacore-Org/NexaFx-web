#!/usr/bin/env node

/**
 * Verifies that every path alias declared in tsconfig.json resolves to
 * a real, existing directory, and that the mirrored alias definitions in
 * jest.config.js's `moduleNameMapper` and components.json's `aliases`
 * agree with it.
 *
 * Without this check, an alias/directory drift (e.g. after a folder
 * rename) only surfaces later as a confusing runtime or build-time
 * module-resolution error in some unrelated file that happens to import
 * the stale alias.
 *
 * Run directly: `node scripts/check-path-aliases.js`
 * Wired in as a `prebuild` step in package.json so it runs before every
 * `npm run build`.
 */

/* eslint-disable @typescript-eslint/no-require-imports -- plain Node CommonJS script, same convention as scripts/check-env.js. */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const TSCONFIG_PATH = path.join(ROOT, "tsconfig.json");
const JEST_CONFIG_PATH = path.join(ROOT, "jest.config.js");
const COMPONENTS_JSON_PATH = path.join(ROOT, "components.json");

// Strip line comments, block comments, and trailing commas so tsconfig.json
// (which allows both) can be parsed with JSON.parse. String-aware so that
// "//" or "/*" appearing inside a JSON string value (e.g. a path glob) is
// never mistaken for the start of a comment.
function stripJsonComments(contents) {
  let result = "";
  let inString = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < contents.length; i++) {
    const ch = contents[i];
    const next = contents[i + 1];

    if (inLineComment) {
      if (ch === "\n") {
        inLineComment = false;
        result += ch;
      }
      continue;
    }

    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (inString) {
      result += ch;
      if (ch === "\\") {
        // Preserve the escaped character as-is (handles \" correctly).
        result += next;
        i++;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      result += ch;
    } else if (ch === "/" && next === "/") {
      inLineComment = true;
      i++;
    } else if (ch === "/" && next === "*") {
      inBlockComment = true;
      i++;
    } else {
      result += ch;
    }
  }

  return result;
}

function parseJsonc(contents) {
  const withoutComments = stripJsonComments(contents);
  const withoutTrailingCommas = withoutComments.replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(withoutTrailingCommas);
}

function readJson(filePath) {
  const contents = fs.readFileSync(filePath, "utf8");
  return parseJsonc(contents);
}

/** Strip a trailing "*" wildcard from an alias pattern or target, if
 * present, while keeping the separator before it (e.g. "@/*" -> "@/",
 * "./*" -> "./"). */
function stripWildcard(value) {
  return value.endsWith("*") ? value.slice(0, -1) : value;
}

function isExistingDirectory(absolutePath) {
  try {
    return fs.statSync(absolutePath).isDirectory();
  } catch {
    return false;
  }
}

function isExistingFileOrDirectory(absolutePath) {
  if (fs.existsSync(absolutePath)) return true;
  // components.json / mirrored aliases often point at a module without
  // its extension (e.g. "lib/utils" for "lib/utils.ts").
  return [".ts", ".tsx", ".js", ".jsx"].some((ext) =>
    fs.existsSync(absolutePath + ext),
  );
}

function main() {
  const errors = [];

  if (!fs.existsSync(TSCONFIG_PATH)) {
    console.error(`✗ Path alias check failed: ${TSCONFIG_PATH} not found.`);
    process.exit(1);
  }

  const tsconfig = readJson(TSCONFIG_PATH);
  const compilerOptions = tsconfig.compilerOptions ?? {};
  const paths = compilerOptions.paths ?? {};
  const baseUrl = compilerOptions.baseUrl ?? ".";
  const baseDir = path.resolve(ROOT, baseUrl);

  if (Object.keys(paths).length === 0) {
    console.log(
      "✓ Path alias check passed — tsconfig.json declares no path aliases.",
    );
    return;
  }

  // Resolve each tsconfig alias to the real directory it should point at,
  // so the jest/components.json checks below can reuse the same mapping.
  const resolvedAliases = {}; // e.g. { "@/": "/abs/path/to/project" }

  for (const [pattern, targets] of Object.entries(paths)) {
    const aliasPrefix = stripWildcard(pattern);
    if (!Array.isArray(targets) || targets.length === 0) {
      errors.push(`tsconfig.json: alias "${pattern}" has no target path(s).`);
      continue;
    }

    for (const target of targets) {
      const targetPath = stripWildcard(target);
      const absoluteTarget = path.resolve(baseDir, targetPath);

      if (!isExistingDirectory(absoluteTarget)) {
        errors.push(
          `tsconfig.json: alias "${pattern}" -> "${target}" does not resolve to an ` +
            `existing directory (looked for ${absoluteTarget}).`,
        );
        continue;
      }

      // Keep the first valid resolution for cross-checking below.
      if (!(aliasPrefix in resolvedAliases)) {
        resolvedAliases[aliasPrefix] = absoluteTarget;
      }
    }
  }

  // --- Cross-check jest.config.js's moduleNameMapper -----------------
  if (fs.existsSync(JEST_CONFIG_PATH)) {
    let jestConfig;
    try {
      delete require.cache[require.resolve(JEST_CONFIG_PATH)];
      jestConfig = require(JEST_CONFIG_PATH);
    } catch (err) {
      errors.push(`jest.config.js: failed to load (${err.message}).`);
      jestConfig = null;
    }

    const moduleNameMapper = jestConfig?.moduleNameMapper ?? {};
    for (const [regexKey, mappedValue] of Object.entries(moduleNameMapper)) {
      // Turn "^@/(.*)$" into "@/" and "<rootDir>/$1" into "<rootDir>" so it
      // can be compared against the tsconfig alias prefixes above.
      const aliasPrefix = regexKey
        .replace(/^\^/, "")
        .replace(/\(\.\*\)\$?$/, "");
      const target = mappedValue.replace(/\$1$/, "").replace("<rootDir>", ROOT);
      const absoluteTarget = path.resolve(target);

      if (!isExistingDirectory(absoluteTarget)) {
        errors.push(
          `jest.config.js: moduleNameMapper "${regexKey}" -> "${mappedValue}" does not ` +
            `resolve to an existing directory (looked for ${absoluteTarget}).`,
        );
        continue;
      }

      const tsconfigTarget = resolvedAliases[aliasPrefix];
      if (tsconfigTarget && tsconfigTarget !== absoluteTarget) {
        errors.push(
          `jest.config.js: moduleNameMapper "${regexKey}" resolves to ${absoluteTarget}, ` +
            `but tsconfig.json's "${aliasPrefix}*" resolves to ${tsconfigTarget} instead.`,
        );
      }
    }
  }

  // --- Cross-check components.json's aliases --------------------------
  if (fs.existsSync(COMPONENTS_JSON_PATH)) {
    let componentsJson;
    try {
      componentsJson = readJson(COMPONENTS_JSON_PATH);
    } catch (err) {
      errors.push(`components.json: failed to parse (${err.message}).`);
      componentsJson = null;
    }

    const aliases = componentsJson?.aliases ?? {};
    for (const [name, aliasValue] of Object.entries(aliases)) {
      // Resolve the alias (e.g. "@/lib/utils") against whichever
      // tsconfig prefix it starts with (e.g. "@/" -> baseDir).
      const matchingPrefix = Object.keys(resolvedAliases)
        .sort((a, b) => b.length - a.length) // longest prefix first
        .find((prefix) => aliasValue.startsWith(prefix));

      if (!matchingPrefix) {
        errors.push(
          `components.json: alias "${name}" -> "${aliasValue}" does not match any ` +
            `alias declared in tsconfig.json.`,
        );
        continue;
      }

      const rest = aliasValue.slice(matchingPrefix.length);
      const absoluteTarget = path.resolve(
        resolvedAliases[matchingPrefix],
        rest,
      );

      if (!isExistingFileOrDirectory(absoluteTarget)) {
        errors.push(
          `components.json: alias "${name}" -> "${aliasValue}" does not resolve to an ` +
            `existing file or directory (looked for ${absoluteTarget}).`,
        );
      }
    }
  }

  if (errors.length === 0) {
    console.log(
      `✓ Path alias check passed — ${Object.keys(paths).length} tsconfig alias(es) ` +
        "resolve to real directories, and jest.config.js/components.json agree.",
    );
    return;
  }

  console.error("\n✗ Path alias check failed.\n");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  console.error(
    "\nA declared alias no longer points at a real directory (or a mirrored " +
      "config has drifted from tsconfig.json) -- likely a stale alias after a " +
      "folder rename. Update tsconfig.json, jest.config.js and components.json " +
      "to agree, or remove the alias if it is no longer needed.\n",
  );
  process.exit(1);
}

main();
