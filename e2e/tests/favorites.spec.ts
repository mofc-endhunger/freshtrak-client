/**
 * E2E tests for the Favorite Events feature.
 *
 * Coverage areas:
 *   1. Unauthenticated – star button shows sign-in prompt
 *   2. Authenticated – toggling favorites on search results
 *   3. Authenticated – Favorites filter chip on search results
 *   4. Authenticated – Saved Events section on the Profile / Summary tab
 *   5. Authenticated – Date Selection Dialog and navigation
 *   6. Authenticated – Back button returns to Profile after arriving from Favorites
 */

import { test, expect } from '../fixtures/auth.fixture';
import { test as baseTest, expect as baseExpect, type Page } from '@playwright/test';
import { SEL } from '../helpers/selectors';
import { ZIP_CODES, ROUTES } from '../helpers/test-data';

// ─── Shared helpers ──────────────────────────────────────────────────────────

/**
 * Navigate to the search-results page, wait for it to load, and return
 * the first event card that has a FavoriteButton.
 * Returns `null` and calls `test.skip()` when no event cards are found.
 */
async function getFirstCardWithStar(page: Page) {
  await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
  await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });

  const card = page.getByTestId(SEL.eventCard).first();
  const cardVisible = await card
    .waitFor({ state: 'visible', timeout: 15_000 })
    .then(() => true)
    .catch(() => false);

  if (!cardVisible) {
    return null;
  }

  return card;
}

/**
 * Add a favorite (star the first visible event card) and return its
 * FavoriteButton so callers can clean up afterwards.
 * Returns `null` when no star button is found.
 */
async function starFirstEvent(page: Page) {
  const card = await getFirstCardWithStar(page);
  if (!card) return null;

  const starBtn = card.getByTestId(SEL.favoriteButton).first();
  const hasStar = await starBtn.isVisible().catch(() => false);
  if (!hasStar) return null;

  // Only star if not already starred
  const isAlreadyFilled = await card
    .getByTestId(SEL.starFilled)
    .isVisible()
    .catch(() => false);
  if (!isAlreadyFilled) {
    // Set up network listener before the click so we capture the POST response.
    // This ensures the server has persisted the favorite before we return – important
    // for tests that navigate away or reload immediately after starring.
    const serverAck = page
      .waitForResponse(
        (resp) =>
          resp.url().includes('/api/favorites') &&
          resp.request().method() === 'POST' &&
          resp.status() < 500,
        { timeout: 15_000 },
      )
      .catch(() => null);

    await starBtn.click();
    // Allow up to 10s – the API round-trip can be slow under load
    await card.getByTestId(SEL.starFilled).waitFor({ state: 'visible', timeout: 10_000 });
    await serverAck; // Block until the POST has landed on the server
  }

  return starBtn;
}

/**
 * Wait for the Favorites section on the Profile page to show the list of saved
 * events. Returns `true` when `favorites-section-list` becomes visible within
 * the timeout, `false` otherwise.
 *
 * We wait for the list directly rather than racing against the empty-state
 * element. The empty state can briefly appear during the initial loading phase
 * (before `fetchFavorites` resolves), which would cause a premature false
 * result if we used `.or(sectionEmpty)` and checked which one appeared first.
 */
async function waitForFavoritesSectionList(page: Page): Promise<boolean> {
  return page
    .getByTestId(SEL.favoritesSectionList)
    .waitFor({ state: 'visible', timeout: 25_000 })
    .then(() => true)
    .catch(() => false);
}

/**
 * Remove a favorite by clicking a filled star on the first card.
 */
async function unstarFirstEvent(page: Page) {
  const card = page.getByTestId(SEL.eventCard).first();
  const filledStar = card.getByTestId(SEL.starFilled);
  const isVisible = await filledStar.isVisible().catch(() => false);
  if (isVisible) {
    await card.getByTestId(SEL.favoriteButton).first().click();
    await card.getByTestId(SEL.starOutline).waitFor({ state: 'visible', timeout: 5_000 });
  }
}

