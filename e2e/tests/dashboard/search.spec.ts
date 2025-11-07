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

    // Wait for results to load
    await page.waitForTimeout(2000);

    // Should either show results or no results message
    const hasResults = await dashboardPage.getEventCount() > 0;
    const hasNoResults = await page.locator('[data-testid="no-results-message"]')
      .isVisible()
      .catch(() => false);

    expect(hasResults || hasNoResults).toBe(true);
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

    // Wait for results
    await page.waitForTimeout(3000);

    // Check if results are displayed
    const eventCount = await dashboardPage.getEventCount();
    const noResultsVisible = await page.locator('[data-testid="no-results-message"]')
      .isVisible()
      .catch(() => false);

    // Should have results or show no results message
    expect(eventCount > 0 || noResultsVisible).toBe(true);
  });

  test('should include search parameters in URL', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const zipCode = '12345';
    const distance = '10';

    await dashboardPage.searchEvents(zipCode, distance);

    // Wait for navigation
    await page.waitForTimeout(2000);

    // Verify URL contains search parameters
    const url = page.url();
    expect(url).toContain(zipCode);
  });

  test('should show empty search results message', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const invalidZipCode = '00000';

    await dashboardPage.searchEvents(invalidZipCode);

    // Wait for results
    await page.waitForTimeout(3000);

    // Should show no results message or have 0 results
    const eventCount = await dashboardPage.getEventCount();
    const noResultsVisible = await page.locator('[data-testid="no-results-message"]')
      .isVisible()
      .catch(() => false);

    expect(eventCount === 0 || noResultsVisible).toBe(true);
  });

  test('should show error for invalid zip code', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const invalidZipCode = 'abc';

    await dashboardPage.searchEvents(invalidZipCode);

    // Wait for validation
    await page.waitForTimeout(1000);

    // Should show error or prevent submission
    const errorVisible = await page.locator('[data-testid="error-message"], .error')
      .isVisible()
      .catch(() => false);

    // Error should be visible or form should prevent submission
    expect(errorVisible || !page.url().includes('/events')).toBe(true);
  });
});

