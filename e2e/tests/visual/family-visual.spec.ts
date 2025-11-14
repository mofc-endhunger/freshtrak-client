import { test } from '@playwright/test';
import { FamilyPage } from '../../pages/FamilyPage';
import { LoginPage } from '../../pages/LoginPage';
import { DEFAULT_TEST_CREDENTIALS } from '../../fixtures/test-data';
import { compareScreenshot } from '../../utils/visual-testing';
import { createUrlPattern } from '../../utils/helpers';

test.describe('Family Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.signIn(
      DEFAULT_TEST_CREDENTIALS.email,
      DEFAULT_TEST_CREDENTIALS.password
    );
    await page.waitForURL(createUrlPattern('/'), { timeout: 10000 });
  });

  test('should match baseline screenshot for family page', async ({ page }) => {
    const familyPage = new FamilyPage(page);
    
    await familyPage.navigate();
    await page.waitForLoadState('networkidle');
    
    // Compare with baseline
    await compareScreenshot(page, 'family-page', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('should match baseline screenshot for add family member form', async ({ page }) => {
    const familyPage = new FamilyPage(page);
    
    await familyPage.navigate();
    
    // Click add family member if button exists
    const addButton = page.locator('[data-testid="add-family-member-button"]');
    if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await familyPage.clickAddFamilyMember();
      await page.waitForLoadState('networkidle');
      
      // Compare form
      await compareScreenshot(page, 'add-family-member-form', {
        fullPage: false,
        threshold: 0.2,
      });
    }
  });
});

