import { test, expect } from '@playwright/test'

test.describe('Full Authentication Flow', () => {
  test('should complete the full login flow', async ({ page }) => {
    const email = process.env.E2E_EMAIL ?? 'test@example.com';
    const password = process.env.E2E_PASSWORD ?? 'testpassword';

    await test.step('Navigate to /login', async () => {
      await page.goto('/sign-in');
    });

    await test.step('Fill email and password, then submit', async () => {
      await page.fill('[type="email"]', email);
      await page.fill('[type="password"]', password);
      await page.click('button[type="submit"]:has-text("Log in")');
    });

    await test.step('Redirect to /verify-otp', async () => {
      await expect(page).toHaveURL('/verify-otp');
      await expect(page.locator('h1', { hasText: 'VERIFY CODE' })).toBeVisible();
    });

    await test.step('Fill OTP (using test credentials)', async () => {
      const otpInput = page.locator('[type="text"][inputmode="numeric"][maxLength="1"]');
      await otpInput.first().fill('1');
      await otpInput.nth(1).fill('2');
      await otpInput.nth(2).fill('3');
      await otpInput.nth(3).fill('4');
      await otpInput.nth(4).fill('5');
      await otpInput.nth(5).fill('6');
    });

    await test.step('Submit OTP and redirect to /dashboard', async () => {
      await page.click('button[type="submit"]:has-text("Proceed")');
      await expect(page).toHaveURL('/dashboard');
    });

    await test.step('Expect topbar to show the user\'s real name', async () => {
      const topbar = page.locator('.relative .text-sm.font-medium.text-foreground');
      await expect(topbar).toBeVisible();
      const userName = await topbar.textContent();
      await expect(userName).not.toBe('undefined');
    });
  });

  test('should allow logout from dashboard', async ({ page }) => {
    const email = process.env.E2E_EMAIL ?? 'test@example.com';
    const password = process.env.E2E_PASSWORD ?? 'testpassword';

    await test.step('Complete login flow', async () => {
      await page.goto('/sign-in');
      await page.fill('[type="email"]', email);
      await page.fill('[type="password"]', password);
      await page.click('button[type="submit"]:has-text("Log in")');
      await page.goto('/verify-otp');
      const otpInput = page.locator('[type="text"][inputmode="numeric"][maxLength="1"]');
      await otpInput.first().fill('1');
      await otpInput.nth(1).fill('2');
      await otpInput.nth(2).fill('3');
      await otpInput.nth(3).fill('4');
      await otpInput.nth(4).fill('5');
      await otpInput.nth(5).fill('6');
      await page.click('button[type="submit"]:has-text("Proceed")');
      await expect(page).toHaveURL('/dashboard');
    });

    await test.step('Click logout button and expect redirect to /sign-in', async () => {
      const logoutButton = page.locator('button:has-text("Logout")');
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      } else {
        await page.goto('/dashboard');
        await page.click('[data-testid="sidebar"] button:last-child');
      }
      await expect(page).toHaveURL('/sign-in');
    });
  });

  test.describe('Unauthenticated Guards', () => {
    test('dashboard should redirect to /sign-in when not logged in', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/sign-in');
    });

    test('admin panel should redirect to /sign-in when not logged in', async ({ page }) => {
      await page.goto('/admin');
      await expect(page).toHaveURL('/sign-in');
    });

    test('admin/analytics should redirect to /sign-in when not logged in', async ({ page }) => {
      await page.goto('/admin/analytics');
      await expect(page).toHaveURL('/sign-in');
    });

    test('admin/users should redirect to /sign-in when not logged in', async ({ page }) => {
      await page.goto('/admin/users');
      await expect(page).toHaveURL('/sign-in');
    });
  });
});