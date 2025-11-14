import { test } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { compareScreenshot } from '../../utils/visual-testing';
import { getValidEventDateId } from '../../utils/helpers';

test.describe('Registration Page Visual Tests', () => {
  test('should match baseline screenshot for registration step 0', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    
    // Get a valid eventDateId
    const eventDateId = await getValidEventDateId(page);
    if (!eventDateId) {
      test.skip();
    }
    
    const result = await registrationPage.navigateToRegistration(eventDateId!);
    if (result.status !== 'success') {
      test.skip();
    }
    
    await page.waitForLoadState('networkidle');
    
    // Compare Step 0 (Primary Information)
    await compareScreenshot(page, 'registration-step-0', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('should match baseline screenshot for registration form', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    
    // Get a valid eventDateId
    const eventDateId = await getValidEventDateId(page);
    if (!eventDateId) {
      test.skip();
    }
    
    const result = await registrationPage.navigateToRegistration(eventDateId!);
    if (result.status !== 'success') {
      test.skip();
    }
    
    await page.waitForLoadState('networkidle');
    
    // Focus on form area
    const form = page.locator('form').first();
    
    await test.expect(form).toHaveScreenshot('registration-form.png', {
      threshold: 0.2,
    });
  });
});