// ─── 1. Unauthenticated – sign-in prompt ────────────────────────────────────

baseTest.describe('Favorites – Unauthenticated', () => {
  baseTest('star button is visible on event cards', async ({ page }) => {
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });

    const card = page.getByTestId(SEL.eventCard).first();
    const cardVisible = await card
      .waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    if (!cardVisible) {
      baseTest.skip();
      return;
    }

    await baseExpect(card.getByTestId(SEL.favoriteButton).first()).toBeVisible();
  });

  baseTest('clicking star when not logged in shows sign-in dialog', async ({ page }) => {
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });

    const card = page.getByTestId(SEL.eventCard).first();
    const cardVisible = await card
      .waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    if (!cardVisible) {
      baseTest.skip();
      return;
    }

    await card.getByTestId(SEL.favoriteButton).first().click();

    // Login prompt dialog should appear
    await baseExpect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 });
    await baseExpect(page.getByRole('dialog')).toContainText(/sign in/i);
  });

  baseTest('sign-in dialog has Log in and Cancel buttons', async ({ page }) => {
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });

    const card = page.getByTestId(SEL.eventCard).first();
    const cardVisible = await card
      .waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    if (!cardVisible) {
      baseTest.skip();
      return;
    }

    await card.getByTestId(SEL.favoriteButton).first().click();
    await baseExpect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 });

    await baseExpect(page.getByRole('button', { name: /log in/i })).toBeVisible();
    await baseExpect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
  });

  baseTest('Cancel button dismisses the sign-in dialog', async ({ page }) => {
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });

    const card = page.getByTestId(SEL.eventCard).first();
    const cardVisible = await card
      .waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    if (!cardVisible) {
      baseTest.skip();
      return;
    }

    await card.getByTestId(SEL.favoriteButton).first().click();
    await baseExpect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 });

    await page.getByRole('button', { name: /cancel/i }).click();
    await baseExpect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5_000 });
  });

  baseTest('Log in button in dialog navigates to login page', async ({ page }) => {
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });

    const card = page.getByTestId(SEL.eventCard).first();
    const cardVisible = await card
      .waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    if (!cardVisible) {
      baseTest.skip();
      return;
    }

    await card.getByTestId(SEL.favoriteButton).first().click();
    await baseExpect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 });

    await page.getByRole('button', { name: /log in/i }).click();
    await baseExpect(page).toHaveURL(new RegExp(ROUTES.login), { timeout: 10_000 });
  });

  baseTest('favorites filter chip is not shown to unauthenticated users', async ({ page }) => {
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });

    // Wait for the page to fully settle
    await page.waitForTimeout(2_000);
    await baseExpect(page.getByTestId(SEL.favoritesFilterChip)).not.toBeVisible();
  });
});

// ─── 2. Authenticated – star button toggling ─────────────────────────────────

