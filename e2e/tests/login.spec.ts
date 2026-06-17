import { test, expect } from '@playwright/test';
import { SEL } from '../helpers/selectors';
import { TEST_USER, ROUTES } from '../helpers/test-data';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.login);
    await page.getByTestId(SEL.loginPage).waitFor();
  });

  // ── Page load and structure ──────────────────────────────────────

  test('renders login page with sign-in form', async ({ page }) => {
    await expect(page.getByTestId(SEL.emailInput)).toBeVisible();
    await expect(page.getByTestId(SEL.passwordInput)).toBeVisible();
    await expect(page.getByTestId(SEL.signinSubmit)).toBeVisible();
  });

  test('shows Sign In and Sign Up tab buttons', async ({ page }) => {
    await expect(page.getByTestId(SEL.signinTab)).toBeVisible();
    await expect(page.getByTestId(SEL.signupTab)).toBeVisible();
  });

  test('Sign In tab is active by default', async ({ page }) => {
    const signinTab = page.getByTestId(SEL.signinTab);
    await expect(signinTab).toBeVisible();
    // The active tab uses the "default" variant with primary background
    await expect(signinTab).toHaveClass(/bg-primary/);
    await expect(page.getByTestId(SEL.emailInput)).toBeVisible();
  });

  // ── Sign-in form validation ──────────────────────────────────────

  test('shows error for empty form submission', async ({ page }) => {
    await page.getByTestId(SEL.signinSubmit).click();

    const errorText = page.locator('.text-red-500');
    await expect(errorText.first()).toBeVisible();
  });

  test('shows error for invalid email format', async ({ page }) => {
    await page.getByTestId(SEL.emailInput).fill('notanemail');
    await page.getByTestId(SEL.passwordInput).fill('somepassword');
    await page.getByTestId(SEL.signinSubmit).click();

    // Browser's native type="email" validation blocks submission for values without @
    const emailInput = page.getByTestId(SEL.emailInput);
    const isValid = await emailInput.evaluate((el) => (el as HTMLInputElement).validity.valid);
    expect(isValid).toBe(false);
  });

  test('shows error for empty password', async ({ page }) => {
    await page.getByTestId(SEL.emailInput).fill('test@example.com');
    await page.getByTestId(SEL.signinSubmit).click();

    const errorText = page.locator('.text-red-500');
    await expect(errorText.first()).toBeVisible();
  });

  // ── Successful login flow ────────────────────────────────────────

  test('logs in with valid credentials and redirects to home', async ({ page }) => {
    await page.getByTestId(SEL.emailInput).fill(TEST_USER.email);
    await page.getByTestId(SEL.passwordInput).fill(TEST_USER.password);
    await page.getByTestId(SEL.signinSubmit).click();

    await expect(page).toHaveURL(ROUTES.home, { timeout: 60_000 });
  });

  test('authenticated user sees the dashboard after login', async ({ page }) => {
    await page.getByTestId(SEL.emailInput).fill(TEST_USER.email);
    await page.getByTestId(SEL.passwordInput).fill(TEST_USER.password);
    await page.getByTestId(SEL.signinSubmit).click();

    await expect(page).toHaveURL(ROUTES.home, { timeout: 60_000 });
    await expect(page.getByTestId(SEL.dashboardPage)).toBeVisible();
  });

  // ── Failed login ─────────────────────────────────────────────────

  test('shows error for wrong password', async ({ page }) => {
    await page.getByTestId(SEL.emailInput).fill(TEST_USER.email);
    await page.getByTestId(SEL.passwordInput).fill('WrongPassword123!');
    await page.getByTestId(SEL.signinSubmit).click();

    await expect(page.getByTestId(SEL.authErrorMessage)).toBeVisible({
      timeout: 15_000,
    });
  });

  test('shows error for non-existent user', async ({ page }) => {
    await page.getByTestId(SEL.emailInput).fill('nonexistent-user-xyz@example.com');
    await page.getByTestId(SEL.passwordInput).fill('SomePassword123!');
    await page.getByTestId(SEL.signinSubmit).click();

    await expect(page.getByTestId(SEL.authErrorMessage)).toBeVisible({
      timeout: 15_000,
    });
  });

  // ── Tab switching ────────────────────────────────────────────────

  test('switches to Sign Up tab and shows signup form', async ({ page }) => {
    await page.getByTestId(SEL.signupTab).click();

    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
  });

  test('switches back to Sign In from Sign Up', async ({ page }) => {
    await page.getByTestId(SEL.signupTab).click();
    await expect(page.locator('#name')).toBeVisible();

    await page.getByTestId(SEL.signinTab).click();
    await expect(page.getByTestId(SEL.emailInput)).toBeVisible();
    await expect(page.locator('#name')).not.toBeVisible();
  });

  test('Forgot Password link shows reset form', async ({ page }) => {
    await page.getByTestId(SEL.forgotPasswordLink).click();

    // The sign-in form fields (password) should be replaced by the reset form
    await expect(page.getByTestId(SEL.passwordInput)).not.toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
  });

  // ── Guest login ──────────────────────────────────────────────────

  test('guest login button is visible on signin and signup tabs', async ({ page }) => {
    await expect(page.getByTestId(SEL.guestLoginButton)).toBeVisible();

    await page.getByTestId(SEL.signupTab).click();
    await expect(page.getByTestId(SEL.guestLoginButton)).toBeVisible();
  });

  test('guest login button is not visible on reset tab', async ({ page }) => {
    await page.getByTestId(SEL.forgotPasswordLink).click();

    await expect(page.getByTestId(SEL.guestLoginButton)).not.toBeVisible();
  });

  // ── Navigation ───────────────────────────────────────────────────

  test('Back to Home navigates to root', async ({ page }) => {
    await page.getByTestId(SEL.backToHomeButton).click();
    await expect(page).toHaveURL(ROUTES.home);
  });

  test('Case Manager link navigates to case manager login', async ({ page }) => {
    await page.getByTestId(SEL.caseManagerLink).click();
    await expect(page).toHaveURL(ROUTES.caseManagerLogin);
  });
});
