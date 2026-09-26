import { test, expect } from '@playwright/test';

test.describe('Signup Flow', () => {
  test('should complete full signup flow: form -> OTP verification -> success', async ({ page }) => {
    // Step 1: Navigate to signup page
    await page.goto('/signup');

    // Step 2: Fill signup form
    await page.fill('input[placeholder="Email address"]', 'test@example.com');
    await page.fill('input[placeholder="Phone Number"]', '+2348012345678');
    await page.fill('input[placeholder="Password"]', 'Password123');
    await page.fill('input[placeholder="Confirm Password"]', 'Password123');

    // Check terms checkbox
    await page.check('#terms');

    // Submit signup form
    await page.click('button[type="submit"]');

    // Step 3: Should redirect to OTP verification page
    await expect(page).toHaveURL(/.*signup\/verify/);

    // Step 4: Enter OTP
    const otpInputs = page.locator('input[inputmode="numeric"][maxlength="1"]');
    await expect(otpInputs).toHaveCount(6);

    // Fill OTP digits
    await otpInputs.nth(0).fill('1');
    await otpInputs.nth(1).fill('2');
    await otpInputs.nth(2).fill('3');
    await otpInputs.nth(3).fill('4');
    await otpInputs.nth(4).fill('5');
    await otpInputs.nth(5).fill('6');

    // Submit OTP
    await page.click('button[type="submit"]');

    // Step 5: Should reach success page
    await expect(page).toHaveURL(/.*signup\/success/);

    // Verify success message
    const successMessage = await page.locator('text=Account created successfully').first();
    await expect(successMessage).toBeVisible();
  });

  test('should show error for invalid OTP', async ({ page }) => {
    await page.goto('/signup/verify');

    const otpInputs = page.locator('input[inputmode="numeric"][maxlength="1"]');
    await expect(otpInputs).toHaveCount(6);

    // Enter wrong OTP
    await otpInputs.nth(0).fill('0');
    await otpInputs.nth(1).fill('0');
    await otpInputs.nth(2).fill('0');
    await otpInputs.nth(3).fill('0');
    await otpInputs.nth(4).fill('0');
    await otpInputs.nth(5).fill('0');

    await page.click('button[type="submit"]');

    // Should show error
    const errorMessage = await page.locator('text=Invalid or expired OTP').first();
    await expect(errorMessage).toBeVisible();
  });
});