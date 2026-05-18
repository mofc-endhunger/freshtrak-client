import { test, expect } from '@playwright/test';
import { SEL } from '../helpers/selectors';
import { ZIP_CODES, ROUTES } from '../helpers/test-data';

test.describe('Event Details – Navigation Flow', () => {
  /**
   * Full user journey:
   *   1. Search for zip 43123
   *   2. Enable "Reservations Only" filter
   *   3. Click "Reserve Time" on the first eligible event card
   *   4. Verify the event details page URL and event identity
   *   5. Click Back and verify the search results URL (same zip + reservations=true)
   *   6. Verify the same event card appears in the restored results
   */
  test('navigates to event details page with correct URL and returns to filtered search results', async ({
    page,
  }) => {
    // ── Setup: go to search results for the test zip code ────────────
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), {
      waitUntil: 'domcontentloaded',
    });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });

    // ── Step 1: Enable "Reservations Only" toggle ─────────────────────
    await expect(page.getByTestId(SEL.filterReservations)).toBeVisible({
      timeout: 15_000,
    });
    await page.getByTestId(SEL.filterReservations).locator('#reservations').click();
    await expect(page).toHaveURL(/reservations=true/, { timeout: 10_000 });

    // ── Step 2: Wait for filtered results ────────────────────────────
    const eventCards = page.getByTestId(SEL.eventCard);
    const noEvents = page.getByTestId(SEL.noEventsMessage);
    await expect(eventCards.first().or(noEvents)).toBeVisible({ timeout: 15_000 });

    // Skip gracefully when no reservable events are available for this zip
    if (
      (await eventCards.count()) === 0 ||
      (await page.getByTestId(SEL.eventReserveButton).count()) === 0
    ) {
      test.skip();
      return;
    }

    // ── Step 3: Capture identity of the first card with a Reserve button ──
    const targetCard = page
      .getByTestId(SEL.eventCard)
      .filter({ has: page.getByTestId(SEL.eventReserveButton) })
      .first();

    const cardHeader = targetCard.locator('.bg-text-primary');
    const agencyName =
      (await cardHeader.locator('.text-lg.font-bold').first().textContent())?.trim() ?? '';
    const eventName =
      (await cardHeader.locator('.text-lg.font-bold').nth(1).textContent())?.trim() ?? '';

    // ── Step 4: Click "Reserve Time" ──────────────────────────────────
    await targetCard.getByTestId(SEL.eventReserveButton).click();

    // ── Assertions: Event Details page ───────────────────────────────

    // URL must be /register/event/:id (id is a numeric string per EventHandler.js)
    await expect(page).toHaveURL(/\/register\/event\/[^/]+/, { timeout: 10_000 });

    // Wait for the registration page to fully mount: the Back button is only
    // rendered inside RegistrationTextInfoComponent, which renders after the
    // lazy-loaded container resolves and the event API call completes.
    // This also ensures the old search-results DOM has been unmounted.
    await page.locator('.back-button').waitFor({ state: 'visible', timeout: 20_000 });

    // Scope the card lookup to the registration section to avoid any ambiguity
    // with other event-card elements that may briefly linger in the DOM.
    const detailsCard = page.locator('.register-confirmation').getByTestId(SEL.eventCard);
    await expect(detailsCard).toBeVisible({ timeout: 15_000 });
    if (agencyName) {
      await expect(detailsCard).toContainText(agencyName);
    }
    if (eventName) {
      await expect(detailsCard).toContainText(eventName);
    }

    // ── Step 5: Click Back ────────────────────────────────────────────
    await page.locator('.back-button').click();

    // ── Assertions: Restored Search Results page ──────────────────────

    // URL must return to search results for the same zip code
    await expect(page).toHaveURL(new RegExp(`/events/list/${ZIP_CODES.withEvents}`), {
      timeout: 10_000,
    });

    // Reservations filter must still be active in the URL
    await expect(page).toHaveURL(/reservations=true/, { timeout: 5_000 });

    // The results page must render event cards (or the empty state)
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });
    await expect(eventCards.first().or(noEvents)).toBeVisible({ timeout: 15_000 });

    // The event the user originally chose must still appear in the results
    if (agencyName) {
      await expect(
        page.getByTestId(SEL.eventCard).filter({ hasText: agencyName }).first(),
      ).toBeVisible({ timeout: 15_000 });
    }
  });
});
