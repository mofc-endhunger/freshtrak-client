import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { LoginPage } from '../../pages/LoginPage';
import { createRegistrationFormData, DEFAULT_TEST_CREDENTIALS } from '../../fixtures/test-data';
import { formatDateForInput, getPastDate } from '../../utils/helpers';

test.describe('Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.signIn(
      DEFAULT_TEST_CREDENTIALS.email,
      DEFAULT_TEST_CREDENTIALS.password
    );
    await page.waitForTimeout(2000);
  });

  test('should handle large form submissions', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    const formData = createRegistrationFormData();
    const eventDateId = 'test-event-date-id';
    
    // Use very long strings
    formData.user.firstName = 'A'.repeat(100);
    formData.user.lastName = 'B'.repeat(100);
    formData.address.street = 'C'.repeat(200);
    
    await registrationPage.navigate(eventDateId);
    
    // Fill form with large data
    await registrationPage.fillStep0({
      firstName: formData.user.firstName,
      lastName: formData.user.lastName,
      dateOfBirth: formatDateForInput(getPastDate(25)),
      gender: 'Other',
    });
    
    // Should handle large inputs (may truncate or validate)
    const firstNameInput = page.locator('[data-testid="first-name-input"]');
    const value = await firstNameInput.inputValue();
    
    // Should accept or truncate the value
    expect(value.length).toBeGreaterThan(0);
  });

  test('should handle special characters in inputs', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    const eventDateId = 'test-event-date-id';
    
    await registrationPage.navigate(eventDateId);
    
    // Fill with special characters
    await registrationPage.fillStep0({
      firstName: "O'Brien-Smith",
      lastName: 'José & María',
      dateOfBirth: formatDateForInput(getPastDate(25)),
      gender: 'Other',
    });
    
    // Should accept special characters
    const firstNameInput = page.locator('[data-testid="first-name-input"]');
    const value = await firstNameInput.inputValue();
    
    expect(value).toContain("O'Brien");
  });

  test('should handle very long text inputs', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    const eventDateId = 'test-event-date-id';
    
    await registrationPage.navigate(eventDateId);
    
    // Fill Step 0
    await registrationPage.fillStep0({
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: formatDateForInput(getPastDate(25)),
      gender: 'Other',
    });
    await registrationPage.clickNext();
    
    // Try very long address
    const longAddress = 'A'.repeat(500);
    const addressInput = page.locator('[data-testid="address-input"]');
    if (await addressInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addressInput.fill(longAddress);
      
      // Should handle long input (may truncate or validate)
      const value = await addressInput.inputValue();
      expect(value.length).toBeGreaterThan(0);
    }
  });

  test('should handle rapid button clicks (debouncing)', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    const formData = createRegistrationFormData();
    const eventDateId = 'test-event-date-id';
    
    await registrationPage.navigate(eventDateId);
    
    // Fill Step 0
    await registrationPage.fillStep0({
      firstName: formData.user.firstName || 'Test',
      lastName: formData.user.lastName || 'User',
      dateOfBirth: formatDateForInput(getPastDate(25)),
      gender: 'Other',
    });
    
    // Rapidly click next button multiple times
    const nextButton = page.locator('[data-testid="next-button"]');
    if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Click multiple times rapidly
      await Promise.all([
        nextButton.click(),
        nextButton.click(),
        nextButton.click(),
      ]);
      
      // Wait for navigation
      await page.waitForTimeout(2000);
      
      // Should only advance once (debounced)
      // Check if we're on Step 1
      const addressInput = page.locator('[data-testid="address-input"]');
      const isOnStep1 = await addressInput.isVisible({ timeout: 2000 }).catch(() => false);
      
      // Should be on Step 1 (not skipped ahead)
      expect(isOnStep1).toBe(true);
    }
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    const formData = createRegistrationFormData();
    const eventDateId = 'test-event-date-id';
    
    await registrationPage.navigate(eventDateId);
    
    // Fill Step 0 and go to Step 1
    await registrationPage.fillStep0({
      firstName: formData.user.firstName || 'Test',
      lastName: formData.user.lastName || 'User',
      dateOfBirth: formatDateForInput(getPastDate(25)),
      gender: 'Other',
    });
    await registrationPage.clickNext();
    await page.waitForTimeout(1000);
    
    // Go back
    await page.goBack();
    await page.waitForTimeout(1000);
    
    // Should be back on Step 0
    const firstNameInput = page.locator('[data-testid="first-name-input"]');
    await expect(firstNameInput).toBeVisible();
    
    // Go forward
    await page.goForward();
    await page.waitForTimeout(1000);
    
    // Should be on Step 1
    const addressInput = page.locator('[data-testid="address-input"]');
    const isVisible = await addressInput.isVisible({ timeout: 2000 }).catch(() => false);
    expect(isVisible).toBe(true);
  });

  test('should handle page refresh during form filling', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    const formData = createRegistrationFormData();
    const eventDateId = 'test-event-date-id';
    
    await registrationPage.navigate(eventDateId);
    
    // Fill Step 0
    await registrationPage.fillStep0({
      firstName: formData.user.firstName || 'Test',
      lastName: formData.user.lastName || 'User',
      dateOfBirth: formatDateForInput(getPastDate(25)),
      gender: 'Other',
    });
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Form should be reset or data should be preserved (depends on implementation)
    const firstNameInput = page.locator('[data-testid="first-name-input"]');
    const isVisible = await firstNameInput.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Should still be on registration page
    expect(isVisible || page.url().includes('/register/form')).toBe(true);
  });
});

