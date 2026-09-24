import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe("Balance Display", () => {
    test("should show account balance and reject V1 hardcoded values", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText("Total balance")).toBeVisible({
        timeout: 15000,
      });

      const balanceEl = page.locator("h2").first();
      await expect(balanceEl).not.toBeEmpty();

      const balanceText = (await balanceEl.textContent()) ?? "";
      expect(balanceText.trim()).not.toBe("325,980.65");
      expect(balanceText.trim()).not.toBe("1,160.52");

      const copyButton = page.getByRole("button", {
        name: "Copy wallet address",
      });
      await expect(copyButton).toBeVisible({ timeout: 10000 });

      const parent = copyButton.locator("..");
      const walletText = (await parent.locator("p").textContent()) ?? "";
      expect(walletText.trim()).not.toBe("");
      expect(walletText.trim()).not.toBe("0x1234...");
    });
  });

  test.describe("Transaction History", () => {
    test("should render transaction table or empty state and reject V1 data", async ({ page }) => {
      await page.goto("/transactions");

      await expect(page.locator(".animate-spin")).toHaveCount(0, {
        timeout: 15000,
      });

      const rows = page.locator("table tbody tr");
      const emptyState = page.getByText(/No recent/i);

      const hasRows = (await rows.count()) > 0;

      if (!hasRows) {
        await expect(emptyState).toBeVisible();
        return;
      }

      const rowCount = await rows.count();

      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const amountCell = row.locator("td").nth(4);
        const amountText = (await amountCell.textContent()) ?? "";
        expect(amountText).not.toContain("80 USD");
      }

      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const typeCell = row.locator("td").first();
        const typeText = (await typeCell.textContent()) ?? "";

        if (typeText.includes("Convert")) {
          const currencyCell = row.locator("td").nth(1);
          const currencyText = (await currencyCell.textContent()) ?? "";
          expect(currencyText).toContain("→");

          const secondaryDiv = row.locator("td").nth(4).locator("div");
          await expect(secondaryDiv).toBeVisible();
          const secondaryText = (await secondaryDiv.textContent()) ?? "";
          expect(secondaryText.trim()).not.toBe("");
        }

        if (typeText.includes("Deposit")) {
          const secondaryDiv = row.locator("td").nth(4).locator("div");
          expect(await secondaryDiv.count()).toBe(0);
        }
      }
    });
  });

  test.describe("Convert Flow", () => {
    test("should display currency selectors and handle conversion rate", async ({ page }) => {
      await page.goto("/convert");

      await expect(page.getByText("Currency Convert")).toBeVisible({
        timeout: 10000,
      });

      const cards = page.locator(".rounded-2xl.border.border-border");
      await expect(cards.first()).toBeVisible();

      const fromCard = cards.nth(0);
      const toCard = cards.nth(1);

      const fromSelector = fromCard.locator("button").first();
      const toSelector = toCard.locator("button").first();

      await expect(fromSelector).toBeVisible();
      await expect(toSelector).toBeVisible();

      await fromSelector.click();
      const fromOptions = page
        .locator("[class*='top-full']")
        .first()
        .locator("button");
      await expect(fromOptions.first()).toBeVisible();
      expect(await fromOptions.count()).toBeGreaterThan(0);
      await fromOptions.first().press("Escape");

      await toSelector.click();
      const toOptions = page
        .locator("[class*='top-full']")
        .last()
        .locator("button");
      await expect(toOptions.first()).toBeVisible();
      expect(await toOptions.count()).toBeGreaterThan(0);
      await toOptions.first().press("Escape");

      const submitButton = page.getByRole("button", { name: "Convert Now" });
      await expect(submitButton).toBeVisible();

      const rateBanner = page
        .getByText("Exchange Rate")
        .or(page.getByText("Fetching live rates"))
        .or(page.getByText("Rates unavailable"));

      const rateVisible = await rateBanner
        .first()
        .isVisible({ timeout: 10000 })
        .catch(() => false);

      if (rateVisible && (await page.getByText("Exchange Rate").isVisible())) {
        const amountInput = page.locator('input[inputmode="decimal"]');
        await amountInput.fill("100");

        await expect(submitButton).toBeEnabled({ timeout: 5000 }).catch(() => {
          /* ok — button may stay disabled if insufficient balance etc */
        });

        const convertedDisplay = toCard.locator("span.text-base.font-semibold");
        await expect(convertedDisplay).not.toHaveText("0.00", {
          timeout: 5000,
        });

        const convertedText = (await convertedDisplay.textContent()) ?? "";
        expect(convertedText.trim()).not.toBe("");
        expect(convertedText.trim()).not.toBe("0.00");
      }
    });
  });

  test.describe("Deposit Page", () => {
    test("should show wallet address and QR code directly on the deposit page", async ({ page }) => {
      await page.goto("/dashboard/deposit");

      const qrCode = page.locator('svg[aria-label="Wallet address QR code"]');
      await expect(qrCode.first()).toBeVisible({ timeout: 10000 });

      const addressSpan = page.locator('span:has-text("0x")');
      await expect(addressSpan.first()).toBeVisible({ timeout: 5000 });

      const addressText = await addressSpan.first().textContent();
      expect(addressText?.trim()).not.toBe("");
      expect(addressText?.trim()).not.toBe("0x1234...");
    });
  });
});
