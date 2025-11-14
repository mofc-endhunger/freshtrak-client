import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoginSelectors } from '../utils/selectors';
import { TEST_URLS } from '../utils/constants';

/**
 * Login Page Object
 * 
 * Handles interactions with the login/signup page
 */
export class LoginPage extends BasePage {
    /**
     * Navigate to login page
     */
    async navigate(): Promise<void> {
        await this.page.goto(TEST_URLS.LOGIN);
        await this.waitForLoad();
    }

    /**
     * Sign in with email and password
     */
    async signIn(email: string, password: string): Promise<void> {
        // Ensure we're on the sign in tab (if tabs are visible)
        const signInTab = this.page.getByRole('button', { name: /^sign in$/i }).first();
        if (await signInTab.isVisible({ timeout: 2000 }).catch(() => false)) {
            await signInTab.click();
            await this.page.waitForTimeout(300); // Wait for tab switch
        }

        // Wait for form inputs to be ready
        await this.page.waitForSelector(LoginSelectors.emailInput, { state: 'visible', timeout: 10000 });
        await this.fill(LoginSelectors.emailInput, email);
        await this.fill(LoginSelectors.passwordInput, password);
        
        // Try multiple selectors for submit button
        const submitButtonSelectors = [
            this.page.locator('form').getByRole('button', { name: /sign in/i, exact: false }),
            this.page.getByRole('button', { name: /sign in/i, exact: false }),
            this.page.locator('button[type="submit"]'),
            this.page.locator(LoginSelectors.signInButton),
        ];

        let clicked = false;
        for (const button of submitButtonSelectors) {
            try {
                const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);
                if (isVisible) {
                    await button.click();
                    clicked = true;
                    break;
                }
            } catch (error) {
                // Try next selector
                continue;
            }
        }

        if (!clicked) {
            throw new Error('Could not find sign in submit button');
        }

        // Wait for navigation or load state
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
            // If networkidle times out, just wait a bit
            return this.page.waitForTimeout(2000);
        });
    }

    /**
     * Sign up with email, password, and name
     */
    async signUp(email: string, password: string, name: string): Promise<void> {
        // Switch to sign up tab
        const signUpTab = this.page.getByRole('button', { name: /^sign up$/i }).first();
        await signUpTab.click();
        await this.page.waitForTimeout(500); // Wait for tab switch

        // Fill sign up form
        await this.fill(LoginSelectors.nameInput, name);
        await this.fill(LoginSelectors.emailInput, email);
        await this.fill(LoginSelectors.passwordInput, password);
        await this.fill(LoginSelectors.confirmPasswordInput, password);

        // Use getByRole for submit button
        const submitButton = this.page.getByRole('button', { name: /create account/i });
        await submitButton.click();
        await this.waitForLoad();
    }

    /**
     * Confirm sign up with confirmation code
     */
    async confirmSignUp(confirmationCode: string): Promise<void> {
        await this.fill(LoginSelectors.codeInput, confirmationCode);
        await this.click(LoginSelectors.confirmButton);
        await this.waitForLoad();
    }

    /**
     * Continue as guest
     */
    async continueAsGuest(): Promise<void> {
        // Wait for page to be ready
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(1000); // Small delay for dynamic content
        
        // Try multiple selectors for guest button - use text-based selectors first
        const guestButtonSelectors = [
            // Text-based selectors (most reliable)
            this.page.getByText(/continue as guest/i),
            this.page.getByRole('button', { name: /continue as guest/i }),
            this.page.locator('button:has-text("Continue as Guest")'),
            this.page.locator('button:has-text("continue as guest")'),
            // CSS selector-based
            this.page.locator(LoginSelectors.guestButton),
            this.page.locator('button').filter({ hasText: /continue.*guest/i }),
            // More generic selectors
            this.page.locator('button').filter({ hasText: /guest/i }),
            this.page.locator('a:has-text(/continue.*guest/i)'), // Sometimes it's a link
            this.page.locator('[role="button"]:has-text(/continue.*guest/i)'),
        ];

        let clicked = false;
        for (const button of guestButtonSelectors) {
            try {
                // Wait a bit for button to appear
                const isVisible = await button.isVisible({ timeout: 3000 }).catch(() => false);
                if (isVisible) {
                    // Scroll into view if needed (helps with WebKit/Safari)
                    await button.scrollIntoViewIfNeeded();
                    await this.page.waitForTimeout(500);
                    await button.click();
                    clicked = true;
                    break;
                }
            } catch (error) {
                // Try next selector
                continue;
            }
        }

        if (!clicked) {
            // Take a screenshot for debugging
            await this.page.screenshot({ path: 'test-results/guest-button-not-found.png' }).catch(() => {});
            throw new Error('Could not find "Continue as Guest" button');
        }

        // Wait for navigation or load state
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
            // If networkidle times out, just wait a bit
            return this.page.waitForTimeout(2000);
        });
    }

    /**
     * Verify error message is displayed
     */
    async verifyErrorMessage(expectedMessage?: string): Promise<void> {
        const errorSelector = LoginSelectors.errorMessage;
        await expect(this.locator(errorSelector).first()).toBeVisible();

        if (expectedMessage) {
            await expect(this.locator(errorSelector).first()).toContainText(expectedMessage);
        }
    }

    /**
     * Verify user is on login page
     */
    async verifyOnLoginPage(): Promise<void> {
        await expect(this.page).toHaveURL(new RegExp(TEST_URLS.LOGIN));
    }

    /**
     * Check if sign in form is visible
     */
    async isSignInFormVisible(): Promise<boolean> {
        return await this.isVisible(LoginSelectors.emailInput);
    }

    /**
     * Check if sign up form is visible
     */
    async isSignUpFormVisible(): Promise<boolean> {
        await this.click(LoginSelectors.signUpTab);
        return await this.isVisible(LoginSelectors.emailInput);
    }
}

