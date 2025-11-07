import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Event Details Page Object
 * 
 * Handles interactions with the event details page
 */
export class EventDetailsPage extends BasePage {
    /**
     * Navigate to event details page
     */
    async navigate(eventId: string): Promise<void> {
        await this.page.goto(`/register/event/${eventId}`);
        await this.waitForLoad();
    }

    /**
     * Click register button
     */
    async clickRegister(): Promise<void> {
        const registerButton = this.locator('[data-testid="register-button"], button:has-text("Register")').first();
        await registerButton.click();
        await this.waitForLoad();
    }

    /**
     * Get event information
     */
    async getEventInfo(): Promise<{
        title: string | null;
        date: string | null;
        location: string | null;
        description: string | null;
    }> {
        const title = await this.getText('[data-testid="event-title"]');
        const date = await this.getText('[data-testid="event-date"]');
        const location = await this.getText('[data-testid="event-location"]');
        const description = await this.getText('[data-testid="event-description"]');

        return { title, date, location, description };
    }

    /**
     * Verify event details page is loaded
     */
    async verifyEventDetailsLoaded(): Promise<void> {
        const title = this.locator('[data-testid="event-title"]');
        await expect(title).toBeVisible();
    }

    /**
     * Verify all event information is displayed
     */
    async verifyEventInfoDisplayed(): Promise<void> {
        const info = await this.getEventInfo();
        expect(info.title).toBeTruthy();
        expect(info.date).toBeTruthy();
        expect(info.location).toBeTruthy();
    }

    /**
     * Verify registration button is visible
     */
    async verifyRegisterButtonVisible(): Promise<void> {
        const registerButton = this.locator('[data-testid="register-button"], button:has-text("Register")').first();
        await expect(registerButton).toBeVisible();
    }

    /**
     * Select event slot if available
     */
    async selectEventSlot(slotIndex: number = 0): Promise<void> {
        const slot = this.locator('[data-testid="event-slot"]').nth(slotIndex);
        await slot.click();
        await this.waitForLoad();
    }
}

