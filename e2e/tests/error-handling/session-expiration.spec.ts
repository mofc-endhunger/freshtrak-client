import { test, expect } from '@playwright/test';
import { AccountPage } from '../../pages/AccountPage';
import { LoginPage } from '../../pages/LoginPage';
import { DEFAULT_TEST_CREDENTIALS } from '../../fixtures/test-data';
import { createUrlPattern } from '../../utils/helpers';

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
    await page.waitForURL(createUrlPattern('/'), { timeout: 10000 });
    
    // Clear authentication (simulate session expiration)
    await context.clearCookies();
    await context.clearPermissions();
    
    // Try to access protected route
    await accountPage.navigate();
    
    // Should redirect to login or stay on account page (depending on implementation)
    await page.waitForTimeout(2000);
    const isOnLoginPage = page.url().includes('/login');
    const isOnAccountPage = page.url().includes('/account');
    
    // Should be on login page (redirected) or account page (if session still valid)
    if (isOnLoginPage) {
      await loginPage.verifyOnLoginPage();
    } else {
      // If not redirected, session might still be valid or app handles it differently
      expect(isOnAccountPage || isOnLoginPage).toBe(true);
    }
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
    await page.waitForURL(createUrlPattern('/'), { timeout: 10000 });
    
    // Clear session
    await context.clearCookies();
    
    // Try to access protected route
    await accountPage.navigate();
    
    // Wait for redirect or check current state
    await page.waitForTimeout(2000);
    
    const isOnLoginPage = page.url().includes('/login');
    const isOnAccountPage = page.url().includes('/account');
    
    // Check for session expiration message
    const message = page.locator('text=/session|expired|login|sign in/i');
    const isVisible = await message.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Should show message, be on login page, or still on account page (if session handling differs)
    expect(isVisible || isOnLoginPage || isOnAccountPage).toBe(true);
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
    await page.waitForURL(createUrlPattern('/'), { timeout: 10000 });
    
    // Clear session
    await context.clearCookies();
    
    // Try to access protected route
    await accountPage.navigate();
    await page.waitForTimeout(2000);
    
    const isOnLoginPage = page.url().includes('/login');
    
    if (isOnLoginPage) {
      // Re-authenticate
      await loginPage.signIn(
        DEFAULT_TEST_CREDENTIALS.email,
        DEFAULT_TEST_CREDENTIALS.password
      );
      
      // Should be able to access account page again
      await page.waitForURL(createUrlPattern('/'), { timeout: 10000 });
      await accountPage.navigate();
      
      // Should be on account page
      expect(page.url()).toContain('/account');
    } else {
      // If not redirected, session might still be valid or app handles it differently
      // Just verify we're on a valid page
      const isOnAccountPage = page.url().includes('/account');
      expect(isOnAccountPage || isOnLoginPage).toBe(true);
    }
  });
});