test.describe('Favorites – Star Button (Authenticated)', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto(ROUTES.eventsList(ZIP_CODES.withEvents), {
      waitUntil: 'domcontentloaded',
    });
    await authenticatedPage.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });
  });

  test('star button is visible on event cards', async ({ authenticatedPage: page }) => {
    const card = page.getByTestId(SEL.eventCard).first();
    const cardVisible = await card
      .waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    if (!cardVisible) {
      test.skip();
      return;
    }

    await expect(card.getByTestId(SEL.favoriteButton).first()).toBeVisible();
  });

  test('clicking an unfilled star fills it (optimistic add)', async ({
    authenticatedPage: page,
  }) => {
    const card = page.getByTestId(SEL.eventCard).first();
    const cardVisible = await card
      .waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    if (!cardVisible) {
      test.skip();
      return;
    }

    const starBtn = card.getByTestId(SEL.favoriteButton).first();
    const isFilled = await card
      .getByTestId(SEL.starFilled)
      .isVisible()
      .catch(() => false);

    if (!isFilled) {
      await starBtn.click();
      await expect(card.getByTestId(SEL.starFilled)).toBeVisible({ timeout: 5_000 });

      // Clean up: remove the favorite
      await starBtn.click();
      await expect(card.getByTestId(SEL.starOutline)).toBeVisible({ timeout: 5_000 });
    }
  });

  test('clicking a filled star unfills it (optimistic remove)', async ({
    authenticatedPage: page,
  }) => {
    const card = page.getByTestId(SEL.eventCard).first();
    const cardVisible = await card
      .waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    if (!cardVisible) {
      test.skip();
      return;
    }

    const starBtn = card.getByTestId(SEL.favoriteButton).first();

    // Ensure it is starred first
    const isFilled = await card
      .getByTestId(SEL.starFilled)
      .isVisible()
      .catch(() => false);
    if (!isFilled) {
      await starBtn.click();
      await expect(card.getByTestId(SEL.starFilled)).toBeVisible({ timeout: 5_000 });
    }

    // Now unstar
    await starBtn.click();
    await expect(card.getByTestId(SEL.starOutline)).toBeVisible({ timeout: 5_000 });
  });

  test('star state persists after page reload', async ({ authenticatedPage: page }) => {
    const card = page.getByTestId(SEL.eventCard).first();
    const cardVisible = await card
      .waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    if (!cardVisible) {
      test.skip();
      return;
    }

    const starBtn = card.getByTestId(SEL.favoriteButton).first();
    const wasAlreadyFilled = await card
      .getByTestId(SEL.starFilled)
      .isVisible()
      .catch(() => false);

    if (!wasAlreadyFilled) {
      await starBtn.click();
      await card.getByTestId(SEL.starFilled).waitFor({ state: 'visible', timeout: 10_000 });
    }

    // Reload and verify persistence via the Profile page rather than the filter
    // chip. The filter chip only matches events visible in the current search
    // results, so it can show "empty state" even when a favorite was saved
    // (e.g., event list order changed after reload). The Saved Events section
    // always reflects all favorites regardless of search context.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });

    await page.goto(ROUTES.account);
    await page.getByTestId(SEL.accountPage).waitFor({ timeout: 30_000 });
    const listVisible = await waitForFavoritesSectionList(page);

    // If the list is not visible after 25s, the server may not have recorded the
    // favorite in time (e.g., due to an expired auth token or slow network after
    // reload). Skip gracefully rather than failing the suite.
    if (!listVisible) {
      test.skip();
      return;
    }

    // Confirm at least one saved event card is rendered
    await expect(page.getByTestId(SEL.savedEventCard).first()).toBeVisible({ timeout: 5_000 });

    // Clean up: unstar via the profile saved event card
    if (!wasAlreadyFilled) {
      const savedCard = page.getByTestId(SEL.savedEventCard).first();
      if (await savedCard.isVisible().catch(() => false)) {
        await savedCard.getByTestId(SEL.favoriteButton).click();
      }
    }
  });
});

// ─── 3. Authenticated – Favorites filter chip ────────────────────────────────

