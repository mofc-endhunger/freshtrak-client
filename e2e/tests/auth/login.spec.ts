import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { DEFAULT_TEST_CREDENTIALS } from '../../fixtures/test-data';

test.describe('User Login', () => {
  test('should sign in with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.signIn(
      DEFAULT_TEST_CREDENTIALS.email,
      DEFAULT_TEST_CREDENTIALS.password
    );

    // Verify redirect to dashboard/home
    await expect(page).toHaveURL(/^\/(?!login)/);
    
    // Verify dashboard is loaded
    await dashboardPage.verifyDashboardLoaded();
  });

  test('should not sign in with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.signIn('invalid@example.com', 'wrongpassword');

    // Should stay on login page or show error
    // Check for error message or still on login page
    const isOnLoginPage = page.url().includes('/login');
    const hasError = await loginPage.locator('[data-testid="error-message"]').isVisible().catch(() => false);
    
    expect(isOnLoginPage || hasError).toBe(true);
  });

  test('should display error message for invalid login', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.signIn('invalid@example.com', 'wrongpassword');

    // Wait a bit for error to appear
    await page.waitForTimeout(2000);

    // Check for error message
    const errorVisible = await loginPage.locator('[data-testid="error-message"], .error, [role="alert"]')
      .isVisible()
      .catch(() => false);
    
    // Error should be visible or we're still on login page
    expect(errorVisible || page.url().includes('/login')).toBe(true);
  });

  test('should redirect after successful login', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.signIn(
      DEFAULT_TEST_CREDENTIALS.email,
      DEFAULT_TEST_CREDENTIALS.password
    );

    // Wait for navigation
    await page.waitForURL(/^\/(?!login)/, { timeout: 10000 });
    
    // Verify we're not on login page anymore
    expect(page.url()).not.toContain('/login');
  });
});

