import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("page landmarks", () => {
  it("lets the group layouts own the single main landmark", () => {
    const root = source("app/layout.tsx");
    expect(root).not.toContain("<main");
    expect(root).not.toContain('role="banner"');
    expect(root).not.toContain('role="contentinfo"');

    for (const layout of [
      "app/(dashboard)/layout.tsx",
      "app/(marketing)/layout.tsx",
      "app/(auth)/layout.tsx",
      "app/(admin)/layout.tsx",
    ]) {
      expect(source(layout)).toContain('id="main-content"');
    }
  });

  it("keeps one skip link pointing at the shared main id", () => {
    const sources = [
      "app/layout.tsx",
      "app/(dashboard)/layout.tsx",
      "components/a11y/skip-link.tsx",
    ].map(source);

    const links = sources.join("\n").match(/href="#[^"]+"/g) ?? [];
    expect(links).toEqual(['href="#main-content"']);
  });

  it("does not nest a second main inside pages", () => {
    for (const page of [
      "app/page.tsx",
      "app/(marketing)/account-deleted/page.tsx",
      "app/(auth)/login/page.tsx",
      "app/(dashboard)/convert/page.tsx",
    ]) {
      const markup = source(page);
      // A page-level main is only valid when no group layout supplies one.
      if (page === "app/page.tsx") {
        expect(markup).toContain('id="main-content"');
      } else {
        expect(markup).not.toContain("<main");
      }
    }
  });

  it("does not put a heading in the topbar", () => {
    expect(source("components/dashboard/topbar.tsx")).not.toContain("<h1");
  });
});