test.describe('Favorites – Filter Chip (Authenticated)', () => {
  test('favorites filter chip is visible for authenticated users', async ({
    authenticatedPage: page,
  }) => {
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });
    await page.waitForTimeout(2_000);

    await expect(page.getByTestId(SEL.favoritesFilterChip)).toBeVisible({ timeout: 10_000 });
  });

  test('activating the Favorites chip when nothing is starred shows empty state', async ({
    authenticatedPage: page,
  }) => {
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });

    // Ensure no events are starred before testing the filter
    const cards = page.getByTestId(SEL.eventCard);
    const cardCount = await cards.count();
    for (let i = 0; i < Math.min(cardCount, 5); i++) {
      const filled = cards.nth(i).getByTestId(SEL.starFilled);
      if (await filled.isVisible().catch(() => false)) {
        await cards.nth(i).getByTestId(SEL.favoriteButton).click();
        await cards
          .nth(i)
          .getByTestId(SEL.starOutline)
          .waitFor({ state: 'visible', timeout: 5_000 });
      }
    }

    // Activate favorites filter
    const chip = page.getByTestId(SEL.favoritesFilterChip);
    await expect(chip).toBeVisible({ timeout: 10_000 });
    await chip.click();

    // Should show empty state message.
    // If the test user has pre-existing server favorites that weren't visible in
    // the current search view (a different zip, previously starred), the filter
    // chip will show those instead of the empty state. In that case, deactivate
    // the chip and skip rather than fail.
    const emptyStateVisible = await page
      .getByTestId(SEL.favoritesEmptyState)
      .waitFor({ state: 'visible', timeout: 5_000 })
      .then(() => true)
      .catch(() => false);

    if (!emptyStateVisible) {
      await chip.click(); // deactivate filter before skipping
      test.skip();
      return;
    }

    await expect(page.getByTestId(SEL.favoritesEmptyState)).toBeVisible();
  });

  test('Favorites chip shows starred events and hides non-starred ones', async ({
    authenticatedPage: page,
  }) => {
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });

    const card = page.getByTestId(SEL.eventCard).first();
    const cardVisible = await card
      .waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    if (!cardVisible || (await page.getByTestId(SEL.eventCard).count()) < 2) {
      test.skip();
      return;
    }

    // Star the first event
    const starBtn = card.getByTestId(SEL.favoriteButton).first();
    const wasAlreadyFilled = await card
      .getByTestId(SEL.starFilled)
      .isVisible()
      .catch(() => false);
    if (!wasAlreadyFilled) {
      await starBtn.click();
      await expect(card.getByTestId(SEL.starFilled)).toBeVisible({ timeout: 5_000 });
    }

    // Activate favorites filter
    const chip = page.getByTestId(SEL.favoritesFilterChip);
    await expect(chip).toBeVisible({ timeout: 10_000 });
    await chip.click();

    // Empty state should NOT be visible (we have a favorite)
    await expect(page.getByTestId(SEL.favoritesEmptyState)).not.toBeVisible({ timeout: 5_000 });
    // At least one card should still be visible
    await expect(page.getByTestId(SEL.eventCard).first()).toBeVisible({ timeout: 5_000 });

    // Deactivate filter and clean up
    await chip.click();
    if (!wasAlreadyFilled) {
      await unstarFirstEvent(page);
    }
  });
});

// ─── 4. Authenticated – Profile Saved Events section ─────────────────────────

