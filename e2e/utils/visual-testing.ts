import { Page, expect } from '@playwright/test';
import { TIMEOUTS } from './constants';

/**
 * Visual Testing Utilities
 * 
 * Utilities for visual regression testing and screenshot comparison
 */

/**
 * Take screenshot and compare with baseline
 */
export async function takeScreenshot(
    page: Page,
    name: string,
    options?: {
        fullPage?: boolean;
        timeout?: number;
        mask?: Array<string>;
    }
): Promise<void> {
    const { fullPage = false, timeout = TIMEOUTS.MEDIUM, mask } = options || {};

    // Wait for page to be stable
    await page.waitForLoadState('networkidle', { timeout });

    // Take screenshot
    // Convert selector strings to locators for masking
    const maskLocators = mask ? mask.map(selector => page.locator(selector)) : undefined;

    await page.screenshot({
        path: `test-results/screenshots/${name}.png`,
        fullPage,
        mask: maskLocators,
    });
}

/**
 * Compare screenshot with baseline
 */
export async function compareScreenshot(
    page: Page,
    name: string,
    options?: {
        fullPage?: boolean;
        threshold?: number;
        timeout?: number;
    }
): Promise<void> {
    const { fullPage = false, threshold = 0.2, timeout = TIMEOUTS.MEDIUM } = options || {};

    // Wait for page to be stable
    await page.waitForLoadState('networkidle', { timeout });

    // Compare with baseline
    await expect(page).toHaveScreenshot(`${name}.png`, {
        fullPage,
        threshold,
        maxDiffPixels: 100,
    });
}

/**
 * Take screenshot of specific element
 */
export async function takeElementScreenshot(
    page: Page,
    selector: string,
    name: string,
    options?: {
        timeout?: number;
    }
): Promise<void> {
    const { timeout = TIMEOUTS.MEDIUM } = options || {};

    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });

    await element.screenshot({
        path: `test-results/screenshots/${name}.png`,
    });
}

/**
 * Compare element screenshot with baseline
 */
export async function compareElementScreenshot(
    page: Page,
    selector: string,
    name: string,
    options?: {
        threshold?: number;
        timeout?: number;
    }
): Promise<void> {
    const { threshold = 0.2, timeout = TIMEOUTS.MEDIUM } = options || {};

    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });

    await expect(element).toHaveScreenshot(`${name}.png`, {
        threshold,
        maxDiffPixels: 100,
    });
}

/**
 * Create baseline screenshot (first time setup)
 */
export async function createBaselineScreenshot(
    page: Page,
    name: string,
    options?: {
        fullPage?: boolean;
        timeout?: number;
    }
): Promise<void> {
    const { fullPage = false, timeout = TIMEOUTS.MEDIUM } = options || {};

    await page.waitForLoadState('networkidle', { timeout });

    await page.screenshot({
        path: `e2e/baseline-screenshots/${name}.png`,
        fullPage,
    });
}

/**
 * Mask dynamic content before screenshot
 * Returns array of selector strings for use with mask parameter
 */
export function createMaskSelectors(selectors: string[]): string[] {
    return selectors;
}

/**
 * Common dynamic content selectors to mask
 */
export const COMMON_MASKS = {
    timestamps: '[data-testid="timestamp"], .timestamp, time',
    dates: '[data-testid="date"], .date',
    userNames: '[data-testid="user-name"], .user-name',
    ids: '[data-testid*="id"], [id*="id"]',
    qrCodes: '[data-testid="qr-code"], .qr-code, canvas',
    avatars: '[data-testid="avatar"], .avatar, img[alt*="avatar"]',
} as const;

