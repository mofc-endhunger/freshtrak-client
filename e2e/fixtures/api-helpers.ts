import { Page } from '@playwright/test';

/**
 * API Mocking Helpers
 * 
 * Utilities for mocking API responses in E2E tests
 */

/**
 * Mock API response
 */
export async function mockAPIResponse(
  page: Page,
  url: string | RegExp,
  response: any,
  status: number = 200
): Promise<void> {
  await page.route(url, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Mock API error response
 */
export async function mockAPIError(
  page: Page,
  url: string | RegExp,
  status: number = 500,
  errorMessage?: string
): Promise<void> {
  await page.route(url, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({
        error: errorMessage || 'Internal Server Error',
      }),
    });
  });
}

/**
 * Wait for API call to complete
 */
export async function waitForAPICall(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 30000
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
 * Intercept and log API calls (for debugging)
 */
export async function logAPICalls(page: Page, urlPattern?: string | RegExp): Promise<void> {
  page.on('response', (response) => {
    const url = response.url();
    if (!urlPattern || (typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url))) {
      console.log(`API Call: ${response.status()} ${response.url()}`);
    }
  });
}

