import { test } from '@playwright/test';
import { AccountPage } from '../../pages/AccountPage';
import { LoginPage } from '../../pages/LoginPage';
import { DEFAULT_TEST_CREDENTIALS } from '../../fixtures/test-data';
import { compareScreenshot } from '../../utils/visual-testing';

test.describe('Account Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.signIn(
      DEFAULT_TEST_CREDENTIALS.email,
      DEFAULT_TEST_CREDENTIALS.password
    );
    await page.waitForURL(/^\/(?!login)/, { timeout: 10000 });
  });

  test('should match baseline screenshot for account page', async ({ page }) => {
    const accountPage = new AccountPage(page);
    
    await accountPage.navigate();
    await page.waitForLoadState('networkidle');
    
    // Compare with baseline
    await compareScreenshot(page, 'account-page', {
      fullPage: true,
      threshold: 0.2,
    });
  });
});

