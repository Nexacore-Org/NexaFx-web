import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test('should login as admin and verify admin panel is mock-free', async ({ page }) => {
    // Navigate to admin login
    await page.goto('/admin/login');
    
    // Fill credentials
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Verify redirect to admin dashboard
    await expect(page).toHaveURL(/.*admin\/dashboard/);
    
    // Verify mock-free admin panel
    const dashboardTitle = await page.locator('h1').first().textContent();
    expect(dashboardTitle).toBeTruthy();
    
    // Ensure no mock data banners exist
    const mockBanners = await page.locator('.mock-data-warning').count();
    expect(mockBanners).toBe(0);
  });
});
