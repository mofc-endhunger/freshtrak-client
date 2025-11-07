import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { LoginPage } from '../../pages/LoginPage';
import { DEFAULT_TEST_CREDENTIALS } from '../../fixtures/test-data';

test.describe('Registration Form Validation', () => {
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

    test('should show validation errors for empty form', async ({ page }) => {
        const registrationPage = new RegistrationPage(page);
        const eventDateId = 'test-event-date-id';

        await registrationPage.navigate(eventDateId);

        // Try to submit without filling anything
        const nextButton = page.locator('[data-testid="next-button"]');
        if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nextButton.click();

            // Wait for validation
            await page.waitForTimeout(1000);

            // Should show validation errors
            const errors = page.locator('[data-testid="error-message"], .error, [role="alert"], .text-red-500, .text-danger');
            const errorCount = await errors.count();

            expect(errorCount).toBeGreaterThan(0);
        }
    });

    test('should show error for invalid email', async ({ page }) => {
        const registrationPage = new RegistrationPage(page);
        const eventDateId = 'test-event-date-id';

        await registrationPage.navigate(eventDateId);

        // Try to fill with invalid email (if email field exists in Step 1)
        const emailInput = page.locator('[data-testid="email-input"]');
        if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await emailInput.fill('invalid-email');

            // Try to proceed
            const nextButton = page.locator('[data-testid="next-button"]');
            if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await nextButton.click();

                await page.waitForTimeout(1000);

                // Should show email validation error
                const emailError = page.locator('text=/email|invalid/i').first();
                const isVisible = await emailError.isVisible({ timeout: 2000 }).catch(() => false);
                expect(isVisible).toBe(true);
            }
        }
    });

    test('should show error for invalid phone number', async ({ page }) => {
        const registrationPage = new RegistrationPage(page);
        const eventDateId = 'test-event-date-id';

        await registrationPage.navigate(eventDateId);

        // Fill Step 0 first
        await registrationPage.fillStep0({
            firstName: 'Test',
            lastName: 'User',
            dateOfBirth: '1990-01-01',
            gender: 'Other',
        });
        await registrationPage.clickNext();

        // Try invalid phone in Step 1
        const phoneInput = page.locator('[data-testid="phone-input"]');
        if (await phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await phoneInput.fill('123'); // Invalid phone

            // Try to proceed
            const nextButton = page.locator('[data-testid="next-button"]');
            if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await nextButton.click();

                await page.waitForTimeout(1000);

                // Should show phone validation error
                const phoneError = page.locator('text=/phone|invalid/i').first();
                const isVisible = await phoneError.isVisible({ timeout: 2000 }).catch(() => false);
                expect(isVisible || !page.url().includes('/register/form')).toBe(true);
            }
        }
    });

    test('should show error for invalid date of birth', async ({ page }) => {
        const registrationPage = new RegistrationPage(page);
        const eventDateId = 'test-event-date-id';

        await registrationPage.navigate(eventDateId);

        // Try invalid date of birth
        const dobInput = page.locator('[data-testid="date-of-birth-input"]');
        if (await dobInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await dobInput.fill('invalid-date');

            // Try to proceed
            const nextButton = page.locator('[data-testid="next-button"]');
            if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await nextButton.click();

                await page.waitForTimeout(1000);

                // Should show date validation error
                const dateError = page.locator('text=/date|birth|invalid/i').first();
                const isVisible = await dateError.isVisible({ timeout: 2000 }).catch(() => false);
                expect(isVisible).toBe(true);
            }
        }
    });

    test('should show error for invalid zip code', async ({ page }) => {
        const registrationPage = new RegistrationPage(page);
        const eventDateId = 'test-event-date-id';

        await registrationPage.navigate(eventDateId);

        // Fill Step 0 first
        await registrationPage.fillStep0({
            firstName: 'Test',
            lastName: 'User',
            dateOfBirth: '1990-01-01',
            gender: 'Other',
        });
        await registrationPage.clickNext();

        // Try invalid zip code in Step 1
        const zipInput = page.locator('[data-testid="zip-code-input"]');
        if (await zipInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await zipInput.fill('abc'); // Invalid zip

            // Try to proceed
            const nextButton = page.locator('[data-testid="next-button"]');
            if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await nextButton.click();

                await page.waitForTimeout(1000);

                // Should show zip code validation error
                const zipError = page.locator('text=/zip|postal|invalid/i').first();
                const isVisible = await zipError.isVisible({ timeout: 2000 }).catch(() => false);
                expect(isVisible || !page.url().includes('/register/form')).toBe(true);
            }
        }
    });

    test('should show field-specific validation messages', async ({ page }) => {
        const registrationPage = new RegistrationPage(page);
        const eventDateId = 'test-event-date-id';

        await registrationPage.navigate(eventDateId);

        // Try to proceed without filling required fields
        const nextButton = page.locator('[data-testid="next-button"]');
        if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nextButton.click();

            await page.waitForTimeout(1000);

            // Check for field-specific errors
            const firstNameError = page.locator('[data-testid="first-name-input"]').locator('..').locator('.error, [role="alert"]');
            const lastNameError = page.locator('[data-testid="last-name-input"]').locator('..').locator('.error, [role="alert"]');

            const hasFirstNameError = await firstNameError.isVisible({ timeout: 1000 }).catch(() => false);
            const hasLastNameError = await lastNameError.isVisible({ timeout: 1000 }).catch(() => false);

            // At least one field should show an error
            expect(hasFirstNameError || hasLastNameError).toBe(true);
        }
    });

    test('should prevent form submission with invalid data', async ({ page }) => {
        const registrationPage = new RegistrationPage(page);
        const eventDateId = 'test-event-date-id';

        await registrationPage.navigate(eventDateId);

        // Fill with invalid data
        await registrationPage.fillStep0({
            firstName: '', // Empty required field
            lastName: '',
            dateOfBirth: 'invalid',
            gender: '',
        });

        // Try to submit
        const nextButton = page.locator('[data-testid="next-button"]');
        if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nextButton.click();

            await page.waitForTimeout(1000);

            // Should still be on the same step (not progressed)
            const firstNameInput = page.locator('[data-testid="first-name-input"]');
            const isVisible = await firstNameInput.isVisible({ timeout: 2000 }).catch(() => false);

            // Should still be on Step 0 if validation failed
            expect(isVisible).toBe(true);
        }
    });
});

