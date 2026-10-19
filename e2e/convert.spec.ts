import { test, expect } from "@playwright/test";
import { loginViaUi, uniqueEmail } from "./helpers/auth";

test.describe("Convert flow (#1073)", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUi(page, uniqueEmail("cvt"), "Password1!");
  });

  test("quote → confirm success; over-balance blocked", async ({ page }) => {
    await page.goto("/convert");
    await page.getByLabel(/amount \(ngn\)/i).fill("1500");
    await page.getByRole("button", { name: /get quote/i }).click();
    await expect(page.getByTestId("convert-quote")).toBeVisible();
    await page.getByRole("button", { name: /confirm conversion/i }).click();
    await expect(page.getByRole("status")).toContainText(/successful/i);

    await page.getByLabel(/amount \(ngn\)/i).fill("999999999");
    await page.getByRole("button", { name: /get quote/i }).click();
    await expect(page.getByRole("alert")).toContainText(/exceeds available balance/i);
  });

  test("double-click confirm sends one request", async ({ page }) => {
    let confirmCount = 0;
    await page.route("**/api/convert/confirm", async (route) => {
      confirmCount += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto("/convert");
    await page.getByLabel(/amount \(ngn\)/i).fill("1500");
    await page.getByRole("button", { name: /get quote/i }).click();
    await expect(page.getByTestId("convert-quote")).toBeVisible();
    const confirm = page.getByRole("button", { name: /confirm conversion/i });
    await Promise.all([confirm.click(), confirm.click()]);
    await expect.poll(() => confirmCount).toBe(1);
  });
});
