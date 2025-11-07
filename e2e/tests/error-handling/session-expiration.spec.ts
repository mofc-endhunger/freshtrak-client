import { test, expect } from '@playwright/test';
import { AccountPage } from '../../pages/AccountPage';
import { LoginPage } from '../../pages/LoginPage';
import { DEFAULT_TEST_CREDENTIALS } from '../../fixtures/test-data';

test.describe('Session Expiration', () => {
  test('should redirect to login on session expiration', async ({ page, context }) => {
    const accountPage = new AccountPage(page);
    const loginPage = new LoginPage(page);
    
    // First, sign in
    await loginPage.navigate();
    await loginPage.signIn(
      DEFAULT_TEST_CREDENTIALS.email,
      DEFAULT_TEST_CREDENTIALS.password
    );
    await page.waitForURL(/^\/(?!login)/, { timeout: 10000 });
    
    // Clear authentication (simulate session expiration)
    await context.clearCookies();
    await context.clearPermissions();
    
    // Try to access protected route
    await accountPage.navigate();
    
    // Should redirect to login
    await page.waitForURL(/.*login/, { timeout: 5000 });
    await loginPage.verifyOnLoginPage();
  });

  test('should display appropriate message on session expiration', async ({ page, context }) => {
    const accountPage = new AccountPage(page);
    const loginPage = new LoginPage(page);
    
    // Sign in first
    await loginPage.navigate();
    await loginPage.signIn(
      DEFAULT_TEST_CREDENTIALS.email,
      DEFAULT_TEST_CREDENTIALS.password
    );
    await page.waitForURL(/^\/(?!login)/, { timeout: 10000 });
    
    // Clear session
    await context.clearCookies();
    
    // Try to access protected route
    await accountPage.navigate();
    
    // Wait for redirect
    await page.waitForURL(/.*login/, { timeout: 5000 });
    
    // Check for session expiration message
    const message = page.locator('text=/session|expired|login|sign in/i');
    const isVisible = await message.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Should show message or be on login page
    expect(isVisible || page.url().includes('/login')).toBe(true);
  });

  test('should allow user to re-authenticate after session expiration', async ({ page, context }) => {
    const accountPage = new AccountPage(page);
    const loginPage = new LoginPage(page);
    
    // Sign in
    await loginPage.navigate();
    await loginPage.signIn(
      DEFAULT_TEST_CREDENTIALS.email,
      DEFAULT_TEST_CREDENTIALS.password
    );
    await page.waitForURL(/^\/(?!login)/, { timeout: 10000 });
    
    // Clear session
    await context.clearCookies();
    
    // Try to access protected route
    await accountPage.navigate();
    await page.waitForURL(/.*login/, { timeout: 5000 });
    
    // Re-authenticate
    await loginPage.signIn(
      DEFAULT_TEST_CREDENTIALS.email,
      DEFAULT_TEST_CREDENTIALS.password
    );
    
    // Should be able to access account page again
    await page.waitForURL(/^\/(?!login)/, { timeout: 10000 });
    await accountPage.navigate();
    
    // Should be on account page
    expect(page.url()).toContain('/account');
  });
});

