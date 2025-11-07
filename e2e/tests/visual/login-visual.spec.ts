import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { compareScreenshot } from '../../utils/visual-testing';

test.describe('Login Page Visual Tests', () => {
  test('should match baseline screenshot for login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.navigate();
    await page.waitForLoadState('networkidle');
    
    // Compare with baseline
    await compareScreenshot(page, 'login-page', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('should match baseline screenshot for sign up form', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.navigate();
    
    // Switch to sign up tab
    const signUpTab = page.locator('[data-testid="sign-up-tab"]');
    if (await signUpTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await signUpTab.click();
      await page.waitForTimeout(1000);
      
      // Compare sign up form
      await compareScreenshot(page, 'signup-form', {
        fullPage: false,
        threshold: 0.2,
      });
    }
  });
});

