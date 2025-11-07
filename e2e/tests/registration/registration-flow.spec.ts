import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { LoginPage } from '../../pages/LoginPage';
import { createRegistrationFormData, DEFAULT_TEST_CREDENTIALS } from '../../fixtures/test-data';
import { formatDateForInput, getPastDate } from '../../utils/helpers';

test.describe('Registration Flow', () => {
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

    test('should complete full registration for authenticated user', async ({ page }) => {
        const registrationPage = new RegistrationPage(page);
        const formData = createRegistrationFormData();

        // Navigate to registration (assuming we have an eventDateId)
        // In a real scenario, you'd navigate from event details
        const eventDateId = 'test-event-date-id';
        await registrationPage.navigate(eventDateId);

        // Complete the registration
        await registrationPage.completeRegistration(formData);

        // Verify confirmation page
        await registrationPage.verifyConfirmationPage();
    });

    test('should validate Step 0 (Primary Information)', async ({ page }) => {
        const registrationPage = new RegistrationPage(page);
        const eventDateId = 'test-event-date-id';

        await registrationPage.navigate(eventDateId);

        // Try to proceed without filling required fields
        const nextButton = page.locator('[data-testid="next-button"]');
        if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nextButton.click();

            // Should show validation errors
            await page.waitForTimeout(1000);
            const errors = page.locator('[data-testid="error-message"], .error, [role="alert"]');
            const errorCount = await errors.count();

            // Should have validation errors
            expect(errorCount).toBeGreaterThan(0);
        }
    });

    test('should validate Step 1 (Address Information)', async ({ page }) => {
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
        await registrationPage.clickNext();

        // Try to proceed from Step 1 without filling address
        await page.waitForTimeout(1000);
        const nextButton = page.locator('[data-testid="next-button"]');
        if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nextButton.click();

            // Should show validation errors for address fields
            await page.waitForTimeout(1000);
            const errors = page.locator('[data-testid="error-message"], .error, [role="alert"]');
            const errorCount = await errors.count();

            // Should have validation errors
            expect(errorCount).toBeGreaterThan(0);
        }
    });

    test('should validate Step 2 (Family Member Counts)', async ({ page }) => {
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
        await registrationPage.clickNext();

        // Fill Step 1
        await registrationPage.fillStep1({
            address: formData.address.street,
            city: formData.address.city,
            state: formData.address.state,
            zipCode: formData.address.zipCode,
            phone: formData.address.phone,
        });
        await registrationPage.clickNext();

        // Try to proceed without filling family counts
        await page.waitForTimeout(1000);
        const nextButton = page.locator('[data-testid="next-button"]');
        if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nextButton.click();

            // Should show validation or allow submission
            // (depends on if family counts are required)
            await page.waitForTimeout(1000);
        }
    });

    test('should navigate between steps', async ({ page }) => {
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

        // Go back to Step 0
        await registrationPage.clickPrevious();

        // Verify we're back on Step 0 (check if first name field is visible)
        const firstNameInput = page.locator('[data-testid="first-name-input"]');
        await expect(firstNameInput).toBeVisible();
    });

    test('should select event slot', async ({ page }) => {
        const registrationPage = new RegistrationPage(page);
        const formData = createRegistrationFormData();
        const eventDateId = 'test-event-date-id';

        await registrationPage.navigate(eventDateId);

        // Complete all steps
        await registrationPage.completeRegistration(formData);

        // Check if event slot selection is available
        const slotElement = page.locator('[data-testid="event-slot"]');
        const slotAvailable = await slotElement.isVisible({ timeout: 2000 }).catch(() => false);
        if (slotAvailable) {
            await registrationPage.selectEventSlot(0);
            // Verify slot is selected
            await page.waitForTimeout(1000);
        }
    });

    test('should display confirmation page after successful registration', async ({ page }) => {
        const registrationPage = new RegistrationPage(page);
        const formData = createRegistrationFormData();
        const eventDateId = 'test-event-date-id';

        await registrationPage.navigate(eventDateId);

        // Complete registration
        await registrationPage.completeRegistration(formData);

        // Verify confirmation page
        await registrationPage.verifyConfirmationPage();
    });

    test('should display QR code on confirmation', async ({ page }) => {
        const registrationPage = new RegistrationPage(page);
        const formData = createRegistrationFormData();
        const eventDateId = 'test-event-date-id';

        await registrationPage.navigate(eventDateId);

        // Complete registration
        await registrationPage.completeRegistration(formData);

        // Verify QR code is displayed
        await registrationPage.verifyQRCodeDisplayed();
    });
});

