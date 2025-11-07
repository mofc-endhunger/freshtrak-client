import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { DashboardSelectors } from '../utils/selectors';
import { TEST_URLS } from '../utils/constants';

/**
 * Dashboard Page Object
 * 
 * Handles interactions with the dashboard/search page
 */
export class DashboardPage extends BasePage {

    /**
     * Navigate to dashboard
     */
    async navigate(): Promise<void> {
        await this.page.goto(TEST_URLS.DASHBOARD);
        await this.waitForLoad();
    }

    /**
     * Search for events by zip code and distance
     */
    async searchEvents(zipCode: string, distance: string = '10'): Promise<void> {
        await this.fill(DashboardSelectors.zipCodeInput, zipCode);

        // Handle distance select - try both select and input
        const distanceSelect = this.locator(DashboardSelectors.distanceSelect);
        if (await distanceSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
            await this.page.selectOption(DashboardSelectors.distanceSelect, distance);
        } else {
            // If it's an input field instead
            const distanceInput = this.locator('[data-testid="distance-input"]');
            if (await distanceInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                await distanceInput.fill(distance);
            }
        }

        await this.click(DashboardSelectors.searchButton);
        await this.waitForLoad();
    }

    /**
     * Get count of event cards displayed
     */
    async getEventCount(): Promise<number> {
        return await this.locator(DashboardSelectors.eventCard).count();
    }

    /**
     * Click on first event card
     */
    async clickFirstEventCard(): Promise<void> {
        const firstCard = this.locator(DashboardSelectors.eventCard).first();
        await firstCard.click();
        await this.waitForLoad();
    }

    /**
     * Verify search results are displayed
     */
    async verifySearchResultsDisplayed(): Promise<void> {
        const eventCount = await this.getEventCount();
        expect(eventCount).toBeGreaterThan(0);
    }

    /**
     * Verify no results message is displayed
     */
    async verifyNoResultsMessage(): Promise<void> {
        await expect(this.locator(DashboardSelectors.noResultsMessage)).toBeVisible();
    }

    /**
     * Verify search parameters in URL
     */
    async verifySearchParametersInUrl(zipCode: string, distance?: string): Promise<void> {
        const url = this.getCurrentUrl();
        expect(url).toContain(zipCode);
        if (distance) {
            expect(url).toContain(distance);
        }
    }

    /**
     * Navigate to events page via link
     */
    async navigateToEvents(): Promise<void> {
        const eventsLink = this.locator('[data-testid="nav-events"], a[href*="/events"]').first();
        await eventsLink.click();
        await this.waitForLoad();
    }

    /**
     * Verify dashboard is loaded
     */
    async verifyDashboardLoaded(): Promise<void> {
        await expect(this.page).toHaveURL(new RegExp(TEST_URLS.DASHBOARD));
        // Verify search form is visible
        await expect(this.locator(DashboardSelectors.zipCodeInput)).toBeVisible();
    }
}

