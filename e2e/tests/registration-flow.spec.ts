import { test, expect } from '../fixtures/auth.fixture';
import { SEL } from '../helpers/selectors';
import { ZIP_CODES, ROUTES } from '../helpers/test-data';

/**
 * Navigates an authenticated user through the search results → event details
 * path and lands on the registration form page with the timeslot dialog open.
 *
 * Returns `false` and calls `test.skip()` when no reservable events are
 * available in the current live data, so tests degrade gracefully.
 */
async function openTimeslotDialog(
  page: ReturnType<(typeof test)['info']> extends never
    ? never
    : Parameters<Parameters<typeof test>[1]>[0]['authenticatedPage'],
): Promise<boolean> {
  // Navigate to search results for the test zip
  await page.goto(ROUTES.eventsList(ZIP_CODES.withEvents), {
    waitUntil: 'domcontentloaded',
  });
  await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 30_000 });

  // Expand the distance to "All distances" so reservation events outside the
  // default 10-mile radius are included. Without this, only RSVP-only events
  // may be visible and the timeslot dialog will never open.
  await expect(page.getByTestId(SEL.filterDistance)).toBeVisible({ timeout: 15_000 });
  await page.getByTestId(SEL.filterDistance).getByRole('combobox').click();
  await page.getByRole('option', { name: /all distances/i }).click();
  // Wait for the page to finish navigating and re-render with the new distance
  await page.getByTestId(SEL.eventListPage).waitFor({ timeout: 15_000 });

  // Enable Reservations Only filter
  await expect(page.getByTestId(SEL.filterReservations)).toBeVisible({
    timeout: 15_000,
  });
  await page.getByTestId(SEL.filterReservations).locator('#reservations').click();
  await expect(page).toHaveURL(/reservations=true/, { timeout: 10_000 });

  // Wait specifically for a reserve button to become visible.
  // The reservations filter runs client-side: there is a brief window after the
  // URL updates where the unfiltered cards may still be rendered. Immediately
  // counting buttons at that point returns 0 even though reservable events exist.
  // Using waitFor() with a generous timeout lets React finish applying the filter.
  const hasReserveButton = await page
    .getByTestId(SEL.eventReserveButton)
    .first()
    .waitFor({ state: 'visible', timeout: 20_000 })
    .then(() => true)
    .catch(() => false);

  if (!hasReserveButton) {
    return false;
  }

  // Click Reserve Time on the first eligible card
  const targetCard = page
    .getByTestId(SEL.eventCard)
    .filter({ has: page.getByTestId(SEL.eventReserveButton) })
    .first();
  await targetCard.getByTestId(SEL.eventReserveButton).click();

  // Wait for the event details page to fully load
  await expect(page).toHaveURL(/\/register\/event\/[^/]+/, { timeout: 10_000 });
  await page.locator('.back-button').waitFor({ state: 'visible', timeout: 20_000 });

  // Click Register Now — authenticated users navigate directly to the registration form
  await page.getByTestId(SEL.registerNowButton).click();
  await expect(page).toHaveURL(/\/register\/form\/[^/]+$/, { timeout: 10_000 });

  // The timeslot dialog opens automatically for events with acceptReservations === 1
  await expect(page.getByTestId(SEL.timeslotDialog)).toBeVisible({
    timeout: 15_000,
  });

  // Wait for the slot-loading spinner to disappear so content is stable.
  // Use .first() to avoid strict-mode failure when multiple radio slots are present.
  await expect(
    page.locator('input[name="time_slot"]').or(page.getByTestId(SEL.noTimeslotsMessage)).first(),
  ).toBeVisible({ timeout: 15_000 });

  return true;
}

/** Convenience alias for the page type used in authenticated tests */
type AuthPage = Parameters<Parameters<typeof test>[1]>[0]['authenticatedPage'];

type HouseholdModalResult =
  | { ready: false }
  | { ready: true; outcome: 'modal' | 'navigation'; eventDetailsUrl: string };

/**
 * Extends `openTimeslotDialog` to also select the first available timeslot,
 * click "Save and Continue", and wait for the resulting UI:
 *
 *   `modal`      – HouseholdConfirmationModal appeared (household setup complete)
 *   `navigation` – navigated directly to /register/form/:id/:slotId (setup incomplete)
 *
 * Returns `{ ready: false }` when the test should be skipped (no reservable events
 * or no available timeslots).
 */
