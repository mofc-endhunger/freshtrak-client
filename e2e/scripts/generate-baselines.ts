import { chromium } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { EventsPage } from '../pages/EventsPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { FamilyPage } from '../pages/FamilyPage';
import { AccountPage } from '../pages/AccountPage';
import { DEFAULT_TEST_CREDENTIALS } from '../fixtures/test-data';
import { createBaselineScreenshot } from '../utils/visual-testing';

/**
 * Generate Baseline Screenshots
 * 
 * This script generates baseline screenshots for visual regression testing.
 * Run this when you want to update baseline screenshots after UI changes.
 * 
 * Usage: npx ts-node e2e/scripts/generate-baselines.ts
 */

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

async function generateBaselines() {
    console.log('Starting baseline screenshot generation...');
    console.log(`Base URL: ${BASE_URL}`);

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();

    try {
        // Dashboard
        console.log('Generating dashboard baseline...');
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.navigate();
        await page.waitForLoadState('networkidle');
        await createBaselineScreenshot(page, 'dashboard', { fullPage: true });
        console.log('✓ Dashboard baseline created');

        // Login Page
        console.log('Generating login page baseline...');
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await page.waitForLoadState('networkidle');
        await createBaselineScreenshot(page, 'login-page', { fullPage: true });
        console.log('✓ Login page baseline created');

        // Events Page
        console.log('Generating events page baseline...');
        const eventsPage = new EventsPage(page);
        await eventsPage.navigate('12345');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        await createBaselineScreenshot(page, 'events-list', { fullPage: true });
        console.log('✓ Events page baseline created');

        // Registration Page (requires authentication or guest)
        console.log('Generating registration page baseline...');
        // Note: This may require specific setup
        const registrationPage = new RegistrationPage(page);
        try {
            await registrationPage.navigate('test-event-date-id');
            await page.waitForLoadState('networkidle');
            await createBaselineScreenshot(page, 'registration-step-0', { fullPage: true });
            console.log('✓ Registration page baseline created');
        } catch (error) {
            console.warn('⚠ Registration page baseline skipped (may require setup)');
        }

        // Family Page (requires authentication)
        console.log('Generating family page baseline...');
        try {
            await loginPage.navigate();
            await loginPage.signIn(
                DEFAULT_TEST_CREDENTIALS.email,
                DEFAULT_TEST_CREDENTIALS.password
            );
            await page.waitForURL(/^\/(?!login)/, { timeout: 10000 });

            const familyPage = new FamilyPage(page);
            await familyPage.navigate();
            await page.waitForLoadState('networkidle');
            await createBaselineScreenshot(page, 'family-page', { fullPage: true });
            console.log('✓ Family page baseline created');
        } catch (error) {
            console.warn('⚠ Family page baseline skipped (authentication may be required)');
        }

        // Account Page (requires authentication)
        console.log('Generating account page baseline...');
        try {
            const accountPage = new AccountPage(page);
            await accountPage.navigate();
            await page.waitForLoadState('networkidle');
            await createBaselineScreenshot(page, 'account-page', { fullPage: true });
            console.log('✓ Account page baseline created');
        } catch (error) {
            console.warn('⚠ Account page baseline skipped (authentication may be required)');
        }

        console.log('\n✅ Baseline screenshot generation completed!');
        console.log('Baselines are stored in: e2e/baseline-screenshots/');

    } catch (error) {
        console.error('Error generating baselines:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run if executed directly
if (require.main === module) {
    generateBaselines().catch(console.error);
}

export { generateBaselines };