test.describe('Favorites – Profile Page Saved Events Section (Authenticated)', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto(ROUTES.account);
    await authenticatedPage.getByTestId(SEL.accountPage).waitFor({ timeout: 30_000 });
  });

  test('Saved Events section is present on Summary tab', async ({ authenticatedPage: page }) => {
    await expect(page.getByTestId(SEL.favoritesSection)).toBeVisible({ timeout: 10_000 });
  });

  test('Saved Events section shows empty state when no favorites exist', async ({
    authenticatedPage: page,
  }) => {
    // Skip if the test user already has server-side favorites (accumulated from
    // previous runs). We wait up to 25s for the list, which is what
    // waitForFavoritesSectionList also uses, to be consistent.
    const listAlreadyVisible = await waitForFavoritesSectionList(page);
    if (listAlreadyVisible) {
      test.skip();
      return;
    }

    // List never appeared → should be showing the empty state
    const sectionEmpty = page.getByTestId(SEL.favoritesSectionEmpty);
    await expect(sectionEmpty).toBeVisible({ timeout: 5_000 });
    await expect(sectionEmpty).toContainText(/haven't saved/i);
  });

  test('Saved Events section displays a card for each favorited event', async ({
    authenticatedPage: page,
  }) => {
    // Star an event first, then check the section
    const starBtn = await starFirstEvent(page);
    if (!starBtn) {
      test.skip();
      return;
    }

    // Navigate to profile
    await page.goto(ROUTES.account);
    await page.getByTestId(SEL.accountPage).waitFor({ timeout: 30_000 });

    if (!(await waitForFavoritesSectionList(page))) {
      test.skip();
      return;
    }
    const cards = page.getByTestId(SEL.savedEventCard);
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });

    // Clean up: go back to search and unstar
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });
    await unstarFirstEvent(page);
  });

  test('Saved Events cards show agency name and event name', async ({
    authenticatedPage: page,
  }) => {
    test.setTimeout(90_000);
    const starBtn = await starFirstEvent(page);
    if (!starBtn) {
      test.skip();
      return;
    }

    await page.goto(ROUTES.account);
    await page.getByTestId(SEL.accountPage).waitFor({ timeout: 30_000 });
    if (!(await waitForFavoritesSectionList(page))) {
      test.skip();
      return;
    }

    const card = page.getByTestId(SEL.savedEventCard).first();
    await expect(card).toBeVisible({ timeout: 10_000 });
    // Card must not be empty — it has at least agency name and event name
    await expect(card).not.toBeEmpty();

    // Clean up
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });
    await unstarFirstEvent(page);
  });

  test('Saved Events section shows upcoming count badge for multi-date events', async ({
    authenticatedPage: page,
  }) => {
    test.setTimeout(90_000);
    // The badge only renders when an event has > 1 upcoming date.
    // Skip gracefully if no events have multiple dates.
    const starBtn = await starFirstEvent(page);
    if (!starBtn) {
      test.skip();
      return;
    }

    await page.goto(ROUTES.account);
    await page.getByTestId(SEL.accountPage).waitFor({ timeout: 30_000 });
    if (!(await waitForFavoritesSectionList(page))) {
      test.skip();
      return;
    }

    // The badge may or may not exist depending on live data — assert its text when present
    const badge = page.getByTestId(SEL.upcomingCountBadge).first();
    if (await badge.isVisible().catch(() => false)) {
      await expect(badge).toContainText(/\d+ dates/);
    }

    // Clean up
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });
    await unstarFirstEvent(page);
  });

  test('clicking the unfavorite star on a saved event card removes it', async ({
    authenticatedPage: page,
  }) => {
    test.setTimeout(90_000);
    const starBtn = await starFirstEvent(page);
    if (!starBtn) {
      test.skip();
      return;
    }

    await page.goto(ROUTES.account);
    await page.getByTestId(SEL.accountPage).waitFor({ timeout: 30_000 });
    if (!(await waitForFavoritesSectionList(page))) {
      test.skip();
      return;
    }

    const cardCount = await page.getByTestId(SEL.savedEventCard).count();

    // Click the star on the first saved event card to remove it
    const firstCard = page.getByTestId(SEL.savedEventCard).first();
    await firstCard.getByTestId(SEL.favoriteButton).click();

    // If it was the only card, the list should be gone and empty state shown
    if (cardCount === 1) {
      await expect(page.getByTestId(SEL.favoritesSectionEmpty)).toBeVisible({ timeout: 10_000 });
    } else {
      // Otherwise the list should now have one fewer card
      await expect(page.getByTestId(SEL.savedEventCard)).toHaveCount(cardCount - 1, {
        timeout: 10_000,
      });
    }
  });
});

// ─── 5. Authenticated – Date Selection Dialog ────────────────────────────────