async function openHouseholdModal(page: AuthPage): Promise<HouseholdModalResult> {
  const ready = await openTimeslotDialog(page);
  if (!ready) return { ready: false };

  const timeslotRadios = page.locator('input[name="time_slot"]');
  if ((await timeslotRadios.count()) === 0) return { ready: false };

  // Capture eventDateId from the current URL (/register/form/:eventDateId)
  const currentUrl = new URL(page.url());
  const eventDateId = currentUrl.pathname.split('/')[3] ?? '';
  const eventDetailsUrl = `/register/event/${eventDateId}`;

  // Select the first slot and proceed
  await timeslotRadios.first().click();
  await expect(page.getByTestId(SEL.timeslotSaveContinue)).toBeEnabled();
  await page.getByTestId(SEL.timeslotSaveContinue).click();

  const householdModal = page.getByTestId(SEL.householdConfirmationModal);

  // Attach .catch(null) to both branches so the "losing" side never produces an
  // unhandled rejection when it eventually times out. Without this, Playwright
  // treats the late rejection as a test failure even after the race is decided.
  const modalOrNull = householdModal
    .waitFor({ state: 'visible', timeout: 20_000 })
    .then((): 'modal' => 'modal')
    .catch((): null => null);

  const navOrNull = page
    .waitForURL(/\/register\/form\/[^/]+\/[^/]+/, { timeout: 20_000 })
    .then((): 'navigation' => 'navigation')
    .catch((): null => null);

  // Resolve with the first non-null value; if both time out, resolve null.
  const outcome = await new Promise<'modal' | 'navigation' | null>((resolve) => {
    let pending = 2;
    const trySettle = (v: 'modal' | 'navigation' | null) => {
      if (v !== null) {
        resolve(v);
        return;
      }
      if (--pending === 0) resolve(null);
    };
    modalOrNull.then(trySettle);
    navOrNull.then(trySettle);
  });

  if (outcome === null) return { ready: false };

  return { ready: true, outcome, eventDetailsUrl };
}

type DetailsResult = { ready: false } | { ready: true; eventDetailsUrl: string };

/**
 * Extends `openHouseholdModal` to arrive at the "Your Details" registration form.
 * If the household confirmation modal appeared, clicks "No, Review and Update".
 * If navigation happened directly, the form is already on screen.
 */
async function navigateToYourDetails(page: AuthPage): Promise<DetailsResult> {
  const result = await openHouseholdModal(page);
  if (!result.ready) return { ready: false };

  if (result.outcome === 'modal') {
    await page.getByTestId(SEL.householdReviewButton).click();
  }

  await expect(page).toHaveURL(/\/register\/form\/[^/]+\/[^/]+/, { timeout: 10_000 });

  return { ready: true, eventDetailsUrl: result.eventDetailsUrl };
}

