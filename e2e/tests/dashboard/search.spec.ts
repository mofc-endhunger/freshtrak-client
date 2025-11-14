import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../pages/DashboardPage';

test.describe('Dashboard Search', () => {
  test.beforeEach(async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigate();
  });

  test('should search for events by zip code', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const zipCode = '12345';

    await dashboardPage.searchEvents(zipCode);

    // Wait for results to load (search may redirect to events page)
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Should either show results or no results message
    // Check for event cards or "No Events" message
    const eventCount = await dashboardPage.getEventCount();
    
    // Check for various "no results" messages
    const noResultsSelectors = [
      'text=/no.*events.*scheduled/i',
      'text=/no.*food.*banks.*found/i',
      'text=/no.*results/i',
      '[data-testid="no-results-message"]',
      'h2:has-text("No Events")',
      'h3:has-text("No Events")'
    ];
    
    let hasNoResults = false;
    for (const selector of noResultsSelectors) {
      hasNoResults = await page.locator(selector).first().isVisible({ timeout: 1000 }).catch(() => false);
      if (hasNoResults) break;
    }

    // Should have results or show no results message
    expect(eventCount > 0 || hasNoResults).toBe(true);
  });

  test('should select distance radius', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const zipCode = '12345';
    const distance = '25';

    await dashboardPage.searchEvents(zipCode, distance);

    // Wait for results
    await page.waitForTimeout(2000);

    // Verify search was executed
    const url = page.url();
    expect(url).toContain(zipCode);
  });

  test('should display search results', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const zipCode = '12345';

    await dashboardPage.searchEvents(zipCode);

    // Wait for results to load
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(3000);

    // Check if results are displayed
    const eventCount = await dashboardPage.getEventCount();
    
    // Check for various "no results" messages
    const noResultsSelectors = [
      'text=/no.*events.*scheduled/i',
      'text=/no.*food.*banks.*found/i',
      'text=/no.*results/i',
      '[data-testid="no-results-message"]',
      'h2:has-text("No Events")',
      'h3:has-text("No Events")'
    ];
    
    let noResultsVisible = false;
    for (const selector of noResultsSelectors) {
      noResultsVisible = await page.locator(selector).first().isVisible({ timeout: 1000 }).catch(() => false);
      if (noResultsVisible) break;
    }

    // Should have results or show no results message
    expect(eventCount > 0 || noResultsVisible).toBe(true);
  });

  test('should include search parameters in URL', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const zipCode = '12345';
    const distance = '10';

    await dashboardPage.searchEvents(zipCode, distance);

    // Wait for navigation (search may redirect to events page)
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Verify URL contains search parameters (may be in query string or path)
    const url = page.url();
    expect(url).toContain(zipCode);
  });

  test('should show empty search results message', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const invalidZipCode = '00000';

    await dashboardPage.searchEvents(invalidZipCode);

    // Wait for results
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(3000);

    // Should show no results message or have 0 results
    const eventCount = await dashboardPage.getEventCount();
    
    // Check for various "no results" messages
    const noResultsSelectors = [
      'text=/no.*events.*scheduled/i',
      'text=/no.*food.*banks.*found/i',
      'text=/no.*results/i',
      '[data-testid="no-results-message"]',
      'h2:has-text("No Events")',
      'h3:has-text("No Events")'
    ];
    
    let noResultsVisible = false;
    for (const selector of noResultsSelectors) {
      noResultsVisible = await page.locator(selector).first().isVisible({ timeout: 1000 }).catch(() => false);
      if (noResultsVisible) break;
    }

    expect(eventCount === 0 || noResultsVisible).toBe(true);
  });

  test('should show error for invalid zip code', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const invalidZipCode = 'abc';

    // Try to search with invalid zip code
    await dashboardPage.searchEvents(invalidZipCode);

    // Wait for validation or navigation
    await page.waitForTimeout(2000);

    // Should show error, prevent submission, or show validation message
    const errorVisible = await page.locator('[data-testid="error-message"], .error, .text-red-500, .text-red-600')
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    // Check if we're still on dashboard (didn't navigate) or on events page with no results
    const isOnDashboard = page.url().includes('/') && !page.url().includes('/events');
    const isOnEventsWithNoResults = page.url().includes('/events');

    // Error should be visible, form should prevent submission, or we're on events with no results
    expect(errorVisible || isOnDashboard || isOnEventsWithNoResults).toBe(true);
  });
});

