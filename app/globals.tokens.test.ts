import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const css = readFileSync(join(root, "app/globals.css"), "utf8");

const REQUIRED_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
];

const UTILITY_TOKEN_PATTERN =
  /(?:^|[\s"'`{(])(?:[a-z-]+:)*(?:bg|text|border|ring|fill|stroke|divide|from|to|via|outline|shadow)-((?:background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring)(?:-foreground)?)(?:\/\d+)?(?![a-zA-Z-])/g;

function sourceFiles(directory: string): string[] {
  return readdirSync(join(root, directory), { withFileTypes: true }).flatMap(
    (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(path);
      return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
    },
  );
}

function usedSemanticTokens(): Set<string> {
  const tokens = new Set<string>();
  for (const file of ["app", "components", "lib"].flatMap(sourceFiles)) {
    const source = readFileSync(join(root, file), "utf8");
    for (const match of source.matchAll(UTILITY_TOKEN_PATTERN)) {
      tokens.add(match[1]);
    }
  }
  return tokens;
}

function declarations(selector: RegExp): Map<string, string> {
  const match = css.match(selector);
  if (!match) throw new Error(`Missing CSS block: ${selector}`);

  const result = new Map<string, string>();
  for (const declaration of match[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    result.set(declaration[1], declaration[2].trim());
  }
  return result;
}

describe("design tokens", () => {
  const rootColors = declarations(/:root\s*\{([^}]*)\}/);
  const themeColors = declarations(/@theme inline\s*\{([^}]*)\}/);
  const darkColors = declarations(/\.dark\s*\{([^}]*)\}/);
  const tokens = new Set([...REQUIRED_TOKENS, ...usedSemanticTokens()]);

  it("maps every semantic utility to a Tailwind colour token", () => {
    for (const token of [...tokens].sort()) {
      const mapping = themeColors.get(`color-${token}`);
      expect(mapping, `--color-${token} is not mapped in @theme`).toBeDefined();
      expect(mapping).toBe(`var(--${token})`);
    }
  });

  it("defines every token in both :root and .dark", () => {
    for (const token of [...tokens].sort()) {
      expect(rootColors.get(token), `--${token} is missing in :root`).toBeDefined();
      expect(darkColors.get(token), `--${token} is missing in .dark`).toBeDefined();
      expect(darkColors.get(token)).not.toBe(rootColors.get(token));
    }
  });
});
