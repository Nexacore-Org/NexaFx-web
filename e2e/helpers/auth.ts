import { expect, type Page, type BrowserContext } from "@playwright/test";

export function uniqueEmail(prefix = "user"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

/** Assert no access/refresh tokens in localStorage or non-httpOnly readable cookies. */
export async function assertNoClientTokenLeak(page: Page): Promise<void> {
  const local = await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    return keys.filter((k) =>
      /token|access|refresh|jwt|session/i.test(k),
    );
  });
  expect(local, "no auth tokens in localStorage").toEqual([]);

  const cookies = await page.context().cookies();
  const readableSecrets = cookies.filter(
    (c) =>
      !c.httpOnly &&
      /token|access|refresh|jwt/i.test(c.name) &&
      c.value.length > 0,
  );
  expect(readableSecrets, "no non-httpOnly token cookies").toEqual([]);
}

export async function signupViaUi(
  page: Page,
  email: string,
  password = "Password1!",
): Promise<void> {
  await page.goto("/signup");
  await page.getByLabel("First Name").fill("Test");
  await page.getByLabel("Last Name").fill("User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm Password").fill(password);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /sign up/i }).click();
  await expect(page).toHaveURL(/\/verify/);
}

export async function loginViaUi(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
}
