import { test as base, expect, type Page } from '@playwright/test';
import { AUTH_STATE_PATH, ROUTES } from '../helpers/test-data';

type AuthFixtures = {
  authenticatedPage: Page;
};

/**
 * Extends the base test with an `authenticatedPage` fixture that
 * reuses the stored auth state produced by auth.setup.ts.
 *
 * Navigates to home first so Amplify fully restores auth from
 * localStorage before the test navigates to a protected route.
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: AUTH_STATE_PATH,
    });
    const page = await context.newPage();

    await page.goto(ROUTES.home, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await use(page);
    await context.close();
  },
});

export { expect };
