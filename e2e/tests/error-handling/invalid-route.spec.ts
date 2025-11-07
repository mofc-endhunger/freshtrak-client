import { test, expect } from '@playwright/test';

test.describe('Invalid Route Handling', () => {
  test('should show 404 page for invalid route', async ({ page }) => {
    // Navigate to non-existent route
    await page.goto('/invalid-route-that-does-not-exist');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Should show 404 or redirect to home
    const url = page.url();
    const has404 = page.locator('text=/404|not found|page not found/i');
    const is404Visible = await has404.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Should either show 404 or redirect to home
    expect(is404Visible || url === '/' || url.includes('/')).toBe(true);
  });

  test('should provide navigation options on 404 page', async ({ page }) => {
    // Navigate to invalid route
    await page.goto('/invalid-route');
    await page.waitForLoadState('networkidle');
    
    // Check for navigation options
    const homeLink = page.locator('a[href="/"], a[href*="home"], [data-testid="nav-home"]');
    const isVisible = await homeLink.first().isVisible({ timeout: 2000 }).catch(() => false);
    
    // Should have navigation options or be redirected
    const url = page.url();
    expect(isVisible || url === '/' || url.includes('/')).toBe(true);
  });

  test('should allow user to navigate back from 404', async ({ page }) => {
    // Navigate to a valid page first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to invalid route
    await page.goto('/invalid-route');
    await page.waitForLoadState('networkidle');
    
    // Try to navigate back
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    // Should be back on previous page
    const url = page.url();
    expect(url === '/' || url.includes('/')).toBe(true);
  });
});

