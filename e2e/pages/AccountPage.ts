import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { AccountSelectors } from '../utils/selectors';
import { TEST_URLS } from '../utils/constants';

/**
 * Account Page Object
 * 
 * Handles interactions with the account management page
 */
export class AccountPage extends BasePage {
    /**
     * Navigate to account page
     */
    async navigate(): Promise<void> {
        await this.page.goto(TEST_URLS.ACCOUNT);
        await this.waitForLoad();
    }

    /**
     * Get account information
     */
    async getAccountInfo(): Promise<{
        email: string | null;
        name: string | null;
    }> {
        const email = await this.getText(AccountSelectors.emailDisplay);
        const name = await this.getText(AccountSelectors.nameDisplay);

        return { email, name };
    }

    /**
     * Click edit button
     */
    async clickEdit(): Promise<void> {
        await this.click(AccountSelectors.editButton);
        await this.waitForLoad();
    }

    /**
     * Update account information
     */
    async updateAccountInfo(updates: { name?: string; email?: string }): Promise<void> {
        await this.clickEdit();

        if (updates.name) {
            const nameInput = this.locator('[data-testid="name-input"]');
            if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                await nameInput.fill(updates.name);
            }
        }

        if (updates.email) {
            const emailInput = this.locator('[data-testid="email-input"]');
            if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                await emailInput.fill(updates.email);
            }
        }

        const saveButton = this.locator('[data-testid="save-button"], button:has-text("Save")').first();
        await saveButton.click();
        await this.waitForLoad();
    }

    /**
     * Logout
     */
    async logout(): Promise<void> {
        await this.click(AccountSelectors.logoutButton);
        await this.waitForLoad();
    }

    /**
     * Verify account information is displayed
     */
    async verifyAccountInfoDisplayed(): Promise<void> {
        await expect(this.locator(AccountSelectors.accountInfo)).toBeVisible();
    }

    /**
     * Verify edit options are available
     */
    async verifyEditOptionsAvailable(): Promise<void> {
        await expect(this.locator(AccountSelectors.editButton)).toBeVisible();
    }

    /**
     * Verify changes are reflected
     */
    async verifyChangesReflected(expectedName?: string): Promise<void> {
        const info = await this.getAccountInfo();
        if (expectedName) {
            expect(info.name).toContain(expectedName);
        }
    }
}

