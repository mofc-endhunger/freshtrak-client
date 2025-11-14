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
        // Fill zip code - using id attribute
        await this.fill(DashboardSelectors.zipCodeInput, zipCode);
        
        // Wait for form to process (SearchComponent auto-submits on 5-digit zip)
        await this.page.waitForTimeout(1000);

        // Handle distance select if visible (in FilterComponent)
        const distanceSelect = this.locator(DashboardSelectors.distanceSelect);
        if (await distanceSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
            await this.page.selectOption(DashboardSelectors.distanceSelect, distance);
        }

        // Click search button if still visible (may have auto-submitted)
        const searchButton = this.locator(DashboardSelectors.searchButton);
        if (await searchButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await searchButton.click();
        }
        
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
        // Wait for events to load
        await this.page.waitForLoadState('networkidle', { timeout: 10000 });
        const firstCard = this.locator(DashboardSelectors.eventCard).first();
        await firstCard.waitFor({ state: 'visible', timeout: 10000 });
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
        // Try to find events link - may not exist on all pages
        const eventsLink = this.locator('[data-testid="nav-events"], a[href*="/events"], nav a[href*="/events"]').first();
        const isVisible = await eventsLink.isVisible({ timeout: 3000 }).catch(() => false);
        
        if (isVisible) {
            await eventsLink.click();
            await this.waitForLoad();
        } else {
            // If no link found, navigate directly to events page
            await this.page.goto(TEST_URLS.EVENTS);
            await this.waitForLoad();
        }
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