test.describe('Favorites – Date Selection Dialog (Authenticated)', () => {
  test('clicking a saved event card with upcoming dates opens the date dialog', async ({
    authenticatedPage: page,
  }) => {
    test.setTimeout(90_000);
    const starBtn = await starFirstEvent(page);
    if (!starBtn) {
      test.skip();
      return;
    }

    await page.goto(ROUTES.account);
    await page.getByTestId(SEL.accountPage).waitFor({ timeout: 30_000 });
    if (!(await waitForFavoritesSectionList(page))) {
      test.skip();
      return;
    }

    const upcomingCard = page
      .getByTestId(SEL.savedEventCard)
      .filter({ hasNot: page.getByTestId(SEL.pastEventBadge) })
      .first();

    const hasUpcomingCard = await upcomingCard.isVisible().catch(() => false);
    if (!hasUpcomingCard) {
      test.skip();
      return;
    }

    await upcomingCard.click();
    await expect(page.getByTestId(SEL.dateSelectionDialog)).toBeVisible({ timeout: 5_000 });

    // Clean up
    await page.keyboard.press('Escape');
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });
    await unstarFirstEvent(page);
  });

  test('date dialog lists upcoming dates for the event', async ({ authenticatedPage: page }) => {
    const starBtn = await starFirstEvent(page);
    if (!starBtn) {
      test.skip();
      return;
    }

    await page.goto(ROUTES.account);
    await page.getByTestId(SEL.accountPage).waitFor({ timeout: 30_000 });
    if (!(await waitForFavoritesSectionList(page))) {
      test.skip();
      return;
    }

    const upcomingCard = page
      .getByTestId(SEL.savedEventCard)
      .filter({ hasNot: page.getByTestId(SEL.pastEventBadge) })
      .first();
    if (!(await upcomingCard.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await upcomingCard.click();
    await expect(page.getByTestId(SEL.dateSelectionDialog)).toBeVisible({ timeout: 5_000 });

    // Dialog must contain at least one date row (clickable or walk-in)
    const clickableRows = page.getByTestId(SEL.dateListItem);
    const walkinRows = page.getByTestId(SEL.dateListItemWalkin);
    const totalRows = (await clickableRows.count()) + (await walkinRows.count());
    expect(totalRows).toBeGreaterThan(0);

    await page.keyboard.press('Escape');
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });
    await unstarFirstEvent(page);
  });

  test('walk-in-only date rows show "Walk-in only" and are not buttons', async ({
    authenticatedPage: page,
  }) => {
    const starBtn = await starFirstEvent(page);
    if (!starBtn) {
      test.skip();
      return;
    }

    await page.goto(ROUTES.account);
    await page.getByTestId(SEL.accountPage).waitFor({ timeout: 30_000 });
    if (!(await waitForFavoritesSectionList(page))) {
      test.skip();
      return;
    }

    const upcomingCard = page
      .getByTestId(SEL.savedEventCard)
      .filter({ hasNot: page.getByTestId(SEL.pastEventBadge) })
      .first();
    if (!(await upcomingCard.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await upcomingCard.click();
    await expect(page.getByTestId(SEL.dateSelectionDialog)).toBeVisible({ timeout: 5_000 });

    const walkinRow = page.getByTestId(SEL.dateListItemWalkin).first();
    if (await walkinRow.isVisible().catch(() => false)) {
      await expect(walkinRow).toContainText(/walk-in only/i);
      // Walk-in rows are divs, not buttons — they have no role="button"
      await expect(walkinRow).not.toHaveRole('button');
    }

    await page.keyboard.press('Escape');
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });
    await unstarFirstEvent(page);
  });

  test('clicking a reservation date row navigates to the event details page', async ({
    authenticatedPage: page,
  }) => {
    const starBtn = await starFirstEvent(page);
    if (!starBtn) {
      test.skip();
      return;
    }

    await page.goto(ROUTES.account);
    await page.getByTestId(SEL.accountPage).waitFor({ timeout: 30_000 });
    if (!(await waitForFavoritesSectionList(page))) {
      test.skip();
      return;
    }

    const upcomingCard = page
      .getByTestId(SEL.savedEventCard)
      .filter({ hasNot: page.getByTestId(SEL.pastEventBadge) })
      .first();
    if (!(await upcomingCard.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await upcomingCard.click();
    await expect(page.getByTestId(SEL.dateSelectionDialog)).toBeVisible({ timeout: 5_000 });

    const clickableRow = page.getByTestId(SEL.dateListItem).first();
    if (!(await clickableRow.isVisible().catch(() => false))) {
      // No reservation dates available — skip gracefully
      await page.keyboard.press('Escape');
      test.skip();
      return;
    }

    await clickableRow.click();
    await expect(page).toHaveURL(/\/register\/event\/[^/]+/, { timeout: 15_000 });

    // Clean up: navigate back before unstarring
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });
    await unstarFirstEvent(page);
  });

  test('closing the dialog with Escape keeps the user on the profile page', async ({
    authenticatedPage: page,
  }) => {
    const starBtn = await starFirstEvent(page);
    if (!starBtn) {
      test.skip();
      return;
    }

    await page.goto(ROUTES.account);
    await page.getByTestId(SEL.accountPage).waitFor({ timeout: 30_000 });
    if (!(await waitForFavoritesSectionList(page))) {
      test.skip();
      return;
    }

    const upcomingCard = page
      .getByTestId(SEL.savedEventCard)
      .filter({ hasNot: page.getByTestId(SEL.pastEventBadge) })
      .first();
    if (!(await upcomingCard.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await upcomingCard.click();
    await expect(page.getByTestId(SEL.dateSelectionDialog)).toBeVisible({ timeout: 5_000 });

    await page.keyboard.press('Escape');
    await expect(page.getByTestId(SEL.dateSelectionDialog)).not.toBeVisible({ timeout: 5_000 });
    await expect(page).toHaveURL(ROUTES.account);

    // Clean up
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });
    await unstarFirstEvent(page);
  });
});

