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

        await this.fill(LoginSelectors.emailInput, email);
        await this.fill(LoginSelectors.passwordInput, password);
        
        // Use getByRole for submit button - find the submit button in the form
        const submitButton = this.page.locator('form').getByRole('button', { name: /sign in/i, exact: false });
        await submitButton.click();
        await this.waitForLoad();
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
        // Use Playwright's getByText for more reliable text matching
        const guestButton = this.page.getByRole('button', { name: /continue as guest/i });
        await guestButton.waitFor({ state: 'visible', timeout: 10000 });
        await guestButton.click();
        await this.waitForLoad();
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

