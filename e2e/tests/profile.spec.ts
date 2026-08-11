import { test, expect } from '../fixtures/auth.fixture';
import { test as baseTest, expect as baseExpect } from '@playwright/test';
import { SEL } from '../helpers/selectors';
import { ROUTES } from '../helpers/test-data';

// Budget for assertions that wait on the Account page's household data.
//
// The page issues three requests on mount (/users/me, plus reservations for
// ?type=upcoming and ?type=past). The beta registration API processes these
// effectively one at a time, so latency scales with total in-flight requests —
// measured against the beta host as 1.8s at 1 concurrent, 4.9s at 3, 9.3s at 6,
// 14.3s at 9, 18.2s at 12. CI runs three shards in parallel, so nine requests
// are in flight and the slowest lands around 14.3s before network overhead.
//
// The previous 15s budget therefore sat directly on the cliff edge and failed
// intermittently (2 of these tests failed on one run, all 9 on the next). 30s
// gives roughly 2x headroom at CI's own concurrency. This is a budget matched to
// measured reality, not a fix — the underlying API throughput is tracked in
// SUP-502, and lowering this again depends on that work.
const HOUSEHOLD_DATA_TIMEOUT = 30_000;

// ── Auth guard (unauthenticated) ─────────────────────────────────

baseTest.describe('Profile - Auth Guard', () => {
  baseTest('redirects to login when not authenticated', async ({ page }) => {
    await page.goto(ROUTES.account);

    await baseExpect(page).toHaveURL(new RegExp(ROUTES.login), {
      timeout: 15_000,
    });
  });
});

// ── Authenticated profile tests ──────────────────────────────────

test.describe('Profile / Account Page', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto(ROUTES.account);
    await authenticatedPage.getByTestId(SEL.accountPage).waitFor({ timeout: 30_000 });
  });

  // ── Page structure ─────────────────────────────────────────────

  test('renders account page with user info', async ({ authenticatedPage: page }) => {
    await expect(page.getByTestId(SEL.userAvatar)).toBeVisible();
    await expect(page.getByTestId(SEL.userDisplayName)).toBeVisible();
  });

  test('shows Summary and Account tabs', async ({ authenticatedPage: page }) => {
    await expect(page.getByTestId(SEL.tabSummary)).toBeVisible();
    await expect(page.getByTestId(SEL.tabAccount)).toBeVisible();
  });

  test('Summary tab is active by default', async ({ authenticatedPage: page }) => {
    const summaryTab = page.getByTestId(SEL.tabSummary);
    await expect(summaryTab).toHaveAttribute('data-state', 'active');
  });

  // ── Tab interactions ───────────────────────────────────────────

  test('switching to Account tab shows household info', async ({ authenticatedPage: page }) => {
    await page.getByTestId(SEL.tabAccount).click();

    await expect(page.getByTestId(SEL.tabAccount)).toHaveAttribute('data-state', 'active');

    // Either info section or a setup prompt should be visible
    const infoSection = page.getByTestId(SEL.accountInfoSection);
    const householdSection = page.getByTestId(SEL.householdMembersSection);

    // Wait for loading to finish, then check for either info or prompt
    await expect(infoSection.or(householdSection).first()).toBeVisible({
      timeout: HOUSEHOLD_DATA_TIMEOUT,
    });
  });

  test('switching back to Summary shows reservations area', async ({ authenticatedPage: page }) => {
    await page.getByTestId(SEL.tabAccount).click();
    await expect(page.getByTestId(SEL.tabAccount)).toHaveAttribute('data-state', 'active');

    await page.getByTestId(SEL.tabSummary).click();
    await expect(page.getByTestId(SEL.tabSummary)).toHaveAttribute('data-state', 'active');
  });

  // ── Account tab content ────────────────────────────────────────

  test('displays user information and household sections', async ({ authenticatedPage: page }) => {
    await page.getByTestId(SEL.tabAccount).click();

    // Wait for account info to load (may take time due to API call)
    await expect(page.getByTestId(SEL.accountInfoSection)).toBeVisible({
      timeout: HOUSEHOLD_DATA_TIMEOUT,
    });
    await expect(page.getByTestId(SEL.householdMembersSection)).toBeVisible();
  });

  test('Update Household button navigates to setup', async ({ authenticatedPage: page }) => {
    await page.getByTestId(SEL.tabAccount).click();

    await expect(page.getByTestId(SEL.updateHouseholdButton)).toBeVisible({
      timeout: HOUSEHOLD_DATA_TIMEOUT,
    });
    await page.getByTestId(SEL.updateHouseholdButton).click();

    await expect(page).toHaveURL(new RegExp(`${ROUTES.householdSetup}\\?from=account`));
  });

  // ── Navigation ─────────────────────────────────────────────────

  test('Back to Home button works', async ({ authenticatedPage: page }) => {
    await page.getByTestId(SEL.backToHome).click();
    await expect(page).toHaveURL(ROUTES.home);
  });
});
