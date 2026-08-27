import { readFileSync } from "fs";
import { resolve } from "path";

const root = resolve(__dirname, "..");

describe("Regression smoke tests (migrated from smoke-test.sh)", () => {
  describe("#602 — viewport themeColor must be set in layout", () => {
    it('exports themeColor "#000000" in app/layout.tsx', () => {
      const source = readFileSync(resolve(root, "app/layout.tsx"), "utf-8");
      expect(source).toContain('themeColor: "#000000"');
    });
  });

  describe("#601 — signup form double-submit guard", () => {
    it("returns early when isLoading is true in app/signup/page.tsx", () => {
      const source = readFileSync(
        resolve(root, "app/signup/page.tsx"),
        "utf-8",
      );
      expect(source).toContain("if (isLoading) return;");
    });
  });

  describe("#600 — no apiClient<any> in wallet.ts", () => {
    it("does not contain apiClient<any> in lib/api/wallet.ts", () => {
      const source = readFileSync(
        resolve(root, "lib/api/wallet.ts"),
        "utf-8",
      );
      expect(source).not.toContain("apiClient<any>");
    });
  });
});
