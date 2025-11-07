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
        // Ensure we're on the sign in tab
        const signInTab = this.locator(LoginSelectors.signInTab);
        if (await signInTab.isVisible({ timeout: 2000 }).catch(() => false)) {
            await this.click(LoginSelectors.signInTab);
        }

        await this.fill(LoginSelectors.emailInput, email);
        await this.fill(LoginSelectors.passwordInput, password);
        await this.click(LoginSelectors.signInButton);
        await this.waitForLoad();
    }

    /**
     * Sign up with email, password, and name
     */
    async signUp(email: string, password: string, name: string): Promise<void> {
        // Switch to sign up tab
        await this.click(LoginSelectors.signUpTab);

        // Fill sign up form (assuming the form has these fields)
        await this.fill(LoginSelectors.emailInput, email);
        await this.fill(LoginSelectors.passwordInput, password);

        // Note: Name field selector may need to be added to selectors.ts
        const nameInput = this.locator('[data-testid="name-input"]');
        if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nameInput.fill(name);
        }

        await this.click(LoginSelectors.signUpButton);
        await this.waitForLoad();
    }

    /**
     * Confirm sign up with confirmation code
     */
    async confirmSignUp(confirmationCode: string): Promise<void> {
        await this.fill(LoginSelectors.confirmationCodeInput, confirmationCode);
        await this.click(LoginSelectors.confirmButton);
        await this.waitForLoad();
    }

    /**
     * Continue as guest
     */
    async continueAsGuest(): Promise<void> {
        await this.click(LoginSelectors.guestButton);
        await this.waitForLoad();
    }

    /**
     * Verify error message is displayed
     */
    async verifyErrorMessage(expectedMessage?: string): Promise<void> {
        const errorSelector = '[data-testid="error-message"]';
        await expect(this.locator(errorSelector)).toBeVisible();

        if (expectedMessage) {
            await expect(this.locator(errorSelector)).toContainText(expectedMessage);
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

