/**
 * E2E tests for the Nearby Events feature.
 *
 * Coverage areas:
 *   1. Loading state — spinner is visible while geolocation is pending
 *   2. Permission denied — section is never rendered
 *   3. Success path — section heading (with zip) and event cards are visible
 *   4. Empty API response — section is hidden when no agencies are returned
 *   5. Geocoding failure — section is hidden when Nominatim cannot resolve a zip
 *   6. DOM order — section sits below the search card and above "FreshTrak is here to help!"
 *
 * Strategy
 * ─────────
 * Geolocation is overridden via `addInitScript` before navigation so the
 * hook receives a deterministic result without requiring real browser
 * permissions.  Network calls to the Nominatim geocoding API and the
 * FreshTrak agencies API are intercepted with `page.route`.
 */

import { test, expect, type Page } from '@playwright/test';
import { SEL } from '../helpers/selectors';
import { ROUTES } from '../helpers/test-data';

// ─── Constants ────────────────────────────────────────────────────────────────

const MOCK_COORDS = { latitude: 40.7128, longitude: -74.006, accuracy: 1 };
const MOCK_ZIP = '10001';

const MOCK_AGENCY_RESPONSE = {
  agencies: [
    {
      id: 1,
      name: 'Test Food Bank',
      phone: '555-0100',
      estimated_distance: 1.5,
      latitude: 40.7128,
      longitude: -74.006,
      images: [],
      events: [
        {
          id: 1,
          name: 'Community Food Drive',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          event_details: '',
          exception_note: '',
          service_category: { service_category_name: 'Food' },
          forms: [],
          images: [],
          event_dates: [
            {
              id: '19999',
              event_id: 1,
              accept_reservations: 1,
              accept_interest: 0,
              accept_walkin: 0,
              start_time: '08:00 AM',
              end_time: '11:00 AM',
              date: '2026-05-26',
            },
          ],
        },
      ],
    },
  ],
};

// ─── Geolocation helpers ──────────────────────────────────────────────────────

/**
 * Replaces `navigator.geolocation.getCurrentPosition` with a stub that
 * immediately resolves the success callback using the supplied coordinates.
 * Must be called before `page.goto`.
 */
async function grantGeolocation(page: Page, coords = MOCK_COORDS): Promise<void> {
  await page.addInitScript((c) => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          success({
            coords: {
              latitude: c.latitude,
              longitude: c.longitude,
              accuracy: c.accuracy,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          } as GeolocationPosition);
        },
        watchPosition: () => 0,
        clearWatch: () => {},
      },
      configurable: true,
    });
  }, coords);
}

/**
 * Replaces `navigator.geolocation.getCurrentPosition` with a stub that
 * immediately fires the error callback with `PERMISSION_DENIED` (code 1).
 */
async function denyGeolocation(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: (_success: unknown, error: PositionErrorCallback) => {
          error(
            Object.assign(new Error('User denied Geolocation'), {
              code: 1,
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
            }) as unknown as GeolocationPositionError,
          );
        },
        watchPosition: () => 0,
        clearWatch: () => {},
      },
      configurable: true,
    });
  });
}

/**
 * Replaces `navigator.geolocation.getCurrentPosition` with a stub that
 * never calls either callback — simulating a pending permission prompt.
 */
async function hangGeolocation(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: () => {
          /* intentionally never resolves */
        },
        watchPosition: () => 0,
        clearWatch: () => {},
      },
      configurable: true,
    });
  });
}

// ─── Network helpers ──────────────────────────────────────────────────────────

async function mockNominatimSuccess(page: Page, zip = MOCK_ZIP): Promise<void> {
  // Intercept via init-script so the mock is in place before any app code runs.
  // page.route() with external origins can be unreliable depending on the
  // browser's fetch timing; patching window.fetch is guaranteed to fire first.
  await page.addInitScript(
    ({ zip: z }) => {
      const original = window.fetch.bind(window);
      window.fetch = (input, init) => {
        const url = typeof input === 'string' ? input : (input as Request).url;
        if (url.includes('nominatim')) {
          return Promise.resolve(
            new Response(JSON.stringify({ address: { postcode: z } }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
          );
        }
        return original(input, init);
      };
    },
    { zip },
  );
}

async function mockNominatimFailure(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const original = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = typeof input === 'string' ? input : (input as Request).url;
      if (url.includes('nominatim')) {
        return Promise.reject(new TypeError('Network request failed (mocked)'));
      }
      return original(input, init);
    };
  });
}