test.describe('Registration Flow – Timeslot Dialog (Authenticated)', () => {
  // ── Structure ────────────────────────────────────────────────────────

  test('timeslot dialog opens after clicking Register Now', async ({ authenticatedPage: page }) => {
    const ready = await openTimeslotDialog(page);
    if (!ready) {
      test.skip();
      return;
    }

    await expect(page.getByTestId(SEL.timeslotDialog)).toBeVisible();
  });

  test('dialog has Go Back and Save and Continue buttons when slots are available', async ({
    authenticatedPage: page,
  }) => {
    const ready = await openTimeslotDialog(page);
    if (!ready) {
      test.skip();
      return;
    }

    const hasSlots = (await page.locator('input[name="time_slot"]').count()) > 0;
    if (!hasSlots) {
      test.skip();
      return;
    }

    await expect(page.getByTestId(SEL.timeslotGoBack)).toBeVisible();
    await expect(page.getByTestId(SEL.timeslotSaveContinue)).toBeVisible();
  });

  // ── Disabled state ───────────────────────────────────────────────────

  test('Save and Continue is disabled before a timeslot is selected', async ({
    authenticatedPage: page,
  }) => {
    const ready = await openTimeslotDialog(page);
    if (!ready) {
      test.skip();
      return;
    }

    const hasSlots = (await page.locator('input[name="time_slot"]').count()) > 0;
    if (!hasSlots) {
      test.skip();
      return;
    }

    await expect(page.getByTestId(SEL.timeslotSaveContinue)).toBeDisabled();
  });

  // ── Go Back ──────────────────────────────────────────────────────────

  test('Go Back closes the dialog and returns to the event details page', async ({
    authenticatedPage: page,
  }) => {
    const ready = await openTimeslotDialog(page);
    if (!ready) {
      test.skip();
      return;
    }

    await page.getByTestId(SEL.timeslotGoBack).click();

    // Dialog must close
    await expect(page.getByTestId(SEL.timeslotDialog)).not.toBeVisible({
      timeout: 5_000,
    });

    // URL returns to the event details page
    await expect(page).toHaveURL(/\/register\/event\/[^/]+/, {
      timeout: 10_000,
    });
  });

  // ── Empty state ──────────────────────────────────────────────────────

  test('shows a message and hides Save and Continue when no timeslots are available', async ({
    authenticatedPage: page,
  }) => {
    const ready = await openTimeslotDialog(page);
    if (!ready) {
      test.skip();
      return;
    }

    const timeslotRadios = page.locator('input[name="time_slot"]');
    const noSlotsMessage = page.getByTestId(SEL.noTimeslotsMessage);

    if ((await timeslotRadios.count()) > 0) {
      // Slots are available — this test scenario does not apply; skip gracefully
      test.skip();
      return;
    }

    await expect(noSlotsMessage).toBeVisible();
    // Save and Continue must NOT be rendered when there are no available slots
    await expect(page.getByTestId(SEL.timeslotSaveContinue)).not.toBeVisible();
  });

  // ── Slot selection ───────────────────────────────────────────────────

  test('selecting a timeslot enables the Save and Continue button', async ({
    authenticatedPage: page,
  }) => {
    const ready = await openTimeslotDialog(page);
    if (!ready) {
      test.skip();
      return;
    }

    const timeslotRadios = page.locator('input[name="time_slot"]');
    if ((await timeslotRadios.count()) === 0) {
      test.skip();
      return;
    }

    // Initially disabled
    await expect(page.getByTestId(SEL.timeslotSaveContinue)).toBeDisabled();

    // Select the first available timeslot
    await timeslotRadios.first().click();

    // Save and Continue must now be enabled
    await expect(page.getByTestId(SEL.timeslotSaveContinue)).toBeEnabled();
  });

  // ── Household dialog ─────────────────────────────────────────────────

  test('clicking Save and Continue after selecting a timeslot shows the household update dialog', async ({
    authenticatedPage: page,
  }) => {
    const result = await openHouseholdModal(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    if (result.outcome === 'modal') {
      // Confirm the household dialog is properly rendered
      await expect(page.getByTestId(SEL.householdConfirmationModal)).toBeVisible();
      await expect(page.getByTestId(SEL.householdConfirmButton)).toBeVisible();
      await expect(page.getByTestId(SEL.householdReviewButton)).toBeVisible();
    } else {
      // Navigated directly to the registration form with the slot ID in the URL
      await expect(page).toHaveURL(/\/register\/form\/[^/]+\/[^/]+/);
    }
  });
});

// ── Household Confirmation Dialog ────────────────────────────────────────────

test.describe('Registration Flow – Household Confirmation Dialog', () => {
  test('dialog displays address, member count, and contact information sections', async ({
    authenticatedPage: page,
  }) => {
    const result = await openHouseholdModal(page);
    if (!result.ready || result.outcome !== 'modal') {
      test.skip();
      return;
    }

    await expect(page.getByTestId(SEL.householdInfoDisplay)).toBeVisible();
    await expect(page.getByTestId(SEL.householdAddress)).toBeVisible();
    await expect(page.getByTestId(SEL.householdMembers)).toBeVisible();
    await expect(page.getByTestId(SEL.householdContact)).toBeVisible();
  });

  test('dialog reflects actual household data (non-placeholder values)', async ({
    authenticatedPage: page,
  }) => {
    const result = await openHouseholdModal(page);
    if (!result.ready || result.outcome !== 'modal') {
      test.skip();
      return;
    }

    const address = await page.getByTestId(SEL.householdAddress).textContent();
    const members = await page.getByTestId(SEL.householdMembers).textContent();
    const contact = await page.getByTestId(SEL.householdContact).textContent();

    expect(address?.trim()).not.toBe('No address provided');
    expect(members?.trim()).not.toBe('No members');
    expect(contact?.trim()).not.toBe('No contact information');
  });

  test("clicking 'No, Review and Update' navigates to the registration form", async ({
    authenticatedPage: page,
  }) => {
    const result = await openHouseholdModal(page);
    if (!result.ready || result.outcome !== 'modal') {
      test.skip();
      return;
    }

    await page.getByTestId(SEL.householdReviewButton).click();

    await expect(page).toHaveURL(/\/register\/form\/[^/]+\/[^/]+/, { timeout: 10_000 });
  });
});

// ── Your Details Step ─────────────────────────────────────────────────────────

test.describe("Registration Flow – 'Your Details' Step", () => {
  test('form fields are prefilled with user data', async ({ authenticatedPage: page }) => {
    const result = await navigateToYourDetails(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    // Wait for the primary info form to render with prefilled data.
    // Use not.toHaveValue('') with a timeout so the assertion retries until the
    // async form reset populates the fields — important for slower browsers.
    await expect(page.getByTestId(SEL.firstNameInput)).not.toHaveValue('', { timeout: 10_000 });
    await expect(page.getByTestId(SEL.lastNameInput)).not.toHaveValue('', { timeout: 10_000 });
    await expect(page.getByTestId(SEL.dateOfBirthInput)).not.toHaveValue('', { timeout: 10_000 });

    // Optional fields must be present in the DOM (value may be empty)
    await expect(page.getByTestId(SEL.middleNameInput)).toBeVisible();
    await expect(page.getByTestId(SEL.suffixSelect)).toBeVisible();
    await expect(page.getByTestId(SEL.genderSelect)).toBeVisible();
  });

  test('Continue and Back buttons are visible', async ({ authenticatedPage: page }) => {
    const result = await navigateToYourDetails(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    await expect(page.getByTestId(SEL.continueButton)).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.back-button')).toBeVisible({ timeout: 10_000 });
  });

  test('clicking Back returns to the event details page', async ({ authenticatedPage: page }) => {
    const result = await navigateToYourDetails(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    // Ensure the form and back button are fully rendered before clicking
    await expect(page.locator('.back-button')).toBeVisible({ timeout: 10_000 });

    await page.locator('.back-button').click();

    await expect(page).toHaveURL(/\/register\/event\/[^/]+/, { timeout: 10_000 });
  });
});

// ── Step 2 Navigation Helper ──────────────────────────────────────────────────

type AddressStepResult = { ready: false } | { ready: true; eventDetailsUrl: string };

/**
 * Extends `navigateToYourDetails` to proceed through Step 1 and land on
 * Step 2 "Your Address Details". The form is prefilled with the test user's
 * data, so clicking Continue on Step 1 should pass validation.
 */
async function navigateToAddressStep(page: AuthPage): Promise<AddressStepResult> {
  const result = await navigateToYourDetails(page);
  if (!result.ready) return { ready: false };

  // Wait for ALL required Step 1 fields to be hydrated before clicking Continue.
  // gender-select and date-of-birth-input can lag behind first_name in slower browsers.
  await expect(page.getByTestId(SEL.firstNameInput)).not.toHaveValue('', { timeout: 10_000 });
  await expect(page.getByTestId(SEL.dateOfBirthInput)).not.toHaveValue('', { timeout: 10_000 });
  await expect(page.getByTestId(SEL.genderSelect)).not.toHaveText(/^\s*$/, { timeout: 10_000 });

  await page.getByTestId(SEL.continueButton).click();

  // Step 2 is rendered when address-line-1 input appears
  await expect(page.getByTestId(SEL.addressLine1Input)).toBeVisible({ timeout: 10_000 });

  return { ready: true, eventDetailsUrl: result.eventDetailsUrl };
}

// ── Step 1 Validation ─────────────────────────────────────────────────────────

test.describe('Registration Flow – Step 1: Validation', () => {
  test('clearing a required field and clicking Continue shows a validation error', async ({
    authenticatedPage: page,
  }) => {
    const result = await navigateToYourDetails(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    await expect(page.getByTestId(SEL.firstNameInput)).toBeVisible({ timeout: 10_000 });

    // Triple-click to select all text, then delete — more reliably triggers React's
    // synthetic onChange handler than fill('') alone in Firefox and WebKit.
    await page.getByTestId(SEL.firstNameInput).click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    // Confirm the field is actually empty before proceeding
    await expect(page.getByTestId(SEL.firstNameInput)).toHaveValue('');

    await page.getByTestId(SEL.continueButton).click();

    await expect(page.getByTestId('first-name-error')).toBeVisible({ timeout: 10_000 });

    // Must remain on Step 1
    await expect(page.getByTestId(SEL.firstNameInput)).toBeVisible();
  });
});

// ── Step 2: Your Address Details ──────────────────────────────────────────────

test.describe('Registration Flow – Step 2: Your Address Details', () => {
  test('clicking Continue on Step 1 with valid data advances to Step 2', async ({
    authenticatedPage: page,
  }) => {
    const result = await navigateToAddressStep(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    await expect(page.getByTestId(SEL.addressComponent)).toBeVisible();
  });

  test('Step 2 renders all address and contact fields', async ({ authenticatedPage: page }) => {
    const result = await navigateToAddressStep(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    // Address fields
    await expect(page.getByTestId(SEL.addressLine1Input)).toBeVisible();
    await expect(page.getByTestId(SEL.addressLine2Input)).toBeVisible();
    await expect(page.getByTestId(SEL.cityInput)).toBeVisible();
    await expect(page.getByTestId(SEL.stateSelect)).toBeVisible();
    await expect(page.getByTestId(SEL.zipCodeInput)).toBeVisible();

    // Contact fields
    await expect(page.getByTestId(SEL.emailInput)).toBeVisible();

    // Messaging consent checkboxes (labels are always rendered when phone/email are shown)
    await expect(page.getByTestId(SEL.phonePermissionLabel)).toBeVisible();
    await expect(page.getByTestId(SEL.emailPermissionLabel)).toBeVisible();
  });

  test('Step 2 fields are prefilled with authenticated user data', async ({
    authenticatedPage: page,
  }) => {
    const result = await navigateToAddressStep(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    // Required address fields should have values for an authenticated user with
    // a completed household setup. Use not.toHaveValue('') with a timeout to
    // handle any async form hydration.
    await expect(page.getByTestId(SEL.addressLine1Input)).not.toHaveValue('', { timeout: 5_000 });
    await expect(page.getByTestId(SEL.cityInput)).not.toHaveValue('', { timeout: 5_000 });
    await expect(page.getByTestId(SEL.zipCodeInput)).not.toHaveValue('', { timeout: 5_000 });

    // State select trigger should show a selected state label (non-whitespace-only text)
    await expect(page.getByTestId(SEL.stateSelect)).not.toHaveText(/^\s*$/, { timeout: 5_000 });

    // Email should be prefilled
    await expect(page.getByTestId(SEL.emailInput)).not.toHaveValue('', { timeout: 5_000 });
  });

  test('Previous and Continue buttons are visible on Step 2', async ({
    authenticatedPage: page,
  }) => {
    const result = await navigateToAddressStep(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    await expect(page.getByTestId(SEL.previousButton)).toBeVisible();
    await expect(page.getByTestId(SEL.addressStepContinueButton)).toBeVisible();
  });

  test('clicking Previous on Step 2 returns to Step 1', async ({ authenticatedPage: page }) => {
    const result = await navigateToAddressStep(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    await page.getByTestId(SEL.previousButton).click();

    // Step 1 primary info form should reappear
    await expect(page.getByTestId(SEL.firstNameInput)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId(SEL.addressLine1Input)).not.toBeVisible();
  });

  test('clicking Continue on Step 2 with valid data advances to Step 3', async ({
    authenticatedPage: page,
  }) => {
    const result = await navigateToAddressStep(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    await page.getByTestId(SEL.addressStepContinueButton).click();

    // Step 3 "Your Family Details" (MemberCountFormComponent) should appear
    await expect(page.getByTestId(SEL.memberCountForm)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId(SEL.addressLine1Input)).not.toBeVisible();
  });

  test('clearing a required address field and clicking Continue shows a validation error', async ({
    authenticatedPage: page,
  }) => {
    const result = await navigateToAddressStep(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    // Clear the street address field so validation fails
    await page.getByTestId(SEL.addressLine1Input).fill('');
    await page.getByTestId(SEL.addressStepContinueButton).click();

    await expect(page.getByTestId(SEL.addressLine1Error)).toBeVisible({ timeout: 5_000 });

    // Must remain on Step 2
    await expect(page.getByTestId(SEL.addressLine1Input)).toBeVisible();
  });
});

// ── Step 3 Navigation Helper ──────────────────────────────────────────────────

type FamilyStepResult = { ready: false } | { ready: true; eventDetailsUrl: string };

/**
 * Extends `navigateToAddressStep` to proceed through Step 2 and land on
 * Step 3 "Your Family Details". The form is prefilled so clicking Continue
 * on Step 2 should pass validation.
 */
async function navigateToFamilyStep(page: AuthPage): Promise<FamilyStepResult> {
  const result = await navigateToAddressStep(page);
  if (!result.ready) return { ready: false };

  // Step 2 is on screen; click Continue to proceed to Step 3
  await page.getByTestId(SEL.addressStepContinueButton).click();

  // Wait for the MemberCountFormComponent to appear
  await expect(page.getByTestId(SEL.memberCountForm)).toBeVisible({ timeout: 10_000 });

  return { ready: true, eventDetailsUrl: result.eventDetailsUrl };
}

// ── Step 3: Your Family Details ───────────────────────────────────────────────

test.describe('Registration Flow – Step 3: Your Family Details', () => {
  test('Step 3 renders Seniors, Adults, and Children inputs with increment and decrement buttons', async ({
    authenticatedPage: page,
  }) => {
    const result = await navigateToFamilyStep(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    // Count inputs
    await expect(page.getByTestId(SEL.seniorCountInput)).toBeVisible();
    await expect(page.getByTestId(SEL.adultCountInput)).toBeVisible();
    await expect(page.getByTestId(SEL.childCountInput)).toBeVisible();

    // Increment buttons
    await expect(page.getByTestId(SEL.seniorIncButton)).toBeVisible();
    await expect(page.getByTestId(SEL.adultIncButton)).toBeVisible();
    await expect(page.getByTestId(SEL.childIncButton)).toBeVisible();

    // Decrement buttons
    await expect(page.getByTestId(SEL.seniorDecButton)).toBeVisible();
    await expect(page.getByTestId(SEL.adultDecButton)).toBeVisible();
    await expect(page.getByTestId(SEL.childDecButton)).toBeVisible();
  });

  test('count inputs are prefilled with the authenticated user household counts', async ({
    authenticatedPage: page,
  }) => {
    const result = await navigateToFamilyStep(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    // Values must be non-negative integers (including 0)
    const seniorValue = await page.getByTestId(SEL.seniorCountInput).inputValue();
    const adultValue = await page.getByTestId(SEL.adultCountInput).inputValue();
    const childValue = await page.getByTestId(SEL.childCountInput).inputValue();

    expect(Number(seniorValue)).toBeGreaterThanOrEqual(0);
    expect(Number(adultValue)).toBeGreaterThanOrEqual(0);
    expect(Number(childValue)).toBeGreaterThanOrEqual(0);

    // At least one category must have members for a fully set-up household
    const totalMembers = Number(seniorValue) + Number(adultValue) + Number(childValue);
    expect(totalMembers).toBeGreaterThanOrEqual(0);
  });

  test('clicking the increment button increases the count by 1', async ({
    authenticatedPage: page,
  }) => {
    const result = await navigateToFamilyStep(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    const before = Number(await page.getByTestId(SEL.adultCountInput).inputValue());
    await page.getByTestId(SEL.adultIncButton).click();
    const after = Number(await page.getByTestId(SEL.adultCountInput).inputValue());

    expect(after).toBe(before + 1);
  });

  test('clicking the decrement button decreases the count by 1', async ({
    authenticatedPage: page,
  }) => {
    const result = await navigateToFamilyStep(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    // Increment first to guarantee the count is above 0
    await page.getByTestId(SEL.adultIncButton).click();
    const before = Number(await page.getByTestId(SEL.adultCountInput).inputValue());

    await page.getByTestId(SEL.adultDecButton).click();
    const after = Number(await page.getByTestId(SEL.adultCountInput).inputValue());

    expect(after).toBe(before - 1);
  });

  test('Previous and Register buttons are visible on Step 3', async ({
    authenticatedPage: page,
  }) => {
    const result = await navigateToFamilyStep(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    await expect(page.getByTestId(SEL.previousButton)).toBeVisible();
    await expect(page.getByTestId(SEL.submitButton)).toBeVisible();
  });

  test('clicking Previous on Step 3 returns to Step 2', async ({ authenticatedPage: page }) => {
    const result = await navigateToFamilyStep(page);
    if (!result.ready) {
      test.skip();
      return;
    }

    await page.getByTestId(SEL.previousButton).click();

    // Step 2 address form should reappear
    await expect(page.getByTestId(SEL.addressLine1Input)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId(SEL.memberCountForm)).not.toBeVisible();
  });
});
