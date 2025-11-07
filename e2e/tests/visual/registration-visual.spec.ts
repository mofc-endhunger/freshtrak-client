import { test } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { compareScreenshot } from '../../utils/visual-testing';

test.describe('Registration Page Visual Tests', () => {
  test('should match baseline screenshot for registration step 0', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    const eventDateId = 'test-event-date-id';
    
    await registrationPage.navigate(eventDateId);
    await page.waitForLoadState('networkidle');
    
    // Compare Step 0 (Primary Information)
    await compareScreenshot(page, 'registration-step-0', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('should match baseline screenshot for registration form', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    const eventDateId = 'test-event-date-id';
    
    await registrationPage.navigate(eventDateId);
    await page.waitForLoadState('networkidle');
    
    // Focus on form area
    const form = page.locator('form').first();
    
    await test.expect(form).toHaveScreenshot('registration-form.png', {
      threshold: 0.2,
    });
  });
});