async function mockEventsApiWithResults(page: Page): Promise<void> {
  await page.route('**/api/agencies**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_AGENCY_RESPONSE),
    }),
  );
}

async function mockEventsApiEmpty(page: Page): Promise<void> {
  await page.route('**/api/agencies**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ agencies: [] }),
    }),
  );
}

/**
 * Navigate to the home page and wait until the page shell is ready.
 * All geolocation / network mocks must be set up BEFORE calling this.
 */
async function gotoHome(page: Page): Promise<void> {
  await page.goto(ROUTES.home, { waitUntil: 'domcontentloaded' });
  await page.getByTestId(SEL.dashboardPage).waitFor({ timeout: 20_000 });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Nearby Events Section', () => {
  test('shows a loading spinner while geolocation is pending', async ({ page }) => {
    await hangGeolocation(page);
    await gotoHome(page);

    await expect(page.getByTestId(SEL.nearbyEventsLoading)).toBeVisible();
  });

  test('does not render the section when geolocation permission is denied', async ({ page }) => {
    await denyGeolocation(page);
    await gotoHome(page);

    // After the sync error callback fires the component should render null;
    // give React one animation frame to flush before asserting.
    await page.waitForFunction(
      (testId) => !document.querySelector(`[data-testid="${testId}"]`),
      SEL.nearbyEventsSection,
      { timeout: 5_000 },
    );

    await expect(page.getByTestId(SEL.nearbyEventsSection)).not.toBeAttached();
  });

  test('renders the section heading (with zip) and event cards when events are found', async ({
    page,
  }) => {
    // Grant geolocation and mock the events API.
    // We intentionally let the geocoder return the real zip for these
    // coordinates — we're testing our component's render behaviour, not
    // geocoder accuracy, so any resolved zip is acceptable.
    await grantGeolocation(page);
    await mockEventsApiWithResults(page);
    await gotoHome(page);

    const heading = page.getByRole('heading', { name: /Nearby Events/ });
    await expect(heading).toBeVisible({ timeout: 15_000 });

    // Heading must include a 5-digit US zip code in parentheses
    await expect(heading).toContainText(/\(\d{5}\)/);

    // At least one event card must be rendered inside the section
    const section = page.getByTestId(SEL.nearbyEventsSection);
    await expect(section.getByTestId(SEL.eventCard).first()).toBeVisible();
  });

  test('does not render the section when the events API returns no agencies', async ({ page }) => {
    await grantGeolocation(page);
    await mockNominatimSuccess(page);
    await mockEventsApiEmpty(page);
    await gotoHome(page);

    // Wait for the loading spinner to disappear — that means the full async
    // chain (geolocation → geocoding → API fetch) has completed.
    await expect(page.getByTestId(SEL.nearbyEventsLoading)).not.toBeAttached({
      timeout: 15_000,
    });

    await expect(page.getByTestId(SEL.nearbyEventsSection)).not.toBeAttached();
  });

  test('does not render the section when reverse geocoding fails', async ({ page }) => {
    await grantGeolocation(page);
    await mockNominatimFailure(page);
    await gotoHome(page);

    await expect(page.getByTestId(SEL.nearbyEventsLoading)).not.toBeAttached({
      timeout: 15_000,
    });

    await expect(page.getByTestId(SEL.nearbyEventsSection)).not.toBeAttached();
  });

  test('section is positioned below the search card and above the FreshTrak help heading', async ({
    page,
  }) => {
    await grantGeolocation(page);
    await mockEventsApiWithResults(page);
    await gotoHome(page);

    await page.getByRole('heading', { name: /Nearby Events/ }).waitFor({ timeout: 15_000 });

    // Scope the FreshTrak heading to the dashboard section to avoid matching
    // the duplicate h1 in the header banner.
    const dashboardSection = page.getByTestId(SEL.dashboardPage);

    const [searchBox, nearbyBox, helpBox] = await Promise.all([
      page.getByTestId(SEL.zipCodeInput).boundingBox(),
      page.getByTestId(SEL.nearbyEventsSection).boundingBox(),
      dashboardSection.getByRole('heading', { name: /FreshTrak is here to help/i }).boundingBox(),
    ]);

    // All three elements must be in the viewport
    expect(searchBox).not.toBeNull();
    expect(nearbyBox).not.toBeNull();
    expect(helpBox).not.toBeNull();

    if (!searchBox || !nearbyBox || !helpBox) return;

    // Verify top-to-bottom order by comparing vertical positions
    expect(searchBox.y).toBeLessThan(nearbyBox.y);
    expect(nearbyBox.y).toBeLessThan(helpBox.y);
  });
});
