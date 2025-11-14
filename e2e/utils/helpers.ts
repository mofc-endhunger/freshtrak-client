import { Page, expect } from '@playwright/test';
import { TIMEOUTS, TEST_URLS } from './constants';

/**
 * Test Helper Utilities
 * 
 * Common helper functions for E2E tests
 */

/**
 * Wait for element to be visible
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = TIMEOUTS.MEDIUM
): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Wait for element to be hidden
 */
export async function waitForElementHidden(
  page: Page,
  selector: string,
  timeout: number = TIMEOUTS.MEDIUM
): Promise<void> {
  await page.waitForSelector(selector, { state: 'hidden', timeout });
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for loading spinner to disappear
 */
export async function waitForLoadingToComplete(page: Page): Promise<void> {
  const loadingSelector = '[data-testid="loading-spinner"]';
  try {
    await page.waitForSelector(loadingSelector, { state: 'hidden', timeout: TIMEOUTS.SHORT });
  } catch {
    // Loading spinner might not be present, which is fine
  }
}

/**
 * Fill form field with retry logic
 */
export async function fillField(
  page: Page,
  selector: string,
  value: string,
  options?: { clear?: boolean; timeout?: number }
): Promise<void> {
  const { clear = true, timeout = TIMEOUTS.MEDIUM } = options || {};
  await page.waitForSelector(selector, { state: 'visible', timeout });
  if (clear) {
    await page.fill(selector, '');
  }
  await page.fill(selector, value);
}

/**
 * Click element with retry logic
 */
export async function clickElement(
  page: Page,
  selector: string,
  options?: { timeout?: number; force?: boolean }
): Promise<void> {
  const { timeout = TIMEOUTS.MEDIUM, force = false } = options || {};
  await page.waitForSelector(selector, { state: 'visible', timeout });
  if (force) {
    await page.click(selector, { force: true });
  } else {
    await page.click(selector);
  }
}

/**
 * Verify element is visible
 */
export async function verifyElementVisible(
  page: Page,
  selector: string,
  timeout: number = TIMEOUTS.MEDIUM
): Promise<void> {
  await expect(page.locator(selector)).toBeVisible({ timeout });
}

/**
 * Verify element is hidden
 */
export async function verifyElementHidden(
  page: Page,
  selector: string,
  timeout: number = TIMEOUTS.MEDIUM
): Promise<void> {
  await expect(page.locator(selector)).toBeHidden({ timeout });
}

/**
 * Verify element contains text
 */
export async function verifyElementText(
  page: Page,
  selector: string,
  expectedText: string | RegExp,
  timeout: number = TIMEOUTS.MEDIUM
): Promise<void> {
  await expect(page.locator(selector)).toContainText(expectedText, { timeout });
}

/**
 * Get element text content
 */
export async function getElementText(
  page: Page,
  selector: string,
  timeout: number = TIMEOUTS.MEDIUM
): Promise<string | null> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
  return await page.locator(selector).textContent();
}

/**
 * Check if element exists
 */
export async function elementExists(
  page: Page,
  selector: string,
  timeout: number = TIMEOUTS.SHORT
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { state: 'attached', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for API response
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = TIMEOUTS.LONG
): Promise<void> {
  await page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Generate random email for testing
 */
export function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}@example.com`;
}

/**
 * Generate random phone number for testing
 */
export function generateTestPhone(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `${areaCode}${exchange}${number}`;
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date in the past (for testing)
 */
export function getPastDate(yearsAgo: number = 25): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - yearsAgo);
  return date;
}

/**
 * Get the base URL for tests
 * Uses environment variable or defaults to localhost
 */
export function getBaseUrl(): string {
  return TEST_URLS.BASE_URL;
}

/**
 * Get full URL for a path
 */
export function getUrl(path: string): string {
  const baseUrl = getBaseUrl();
  // Remove trailing slash from base URL if present
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBaseUrl}${cleanPath}`;
}

/**
 * Create a regex pattern for URL matching that works with any base URL
 */
