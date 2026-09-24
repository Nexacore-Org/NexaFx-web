import { Page } from "@playwright/test";

export async function login(page: Page): Promise<void> {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  const otp = process.env.E2E_TEST_OTP || "000000";

  if (!email || !password) {
    throw new Error(
      "E2E_TEST_EMAIL and E2E_TEST_PASSWORD environment variables must be set"
    );
  }

  await page.goto("/sign-in");

  await page.fill(
    'input[title="Email address or mobile number"]',
    email
  );
  await page.fill('input[title="Password"]', password);
  await page.click('button[type="submit"]');

  await page.waitForURL("**/verify-otp**");

  const inputs = page.locator('input[inputmode="numeric"]');
  const digits = otp.split("");
  for (let i = 0; i < digits.length; i++) {
    await inputs.nth(i).fill(digits[i]);
  }

  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard**");
}
