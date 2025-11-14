import { test, expect } from '@playwright/test';
import { AccountPage } from '../../pages/AccountPage';
import { LoginPage } from '../../pages/LoginPage';
import { DEFAULT_TEST_CREDENTIALS } from '../../fixtures/test-data';
import { createUrlPattern, getUrl } from '../../utils/helpers';

test.describe('User Logout', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.signIn(
      DEFAULT_TEST_CREDENTIALS.email,
      DEFAULT_TEST_CREDENTIALS.password
    );
    // Wait for login to complete (redirects to root)
    await page.waitForURL(createUrlPattern('/'), { timeout: 10000 });
  });

  test('should logout authenticated user', async ({ page }) => {
    const accountPage = new AccountPage(page);

    await accountPage.navigate();
    await accountPage.logout();

    // Logout redirects to home page (root)
    await page.waitForURL(createUrlPattern('/'), { timeout: 10000 });
    expect(page.url()).toBe(getUrl('/'));
  });

  test('should redirect to home after logout', async ({ page }) => {
    const accountPage = new AccountPage(page);

    await accountPage.navigate();
    await accountPage.logout();

    // Wait for redirect to home (logout redirects to root)
    await page.waitForURL(createUrlPattern('/'), { timeout: 10000 });

    // Verify we're on home page, not login page
    expect(page.url()).toBe(getUrl('/'));
    expect(page.url()).not.toContain('/login');
  });

  test('should clear session after logout', async ({ page }) => {
    const accountPage = new AccountPage(page);
    const loginPage = new LoginPage(page);

    await accountPage.navigate();
    await accountPage.logout();

    // Wait for redirect to home
    await page.waitForURL(createUrlPattern('/'), { timeout: 10000 });

    // Try to access protected route
    await page.goto('/account');

    // Should redirect to login (protected route requires auth)
    await page.waitForURL(/.*login/, { timeout: 10000 });
    await loginPage.verifyOnLoginPage();
  });
});

