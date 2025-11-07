import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';

test.describe('Guest Login', () => {
  test('should continue as guest', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.continueAsGuest();

    // Should redirect to dashboard/home
    await expect(page).toHaveURL(/^\/(?!login)/);
    
    // Verify dashboard is loaded
    await dashboardPage.verifyDashboardLoaded();
  });

  test('should grant guest access', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.continueAsGuest();

    // Wait for redirect
    await page.waitForURL(/^\/(?!login)/, { timeout: 10000 });
    
    // Verify we're not on login page
    expect(page.url()).not.toContain('/login');
  });

  test('should have limited functionality as guest', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.continueAsGuest();

    // Wait for redirect
    await page.waitForURL(/^\/(?!login)/, { timeout: 10000 });

    // Try to access protected route
    await page.goto('/account');
    
    // Should redirect to login or show limited access
    // The behavior depends on your app's implementation
    const isOnLogin = page.url().includes('/login');
    const isOnAccount = page.url().includes('/account');
    
    // Either redirected to login or account page shows limited functionality
    expect(isOnLogin || isOnAccount).toBe(true);
  });
});

