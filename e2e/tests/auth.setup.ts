import { existsSync } from 'fs';
import { test as setup, expect } from '@playwright/test';
import { SEL } from '../helpers/selectors';
import { TEST_USER, AUTH_STATE_PATH, ROUTES } from '../helpers/test-data';

const MAX_LOGIN_ATTEMPTS = 3;

setup('authenticate test user', async ({ page }) => {
  // In CI the auth state is produced once by the dedicated e2e-setup job and
  // downloaded as an artifact before each shard starts. Skip re-authentication
  // to avoid concurrent Cognito sign-ins across shards hitting rate limits.
  //
  // The CI guard is intentional: locally we always perform a fresh login so
  // a leftover file with expired tokens never silently breaks the test run.
  if (process.env.CI && existsSync(AUTH_STATE_PATH)) {
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
