import { existsSync, readFileSync } from 'fs';
import { test as setup, expect } from '@playwright/test';
import { SEL } from '../helpers/selectors';
import { TEST_USER, AUTH_STATE_PATH, ROUTES } from '../helpers/test-data';

const MAX_LOGIN_ATTEMPTS = 3;

/**
 * Validates that the Playwright storage-state file at the given path contains
 * usable authentication data.  Three checks must all pass:
 *
 *   1. The file exists and parses as valid JSON.
 *   2. At least one origin with localStorage entries is present (an auth state
 *      written before Cognito login completes would be empty).
 *   3. No JWT found in localStorage has an expired `exp` claim — Cognito issues
 *      short-lived (~1 h) idTokens, so a stale artifact that predates the next
 *      CI run must not silently pass.
 */
function hasValidStorageState(filePath: string): boolean {
  if (!existsSync(filePath)) return false;

  try {
    type LocalStorageItem = { name: string; value: string };
    type StorageOrigin = { origin: string; localStorage?: LocalStorageItem[] };
    const state = JSON.parse(readFileSync(filePath, 'utf-8')) as {
      cookies?: unknown[];
      origins?: StorageOrigin[];
    };

    // Require at least one origin with localStorage data.
    const origins = state.origins ?? [];
    const allItems: LocalStorageItem[] = origins.flatMap((o) => o.localStorage ?? []);
    if (allItems.length === 0) return false;

    // Reject if any decodable JWT is expired.
    const nowSecs = Math.floor(Date.now() / 1000);
    for (const { value } of allItems) {
      // A JWT has the form: <base64url>.<base64url>.<base64url> where the first
      // two segments decode to JSON objects that begin with "{".
      if (!/^eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+$/.test(value)) continue;
      try {
        const payload = JSON.parse(
          Buffer.from(value.split('.')[1], 'base64url').toString('utf-8'),
        ) as { exp?: number };
        if (typeof payload.exp === 'number' && payload.exp <= nowSecs) {
          return false;
        }
      } catch {
        // Unparseable JWT segment — skip; other tokens govern the decision.
      }
    }

    return true;
  } catch {
    return false;
  }
}

setup('authenticate test user', async ({ page }) => {
  // In CI the auth state is produced once by the dedicated e2e-setup job and
  // downloaded as an artifact before each shard starts. Skip re-authentication
  // to avoid concurrent Cognito sign-ins across shards hitting rate limits.
  //
  // The CI guard is intentional: locally we always perform a fresh login so
  // a leftover file with expired tokens never silently breaks the test run.
  if (process.env.CI && hasValidStorageState(AUTH_STATE_PATH)) {
    return;
  }

  setup.setTimeout(180_000);

  for (let attempt = 1; attempt <= MAX_LOGIN_ATTEMPTS; attempt++) {
    await page.goto(ROUTES.login);
    await page.getByTestId(SEL.loginPage).waitFor();

    await page.getByTestId(SEL.emailInput).fill(TEST_USER.email);
    await page.getByTestId(SEL.passwordInput).fill(TEST_USER.password);
    await page.getByTestId(SEL.signinSubmit).click();

    try {
      await expect(page).toHaveURL(ROUTES.home, { timeout: 45_000 });
      break;
    } catch {
      const errorEl = page.getByTestId(SEL.authErrorMessage);
      const errorVisible = await errorEl.isVisible();
      const errorText = errorVisible ? await errorEl.textContent() : null;
      const currentUrl = page.url();

      if (attempt === MAX_LOGIN_ATTEMPTS) {
        await page.screenshot({ path: 'test-results/auth-setup-final-failure.png' });
        throw new Error(
          `Login failed after ${MAX_LOGIN_ATTEMPTS} attempts. ` +
            `URL: ${currentUrl}, Error visible: ${errorVisible}. ` +
            `Error message: "${errorText ?? 'N/A'}". ` +
            `Cognito may be throttling or unreachable.`,
        );
      }

      // Wait before retrying to let Cognito rate limits reset
      await page.waitForTimeout(5_000);
    }
  }

  await page.context().storageState({ path: AUTH_STATE_PATH });
});
