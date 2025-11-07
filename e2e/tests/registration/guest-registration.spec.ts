import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { LoginPage } from '../../pages/LoginPage';
import { createRegistrationFormData } from '../../fixtures/test-data';
import { formatDateForInput, getPastDate } from '../../utils/helpers';

test.describe('Guest Registration', () => {
    test.beforeEach(async ({ page }) => {
        // Continue as guest
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.continueAsGuest();
        await page.waitForURL(/^\/(?!login)/, { timeout: 10000 });
    });

    test('should complete registration as guest user', async ({ page }) => {
        const registrationPage = new RegistrationPage(page);
        const formData = createRegistrationFormData();
        const eventDateId = 'test-event-date-id';

        await registrationPage.navigate(eventDateId);

        // Complete registration
        await registrationPage.completeRegistration(formData);

        // Verify confirmation page
        await registrationPage.verifyConfirmationPage();
    });

    test('should maintain guest session during registration', async ({ page }) => {
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

        // Check that we're still in guest session (not redirected to login)
        const url = page.url();
        expect(url).not.toContain('/login');
    });

    test('should successfully complete guest registration', async ({ page }) => {
        const registrationPage = new RegistrationPage(page);
        const formData = createRegistrationFormData();
        const eventDateId = 'test-event-date-id';

        await registrationPage.navigate(eventDateId);

        // Complete full registration
        await registrationPage.completeRegistration(formData);

        // Verify success indicators
        await registrationPage.verifyConfirmationPage();
        await registrationPage.verifyQRCodeDisplayed();
    });
});

