import { test } from '@playwright/test';
import { DashboardPage } from '../../pages/DashboardPage';
import { compareScreenshot } from '../../utils/visual-testing';

test.describe('Dashboard Visual Tests', () => {
  test('should match baseline screenshot for dashboard', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    
    await dashboardPage.navigate();
    await page.waitForLoadState('networkidle');
    
    // Compare with baseline
    await compareScreenshot(page, 'dashboard', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('should match baseline screenshot for dashboard search form', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    
    await dashboardPage.navigate();
    await page.waitForLoadState('networkidle');
    
    // Focus on search form area
    const searchForm = page.locator('[data-testid="search-form"], form').first();
    
    await test.expect(searchForm).toHaveScreenshot('dashboard-search-form.png', {
      threshold: 0.2,
    });
  });
});

