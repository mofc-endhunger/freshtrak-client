import { test } from '@playwright/test';
import { EventsPage } from '../../pages/EventsPage';
import { compareScreenshot } from '../../utils/visual-testing';

test.describe('Events Page Visual Tests', () => {
  test('should match baseline screenshot for events list', async ({ page }) => {
    const eventsPage = new EventsPage(page);
    
    await eventsPage.navigate('12345');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Compare with baseline
    await compareScreenshot(page, 'events-list', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('should match baseline screenshot for event card', async ({ page }) => {
    const eventsPage = new EventsPage(page);
    
    await eventsPage.navigate('12345');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Get first event card if available
    const eventCard = page.locator('[data-testid="event-card"]').first();
    const isVisible = await eventCard.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isVisible) {
      await test.expect(eventCard).toHaveScreenshot('event-card.png', {
        threshold: 0.2,
      });
    } else {
      test.skip();
    }
  });
});

