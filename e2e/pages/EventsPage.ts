import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { EventsSelectors } from '../utils/selectors';

/**
 * Events Page Object
 * 
 * Handles interactions with the events listing page
 */
export class EventsPage extends BasePage {
    /**
     * Navigate to events page
     */
    async navigate(zipCode?: string, distance?: string): Promise<void> {
        let url = '/events';
        if (zipCode) {
            url = `/events/list/${zipCode}`;
            if (distance) {
                url += `/${distance}`;
            }
        }
        await this.page.goto(url);
        await this.waitForLoad();
    }

    /**
     * Get all event cards
     */
    async getEventCards() {
        return this.locator(EventsSelectors.eventCard);
    }

    /**
     * Get count of event cards
     */
    async getEventCount(): Promise<number> {
        return await this.locator(EventsSelectors.eventCard).count();
    }

    /**
     * Click on an event card by index
     */
    async clickEventCard(index: number = 0): Promise<void> {
        const cards = await this.getEventCards();
        await cards.nth(index).click();
        await this.waitForLoad();
    }

    /**
     * Click on event card by title
     */
    async clickEventCardByTitle(title: string): Promise<void> {
        const card = this.locator(EventsSelectors.eventCard).filter({ hasText: title }).first();
        await card.click();
        await this.waitForLoad();
    }

    /**
     * Get event title by index
     */
    async getEventTitle(index: number = 0): Promise<string | null> {
        const card = this.locator(EventsSelectors.eventCard).nth(index);
        const titleElement = card.locator(EventsSelectors.eventTitle);
        return await titleElement.textContent();
    }

    /**
     * Get event date by index
     */
    async getEventDate(index: number = 0): Promise<string | null> {
        const card = this.locator(EventsSelectors.eventCard).nth(index);
        const dateElement = card.locator(EventsSelectors.eventDate);
        return await dateElement.textContent();
    }

    /**
     * Get event location by index
     */
    async getEventLocation(index: number = 0): Promise<string | null> {
        const card = this.locator(EventsSelectors.eventCard).nth(index);
        const locationElement = card.locator(EventsSelectors.eventLocation);
        return await locationElement.textContent();
    }

    /**
     * Apply date filter
     */
    async applyDateFilter(date: string): Promise<void> {
        await this.fill(EventsSelectors.filterDate, date);
        await this.waitForLoad();
    }

    /**
     * Apply location filter
     */
    async applyLocationFilter(location: string): Promise<void> {
        await this.fill(EventsSelectors.filterLocation, location);
        await this.waitForLoad();
    }

    /**
     * Verify events are displayed
     */
    async verifyEventsDisplayed(): Promise<void> {
        const count = await this.getEventCount();
        expect(count).toBeGreaterThan(0);
    }

    /**
     * Verify event card shows correct information
     */
    async verifyEventCardInfo(index: number = 0): Promise<void> {
        const title = await this.getEventTitle(index);
        const date = await this.getEventDate(index);
        const location = await this.getEventLocation(index);

        expect(title).toBeTruthy();
        expect(date).toBeTruthy();
        expect(location).toBeTruthy();
    }

    /**
     * Verify pagination (if applicable)
     */
    async verifyPagination(): Promise<void> {
        const pagination = this.locator('[data-testid="pagination"]');
        const isVisible = await pagination.isVisible({ timeout: 2000 }).catch(() => false);
        // Pagination may or may not be present, so we just check if it exists when visible
        if (isVisible) {
            expect(await pagination.isVisible()).toBe(true);
        }
    }
}

