import { Page, expect } from '@playwright/test';
import { TIMEOUTS } from './constants';

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

