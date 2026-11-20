import { expect, test, type Page } from "@playwright/test";

/**
 * Convert flow E2E (#1073, #1194).
 *
 * The page mounts the real ConvertForm → ConvertReview → ConvertSuccess flow,
 * so every backend dependency is mocked at the network boundary. No demo-only
 * "Amount (NGN)" / "Get quote" UI is involved.
 */
async function mockConvertApis(page: Page) {
  const calls = { swaps: 0 };

  await page.route("**/api/wallets", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        balances: [
          { currency: "USD", balance: "1000" },
          { currency: "NGN", balance: "1000000" },
        ],
        depositAddress: null,
      }),
    });
  });

  await page.route("**/api/exchange-rates**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        quotes: [
          {
            pair: "USD/NGN",
            rate: 1500,
            change24h: 0,
            currency: "NGN",
          },
        ],
        updatedAt: new Date().toISOString(),
      }),
    });
  });

  await page.route("**/api/transactions/swap", async (route) => {
    calls.swaps += 1;
    // Keep the request in flight long enough for a second click to be ignored.
    await new Promise((resolve) => setTimeout(resolve, 150));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ transactionId: "tx-e2e-1" }),
    });
  });

  return calls;
}

async function openConvert(page: Page) {
  // URL params bypass the restored draft so every test starts from a clean
  // USD → NGN form.
  await page.goto("/convert?from=USD&to=NGN");
  await expect(page.getByLabel("You pay")).toBeVisible();
  await expect(page.getByText("Balance: 1,000 USD")).toBeVisible();
}

test.describe("Convert flow (#1194)", () => {
  test("quote → review → confirm through the real form", async ({ page }) => {
    const calls = await mockConvertApis(page);
    await openConvert(page);

    await page.getByLabel("You pay").fill("100");
    const review = page.getByRole("button", { name: "Review conversion" });
    await expect(review).toBeEnabled();
    await review.click();

    await expect(
      page.getByRole("heading", { name: "Review your conversion" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Confirm conversion" }).click();
    await expect(
      page.getByRole("heading", { name: "Conversion complete" }),
    ).toBeVisible();
    expect(calls.swaps).toBe(1);
  });

  test("over-balance amount is rejected before quoting", async ({ page }) => {
    const calls = await mockConvertApis(page);
    await openConvert(page);

    await page.getByLabel("You pay").fill("5000");
    await expect(page.getByRole("alert")).toContainText(
      /exceeds your balance of 1,000 USD/i,
    );
    await expect(
      page.getByRole("button", { name: "Review conversion" }),
    ).toBeDisabled();
    expect(calls.swaps).toBe(0);
  });

  test("double-click confirm sends one swap request", async ({ page }) => {
    const calls = await mockConvertApis(page);
    await openConvert(page);

    await page.getByLabel("You pay").fill("100");
    await page.getByRole("button", { name: "Review conversion" }).click();

    const confirm = page.getByRole("button", { name: "Confirm conversion" });
    await expect(confirm).toBeVisible();
    await Promise.all([confirm.click(), confirm.click()]);

    await expect.poll(() => calls.swaps).toBe(1);
  });
});
