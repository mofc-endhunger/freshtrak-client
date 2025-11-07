import { test, expect } from '@playwright/test';
import { EventsPage } from '../../pages/EventsPage';
import { EventDetailsPage } from '../../pages/EventDetailsPage';

test.describe('Event Details', () => {
    test('should view event details', async ({ page }) => {
        const eventsPage = new EventsPage(page);
        const eventDetailsPage = new EventDetailsPage(page);

        // Navigate to events
        await eventsPage.navigate('12345');
        await page.waitForTimeout(3000);

        const eventCount = await eventsPage.getEventCount();

        if (eventCount > 0) {
            // Click on first event
            await eventsPage.clickEventCard(0);

            // Wait for event details to load
            await page.waitForTimeout(2000);

            // Verify event details page is loaded
            await eventDetailsPage.verifyEventDetailsLoaded();
        } else {
            // Skip if no events available
            test.skip();
        }
    });

    test('should display all event information', async ({ page }) => {
        const eventsPage = new EventsPage(page);
        const eventDetailsPage = new EventDetailsPage(page);

        // Navigate to events
        await eventsPage.navigate('12345');
        await page.waitForTimeout(3000);

        const eventCount = await eventsPage.getEventCount();

        if (eventCount > 0) {
            await eventsPage.clickEventCard(0);
            await page.waitForTimeout(2000);

            // Verify event info is displayed
            await eventDetailsPage.verifyEventInfoDisplayed();
        } else {
            test.skip();
        }
    });

    test('should show registration button', async ({ page }) => {
        const eventsPage = new EventsPage(page);
        const eventDetailsPage = new EventDetailsPage(page);

        // Navigate to events
        await eventsPage.navigate('12345');
        await page.waitForTimeout(3000);

        const eventCount = await eventsPage.getEventCount();

        if (eventCount > 0) {
            await eventsPage.clickEventCard(0);
            await page.waitForTimeout(2000);

            // Verify registration button is visible
            await eventDetailsPage.verifyRegisterButtonVisible();
        } else {
            test.skip();
        }
    });

    test('should navigate to registration from event details', async ({ page }) => {
        const eventsPage = new EventsPage(page);
        const eventDetailsPage = new EventDetailsPage(page);

        // Navigate to events
        await eventsPage.navigate('12345');
        await page.waitForTimeout(3000);

        const eventCount = await eventsPage.getEventCount();

        if (eventCount > 0) {
            await eventsPage.clickEventCard(0);
            await page.waitForTimeout(2000);

            // Click register button
            await eventDetailsPage.clickRegister();

            // Wait for navigation
            await page.waitForTimeout(2000);

            // Should navigate to registration page
            const url = page.url();
            expect(url).toMatch(/\/register\/form/);
        } else {
            test.skip();
        }
    });
});