export function createUrlPattern(path: string): RegExp {
  const baseUrl = getBaseUrl();
  // Escape special regex characters in base URL
  const escapedBaseUrl = baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Remove trailing slash from base URL pattern
  const cleanBaseUrl = escapedBaseUrl.replace(/\/$/, '');
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Create pattern that matches the full URL
  return new RegExp(`^${cleanBaseUrl}${cleanPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
}

/**
 * Get a valid eventDateId by following the actual user flow:
 * Dashboard -> Search zip code -> Filter for reservations -> Click event -> Extract ID
 * @param page - Playwright page object (should be authenticated)
 * @param zipCode - Zip code to search (default: '43123')
 * @returns eventDateId or null if not found
 */
export async function getValidEventDateId(page: any, zipCode: string = '43123'): Promise<string | null> {
  try {
    // Step 1: Navigate to dashboard
    await page.goto(getUrl('/'), { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Step 2: Search for events by zip code
    const zipCodeInput = page.locator('#zip_code');
    await zipCodeInput.waitFor({ state: 'visible', timeout: 10000 });
    await zipCodeInput.fill(zipCode);

    // Wait for auto-submit or click search button
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });

    // Check if we're on events page, if not try clicking search button
    let currentUrl = page.url();
    if (!currentUrl.includes('/events/list')) {
      const searchButton = page.locator('button[type="submit"], button:has-text(/search/i)').first();
      const isVisible = await searchButton.isVisible({ timeout: 2000 }).catch(() => false);
      if (isVisible) {
        await searchButton.click();
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        currentUrl = page.url();
      }
    }

    // Step 3: Try to find events with reservations filter, but if none found, use all events
    // First, try with reservations filter
    let reservationSwitch = page.locator('#reservations').first();
    let switchVisible = await reservationSwitch.isVisible({ timeout: 5000 }).catch(() => false);

    if (switchVisible) {
      const isChecked = await reservationSwitch.isChecked().catch(() => false);
      if (!isChecked) {
        await reservationSwitch.click();
        // Wait for events to reload after filter
        await page.waitForLoadState('networkidle', { timeout: 10000 });
      }
    } else {
      // If switch not visible, try adding filter via URL
      currentUrl = page.url();
      if (!currentUrl.includes('reservations=true')) {
        const urlWithFilter = currentUrl.includes('?')
          ? `${currentUrl}&reservations=true`
          : `${currentUrl}?reservations=true`;
        await page.goto(urlWithFilter, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        currentUrl = page.url();
      }
    }

    // Step 4: Wait for events to load and find "Reserve Time" button using data-testid
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });

    // Look for Reserve Time button using data-testid
    const reserveTimeButton = page.locator('[data-testid="reserve-time-button"]').first();
    const rsvpButton = page.locator('[data-testid="rsvp-button"]').first();

    // Wait for buttons to be available
    const hasReserveButton = await reserveTimeButton.isVisible({ timeout: 5000 }).catch(() => false);
    const hasRsvpButton = await rsvpButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasReserveButton) {
      await reserveTimeButton.click();
    } else if (hasRsvpButton) {
      await rsvpButton.click();
    } else {
      // No Reserve Time or RSVP button found - try without reservations filter
      currentUrl = page.url();
      const urlWithoutFilter = currentUrl.split('?')[0];
      await page.goto(urlWithoutFilter, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 10000 });

      // Try again without filter
      const reserveTimeButtonNoFilter = page.locator('[data-testid="reserve-time-button"]').first();
      const rsvpButtonNoFilter = page.locator('[data-testid="rsvp-button"]').first();

      const hasReserveButtonNoFilter = await reserveTimeButtonNoFilter.isVisible({ timeout: 5000 }).catch(() => false);
      const hasRsvpButtonNoFilter = await rsvpButtonNoFilter.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasReserveButtonNoFilter) {
        await reserveTimeButtonNoFilter.click();
      } else if (hasRsvpButtonNoFilter) {
        await rsvpButtonNoFilter.click();
      } else {
        return null; // No events with registration available
      }
    }

    // Step 5: Wait for navigation and extract eventDateId
    // The button might navigate to event details page (/register/event/{id}) or directly to form (/register/form/{id})
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });

    currentUrl = page.url();
    console.log(`[getValidEventDateId] Step 5: Current URL after click: ${currentUrl}`);

    // Check if we're on event details page
    if (currentUrl.includes('/register/event/')) {
      const eventIdMatch = currentUrl.match(/\/register\/event\/([^\/\?]+)/);
      if (eventIdMatch) {
        console.log(`[getValidEventDateId] Found eventDateId from event details: ${eventIdMatch[1]}`);
        return eventIdMatch[1];
      }
    }

    // Check if we're on registration form page (button might navigate directly to form)
    if (currentUrl.includes('/register/form/')) {
      const eventIdMatch = currentUrl.match(/\/register\/form\/([^\/\?]+)/);
      if (eventIdMatch) {
        console.log(`[getValidEventDateId] Found eventDateId from registration form: ${eventIdMatch[1]}`);
        return eventIdMatch[1];
      }
    }

    // Wait for navigation if not already there
    try {
      await page.waitForURL(/\/register\/(event|form)\//, { timeout: 15000 });
      currentUrl = page.url();
      console.log(`[getValidEventDateId] Step 5: Navigated to: ${currentUrl}`);

      // Try event details first
      let eventIdMatch = currentUrl.match(/\/register\/event\/([^\/\?]+)/);
      if (eventIdMatch) {
        console.log(`[getValidEventDateId] Found eventDateId: ${eventIdMatch[1]}`);
        return eventIdMatch[1];
      }

      // Try registration form
      eventIdMatch = currentUrl.match(/\/register\/form\/([^\/\?]+)/);
      if (eventIdMatch) {
        console.log(`[getValidEventDateId] Found eventDateId: ${eventIdMatch[1]}`);
        return eventIdMatch[1];
      }
    } catch (error) {
      // If navigation didn't happen, check current URL anyway
      currentUrl = page.url();
      let eventIdMatch = currentUrl.match(/\/register\/event\/([^\/\?]+)/);
      if (eventIdMatch) {
        console.log(`[getValidEventDateId] Found eventDateId: ${eventIdMatch[1]}`);
        return eventIdMatch[1];
      }

      eventIdMatch = currentUrl.match(/\/register\/form\/([^\/\?]+)/);
      if (eventIdMatch) {
        console.log(`[getValidEventDateId] Found eventDateId: ${eventIdMatch[1]}`);
        return eventIdMatch[1];
      }
    }

    console.log(`[getValidEventDateId] No eventDateId found, returning null`);
    return null;
  } catch (error) {
    return null;
  }
}

