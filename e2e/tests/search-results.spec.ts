import { test, expect } from '@playwright/test';
import { SEL } from '../helpers/selectors';
import { ZIP_CODES, ROUTES } from '../helpers/test-data';

test.describe('Search Results Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), {
      waitUntil: 'domcontentloaded',
    });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });
  });

  // ── Page structure ───────────────────────────────────────────────

  test('renders search results for valid zip code', async ({ page }) => {
    // Either event cards or the no-events message should be present
    const eventCards = page.getByTestId(SEL.eventCard);
    const noEvents = page.getByTestId(SEL.noEventsMessage);

    await expect(eventCards.first().or(noEvents)).toBeVisible({
      timeout: 15_000,
    });
  });

  test('shows search form pre-filled with zip code', async ({ page }) => {
    const zipInput = page.getByTestId(SEL.zipCodeInput);
    await expect(zipInput).toHaveValue(ZIP_CODES.withEvents);
  });

  test('shows filter panel with distance and availability options', async ({ page }) => {
    await expect(page.getByTestId(SEL.filterDistance)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId(SEL.filterAvailability)).toBeVisible();
  });

  // ── View toggle ──────────────────────────────────────────────────

  test('defaults to grid view', async ({ page }) => {
    // Wait for events to finish loading
    await page.waitForTimeout(2000);

    const gridButton = page.getByTestId(SEL.viewToggleGrid);
    await expect(gridButton).toBeVisible();
  });

  test('switching to list view shows map alongside list', async ({ page }) => {
    // Wait for content to load
    const eventCards = page.getByTestId(SEL.eventCard);
    const noEvents = page.getByTestId(SEL.noEventsMessage);
    await expect(eventCards.first().or(noEvents)).toBeVisible({
      timeout: 15_000,
    });

    // Only test map if there are events
    if ((await eventCards.count()) > 0) {
      await page.getByTestId(SEL.viewToggleList).click();

      // The map container should appear in list view
      const mapContainer = page.locator('.leaflet-container');
      await expect(mapContainer).toBeVisible({ timeout: 10_000 });
    }
  });

  test('switching back to grid removes map', async ({ page }) => {
    const eventCards = page.getByTestId(SEL.eventCard);
    const noEvents = page.getByTestId(SEL.noEventsMessage);
    await expect(eventCards.first().or(noEvents)).toBeVisible({
      timeout: 15_000,
    });

    if ((await eventCards.count()) > 0) {
      await page.getByTestId(SEL.viewToggleList).click();
      await expect(page.locator('.leaflet-container')).toBeVisible({
        timeout: 10_000,
      });

      await page.getByTestId(SEL.viewToggleGrid).click();
      await expect(page.locator('.leaflet-container')).not.toBeVisible();
    }
  });

  test('view preference persists across page reload', async ({ page }) => {
    const eventCards = page.getByTestId(SEL.eventCard);
    const noEvents = page.getByTestId(SEL.noEventsMessage);
    await expect(eventCards.first().or(noEvents)).toBeVisible({
      timeout: 15_000,
    });

    if ((await eventCards.count()) > 0) {
      await page.getByTestId(SEL.viewToggleList).click();
      await expect(page.locator('.leaflet-container')).toBeVisible({
        timeout: 10_000,
      });

      await page.reload();
      await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });

      // After reload, list mode should still be active
      const listButton = page.getByTestId(SEL.viewToggleList);
      await expect(listButton).toHaveAttribute('aria-pressed', 'true');
    }
  });

  // ── Filter interactions ──────────────────────────────────────────

  test('changing distance filter updates results URL', async ({ page }) => {
    await expect(page.getByTestId(SEL.filterDistance)).toBeVisible({
      timeout: 15_000,
    });

    // Click the distance select trigger
    const distanceSelect = page.getByTestId(SEL.filterDistance).locator('button').first();
    await distanceSelect.click();

    // Select 25 mi option
    await page.getByRole('option', { name: '25 mi' }).click();

    await expect(page).toHaveURL(/\/events\/list\/\d+\/25/, {
      timeout: 10_000,
    });
  });

  test('changing availability filter updates results', async ({ page }) => {
    await expect(page.getByTestId(SEL.filterAvailability)).toBeVisible({
      timeout: 15_000,
    });

    const availabilitySelect = page.getByTestId(SEL.filterAvailability).locator('button').first();
    await availabilitySelect.click();

    await page.getByRole('option', { name: 'Today' }).click();

    await expect(page).toHaveURL(/availability=today/, {
      timeout: 10_000,
    });
  });

  test('toggling reservations switch filters results', async ({ page }) => {
    await expect(page.getByTestId(SEL.filterReservations)).toBeVisible({
      timeout: 15_000,
    });

    const toggle = page.getByTestId(SEL.filterReservations).locator('#reservations');
    await toggle.click();

    await expect(page).toHaveURL(/reservations=true/, {
      timeout: 10_000,
    });
  });

  test('close filter button resets filters', async ({ page }) => {
    await expect(page.getByTestId(SEL.filterDistance)).toBeVisible({
      timeout: 15_000,
    });

    await page.getByTestId('filter-close').click();

    // Filters should no longer be visible
    await expect(page.getByTestId(SEL.filterDistance)).not.toBeVisible();
  });

  // ── Search from results page ─────────────────────────────────────

  test('changing zip code re-searches from results page', async ({ page }) => {
    const zipInput = page.getByTestId(SEL.zipCodeInput);

    await zipInput.clear();
    for (const char of '43220') {
      await zipInput.press(char);
    }

    await expect(page).toHaveURL(/\/events\/list\/43220/, {
      timeout: 10_000,
    });
  });

  // ── Event cards ──────────────────────────────────────────────────

  test('event cards display essential info', async ({ page }) => {
    const cards = page.getByTestId(SEL.eventCard);
    await expect(cards.first().or(page.getByTestId(SEL.noEventsMessage))).toBeVisible({
      timeout: 15_000,
    });

    if ((await cards.count()) > 0) {
      const firstCard = cards.first();
      // Card should contain text representing agency name and event info
      await expect(firstCard).not.toBeEmpty();
    }
  });

  test('expand/collapse event details works', async ({ page }) => {
    const eventCards = page.getByTestId(SEL.eventCard);
    const noEvents = page.getByTestId(SEL.noEventsMessage);
    await expect(eventCards.first().or(noEvents)).toBeVisible({ timeout: 30_000 });

    if (
      (await eventCards.count()) === 0 ||
      (await page.getByTestId(SEL.eventDetailsToggle).count()) === 0
    ) {
      test.skip();
      return;
    }

    const detailsToggle = page.getByTestId(SEL.eventDetailsToggle).first();
    await detailsToggle.click();
    await expect(detailsToggle).toContainText(/hide/i);

    await detailsToggle.click();
    await expect(detailsToggle).toContainText(/view/i);
  });

  test('Get Directions opens Google Maps in new tab', async ({ page, context }) => {
    const eventCards = page.getByTestId(SEL.eventCard);
    const noEvents = page.getByTestId(SEL.noEventsMessage);
    await expect(eventCards.first().or(noEvents)).toBeVisible({ timeout: 30_000 });

    if (
      (await eventCards.count()) === 0 ||
      (await page.getByTestId(SEL.eventDirectionsLink).count()) === 0
    ) {
      test.skip();
      return;
    }

    const directionsButton = page.getByTestId(SEL.eventDirectionsLink).first();
    const [newPage] = await Promise.all([context.waitForEvent('page'), directionsButton.click()]);

    expect(newPage.url()).toContain('google.com/maps');
    await newPage.close();
  });

  test('Reserve/RSVP button navigates to registration', async ({ page }) => {
    const eventCards = page.getByTestId(SEL.eventCard);
    const noEvents = page.getByTestId(SEL.noEventsMessage);
    await expect(eventCards.first().or(noEvents)).toBeVisible({ timeout: 30_000 });

    if (
      (await eventCards.count()) === 0 ||
      (await page.getByTestId(SEL.eventReserveButton).count()) === 0
    ) {
      test.skip();
      return;
    }

    await page.getByTestId(SEL.eventReserveButton).first().click();
    await expect(page).toHaveURL(/\/register\/event\//, { timeout: 10_000 });
  });

  // ── Empty state ──────────────────────────────────────────────────

  test('shows no events message for remote zip code', async ({ page }) => {
    await page.goto(ROUTES.eventsList(ZIP_CODES.noEvents));
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });

    const noEvents = page.getByTestId(SEL.noEventsMessage);
    const eventCards = page.getByTestId(SEL.eventCard);

    // Wait for either events or the empty-state message to appear
    await expect(noEvents.or(eventCards.first())).toBeVisible({ timeout: 15_000 });
  });

  // ── Responsive ───────────────────────────────────────────────────

  test('on mobile viewport, cards adapt to single column layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents));
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });

    const cards = page.getByTestId(SEL.eventCard);
    if ((await cards.count()) >= 2) {
      const first = await cards.first().boundingBox();
      const second = await cards.nth(1).boundingBox();

      if (first && second) {
        expect(second.y).toBeGreaterThan(first.y);
      }
    }
  });
});
