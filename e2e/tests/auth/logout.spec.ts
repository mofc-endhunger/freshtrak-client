import { test, expect } from '@playwright/test';
import { AccountPage } from '../../pages/AccountPage';
import { LoginPage } from '../../pages/LoginPage';
import { DEFAULT_TEST_CREDENTIALS } from '../../fixtures/test-data';

test.describe('User Logout', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.signIn(
      DEFAULT_TEST_CREDENTIALS.email,
      DEFAULT_TEST_CREDENTIALS.password
    );
    // Wait for login to complete
    await page.waitForURL(/^\/(?!login)/, { timeout: 10000 });
  });

  test('should logout authenticated user', async ({ page }) => {
    const accountPage = new AccountPage(page);

    await accountPage.navigate();
    await accountPage.logout();

    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should redirect to login after logout', async ({ page }) => {
    const accountPage = new AccountPage(page);

    await accountPage.navigate();
    await accountPage.logout();

    // Wait for redirect
    await page.waitForURL(/.*login/, { timeout: 10000 });
    
    // Verify we're on login page
    const loginPage = new LoginPage(page);
    await loginPage.verifyOnLoginPage();
  });

  test('should clear session after logout', async ({ page }) => {
    const accountPage = new AccountPage(page);
    const loginPage = new LoginPage(page);

    await accountPage.navigate();
    await accountPage.logout();

    // Wait for redirect
    await page.waitForURL(/.*login/, { timeout: 10000 });

    // Try to access protected route
    await page.goto('/account');
    
    // Should redirect back to login
    await page.waitForURL(/.*login/, { timeout: 5000 });
    await loginPage.verifyOnLoginPage();
  });
});

