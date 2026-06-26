import { test, expect } from '@playwright/test'

const E2E_EMAIL = process.env.E2E_EMAIL || 'test@example.com'
const E2E_PASSWORD = process.env.E2E_PASSWORD || 'testpassword'
const E2E_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@example.com'
const E2E_ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'adminpassword'

test.describe('Authentication flow', () => {
  test('should login with valid credentials and redirect to dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('Enter email address or phone').fill(E2E_EMAIL)
    await page.getByPlaceholder('Enter password').fill(E2E_PASSWORD)
    await page.getByRole('button', { name: 'Log in' }).click()

    await expect(page).toHaveURL('/verify-otp')

    await page.locator('input[type="text"]').nth(0).fill('123456')
    await page.getByRole('button', { name: 'Proceed' }).click()

    await expect(page).toHaveURL('/dashboard')

    await expect(page.locator('span.font-medium.text-foreground')).toContainText('Test')
  })

  test('should verify unauthenticated access guard - dashboard', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL('/login')
  })

  test('should verify unauthenticated access guard - admin', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL('/login')
  })
})