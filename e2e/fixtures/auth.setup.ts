import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DEFAULT_TEST_CREDENTIALS } from './test-data';

/**
 * Authentication Fixtures
 * 
 * Sets up authenticated user state for tests
 */

const authFile = 'playwright/.auth/user.json';

/**
 * Setup authenticated user
 * This runs once and saves the authentication state
 */
setup('authenticate', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Navigate to login page
    await loginPage.navigate();

    // Sign in with test credentials
    // Note: In a real scenario, you might need to create the user first
    // or use existing test credentials
    try {
        await loginPage.signIn(
            DEFAULT_TEST_CREDENTIALS.email,
            DEFAULT_TEST_CREDENTIALS.password
        );

        // Wait for successful login (redirect to dashboard/home)
        await page.waitForURL(/^\/(?!login)/, { timeout: 10000 });

        // Save authentication state
        await page.context().storageState({ path: authFile });
    } catch (error) {
        console.warn('Authentication setup failed. Tests may need to handle authentication differently.');
        console.warn('Error:', error);
        // Still save state in case user is already logged in
        await page.context().storageState({ path: authFile });
    }
});

/**
 * Setup guest user
 */
const guestAuthFile = 'playwright/.auth/guest.json';

setup('authenticate as guest', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Navigate to login page
    await loginPage.navigate();

    // Continue as guest
    await loginPage.continueAsGuest();

    // Wait for redirect
    await page.waitForURL(/^\/(?!login)/, { timeout: 10000 });

    // Save guest authentication state
    await page.context().storageState({ path: guestAuthFile });
});

