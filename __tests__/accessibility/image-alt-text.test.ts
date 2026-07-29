import { readFileSync } from "fs";
import { globSync } from "glob";
import path from "path";

/**
 * Static analysis test to ensure all <Image> and <img> tags have
 * appropriate alt attributes per WCAG 2.1 Level A.
 */

const ROOT = path.resolve(__dirname, "../..");

function getTsxFiles(): string[] {
  return globSync("**/*.tsx", {
    cwd: ROOT,
    ignore: ["node_modules/**", ".next/**", "dist/**"],
    absolute: true,
  });
}

/**
 * Extracts all <Image .../> and <img .../> tags from file content,
 * handling multi-line JSX tags.
 */
function extractImageTags(content: string): { tag: string; line: number }[] {
  const results: { tag: string; line: number }[] = [];
  // Match <Image or <img followed by attributes and closing /> or >
  const regex = /<(?:Image|img)\b[^>]*?\/?>/gs;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const line = content.slice(0, match.index).split("\n").length;
    results.push({ tag: match[0], line });
  }
  return results;
}

function hasAltAttribute(tag: string): boolean {
  // Match alt= followed by a string value or JSX expression
  return /\balt\s*=\s*(?:"[^"]*"|'[^']*'|\{[^}]*\})/.test(tag);
}

describe("Image alt text accessibility", () => {
  const tsxFiles = getTsxFiles();

  it("should find .tsx files to scan", () => {
    expect(tsxFiles.length).toBeGreaterThan(0);
  });

  it("every <Image> and <img> tag must have an alt attribute", () => {
    const violations: string[] = [];

    for (const filePath of tsxFiles) {
      const content = readFileSync(filePath, "utf-8");
      // Skip commented-out image tags (inside {/* */} or // comments)
      const imageTags = extractImageTags(content);

      for (const { tag, line } of imageTags) {
        if (!hasAltAttribute(tag)) {
          const relativePath = path.relative(ROOT, filePath);
          violations.push(`${relativePath}:${line} — missing alt attribute`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("logo images should have descriptive alt text including 'logo'", () => {
    const violations: string[] = [];

    for (const filePath of tsxFiles) {
      const content = readFileSync(filePath, "utf-8");
      const imageTags = extractImageTags(content);

      for (const { tag, line } of imageTags) {
        // Check if this is a logo image (src contains "logo")
        const srcMatch = tag.match(/src\s*=\s*(?:"([^"]*)"|'([^']*)')/);
        const src = srcMatch?.[1] ?? srcMatch?.[2] ?? "";

        if (/logo/i.test(src)) {
          const altMatch = tag.match(
            /\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/
          );
          const altText = altMatch?.[1] ?? altMatch?.[2] ?? "";

          if (altText && !/logo/i.test(altText)) {
            const relativePath = path.relative(ROOT, filePath);
            violations.push(
              `${relativePath}:${line} — logo image alt="${altText}" should include the word "logo"`
            );
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("decorative images with aria-hidden should have empty alt text", () => {
    const violations: string[] = [];

    for (const filePath of tsxFiles) {
      const content = readFileSync(filePath, "utf-8");
      const imageTags = extractImageTags(content);

      for (const { tag, line } of imageTags) {
        if (/aria-hidden/.test(tag)) {
          const altMatch = tag.match(
            /\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/
          );
          const altText = altMatch?.[1] ?? altMatch?.[2];

          if (altText !== undefined && altText !== "") {
            const relativePath = path.relative(ROOT, filePath);
            violations.push(
              `${relativePath}:${line} — aria-hidden image should have alt="", got alt="${altText}"`
            );
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("no image should use a raw filename as alt text", () => {
    const violations: string[] = [];

    for (const filePath of tsxFiles) {
      const content = readFileSync(filePath, "utf-8");
      const imageTags = extractImageTags(content);

      for (const { tag, line } of imageTags) {
        const altMatch = tag.match(
          /\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/
        );
        const altText = altMatch?.[1] ?? altMatch?.[2] ?? "";

        // Alt text should not look like a filename (e.g., "image.png", "logo.svg")
        if (/\.\w{2,4}$/.test(altText)) {
          const relativePath = path.relative(ROOT, filePath);
          violations.push(
            `${relativePath}:${line} — alt text "${altText}" appears to be a filename`
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
