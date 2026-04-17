import { test, expect } from '@playwright/test';
import { SEL } from '../helpers/selectors';
import { ZIP_CODES, ROUTES } from '../helpers/test-data';

test.describe('Home / Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.home, { waitUntil: 'domcontentloaded' });
    await page.getByTestId(SEL.headerNav).waitFor();
  });

  // ── Page structure ───────────────────────────────────────────────

  test('renders dashboard with header and search form', async ({ page }) => {
    await expect(page.getByTestId(SEL.headerNav)).toBeVisible();
    await expect(page.getByTestId(SEL.zipCodeInput)).toBeVisible();
    await expect(page.getByTestId(SEL.searchSubmit)).toBeVisible();
  });

  test('shows feature cards section', async ({ page }) => {
    const featureCards = page.getByTestId(SEL.featureCard);
    await expect(featureCards.first()).toBeVisible();
    expect(await featureCards.count()).toBeGreaterThanOrEqual(2);
  });

  test('shows header banner with title and subtitle', async ({ page }) => {
    await expect(page.getByTestId('subtext-on-header')).toBeVisible();
  });

  test('footer is visible with links', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByTestId(SEL.footerPrivacy)).toBeVisible();
    await expect(page.getByTestId(SEL.footerTerms)).toBeVisible();
  });

  // ── Search functionality ─────────────────────────────────────────

  test('submitting zip code navigates to search results', async ({ page }) => {
    await page.getByTestId(SEL.zipCodeInput).fill(ZIP_CODES.withEvents);
    await page.getByTestId(SEL.searchSubmit).click();

    await expect(page).toHaveURL(new RegExp(`/events/list/${ZIP_CODES.withEvents}`));
  });

  test('auto-submits when 5-digit zip is entered', async ({ page }) => {
    const zipInput = page.getByTestId(SEL.zipCodeInput);
    await zipInput.click();

    for (const char of ZIP_CODES.withEvents) {
      await zipInput.press(char);
    }

    await expect(page).toHaveURL(new RegExp(`/events/list/${ZIP_CODES.withEvents}`), {
      timeout: 10_000,
    });
  });

  test('shows filter panel after entering valid zip on results page', async ({ page }) => {
    await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents));

    await expect(page.getByTestId(SEL.filterDistance)).toBeVisible({
      timeout: 15_000,
    });
  });

  test('does not show filter panel with partial zip', async ({ page }) => {
    await page.getByTestId(SEL.zipCodeInput).fill(ZIP_CODES.partial);

    await expect(page.getByTestId(SEL.filterDistance)).not.toBeVisible();
  });

  // ── Navigation ───────────────────────────────────────────────────

  test('header logo navigates to home', async ({ page }) => {
    await page.getByTestId(SEL.headerLogo).click();
    await expect(page).toHaveURL(ROUTES.home);
  });

  test('Sign In button in header navigates to login', async ({ page }) => {
    await page.getByTestId(SEL.headerSigninButton).click();
    await expect(page).toHaveURL(ROUTES.login);
  });

  test('language selector is visible and functional', async ({ page }) => {
    const selector = page.getByTestId(SEL.languageSelector);
    await expect(selector).toBeVisible();
    await selector.click();

    const options = page.getByRole('option');
    expect(await options.count()).toBeGreaterThanOrEqual(2);
  });

  // ── ChatBot ──────────────────────────────────────────────────────

  test('chatbot toggle button is visible', async ({ page }) => {
    await expect(page.getByTestId(SEL.chatbotToggle)).toBeVisible();
  });

  test('clicking chatbot opens chat window', async ({ page }) => {
    await page.getByTestId(SEL.chatbotToggle).click();
    await expect(page.getByTestId(SEL.chatbotWindow)).toBeVisible();
  });

  // ── Mobile responsive ────────────────────────────────────────────

  test('mobile menu button appears on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ROUTES.home);

    await expect(page.getByTestId(SEL.mobileMenuButton)).toBeVisible();
  });

  test('mobile menu shows navigation links', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ROUTES.home);

    await page.getByTestId(SEL.mobileMenuButton).click();
    await expect(page.getByTestId(SEL.mobileMenuDialog)).toBeVisible();

    await expect(page.getByTestId(SEL.mobileMenuDialog).getByText('About FreshTrak')).toBeVisible();
  });
});