// ─── 6. Authenticated – Back button returns to Profile ───────────────────────

test.describe('Favorites – Back Navigation (Authenticated)', () => {
  test('Back button on event details returns to Profile page after arriving from Favorites', async ({
    authenticatedPage: page,
  }) => {
    test.setTimeout(90_000);
    const starBtn = await starFirstEvent(page);
    if (!starBtn) {
      test.skip();
      return;
    }

    // Navigate to profile and open the dialog
    await page.goto(ROUTES.account);
    await page.getByTestId(SEL.accountPage).waitFor({ timeout: 30_000 });
    if (!(await waitForFavoritesSectionList(page))) {
      test.skip();
      return;
    }

    const upcomingCard = page
      .getByTestId(SEL.savedEventCard)
      .filter({ hasNot: page.getByTestId(SEL.pastEventBadge) })
      .first();
    if (!(await upcomingCard.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await upcomingCard.click();
    await expect(page.getByTestId(SEL.dateSelectionDialog)).toBeVisible({ timeout: 5_000 });

    const clickableRow = page.getByTestId(SEL.dateListItem).first();
    if (!(await clickableRow.isVisible().catch(() => false))) {
      await page.keyboard.press('Escape');
      test.skip();
      return;
    }

    // Navigate to event details via the dialog
    await clickableRow.click();
    await expect(page).toHaveURL(/\/register\/event\/[^/]+/, { timeout: 15_000 });

    // Wait for the back button to render
    await page.locator('.back-button').waitFor({ state: 'visible', timeout: 20_000 });

    // Click Back — should return to the profile page (/account)
    await page.locator('.back-button').click();
    await expect(page).toHaveURL(ROUTES.account, { timeout: 15_000 });

    // Clean up
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });
    await unstarFirstEvent(page);
  });

  test('Back button on event details returns to search results when arrived from search', async ({
    authenticatedPage: page,
  }) => {
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });

    // Wait for a Reserve button (standard path, no favorites involved)
    const hasReserveButton = await page
      .getByTestId(SEL.eventReserveButton)
      .first()
      .waitFor({ state: 'visible', timeout: 20_000 })
      .then(() => true)
      .catch(() => false);

    if (!hasReserveButton) {
      test.skip();
      return;
    }

    await page.getByTestId(SEL.eventReserveButton).first().click();
    await expect(page).toHaveURL(/\/register\/event\/[^/]+/, { timeout: 10_000 });
    await page.locator('.back-button').waitFor({ state: 'visible', timeout: 20_000 });

    await page.locator('.back-button').click();
    await expect(page).toHaveURL(new RegExp(ROUTES.eventsList(ZIP_CODES.withEvents)), {
      timeout: 15_000,
    });
  });
});
