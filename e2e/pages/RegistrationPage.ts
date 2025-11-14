import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { RegistrationSelectors } from '../utils/selectors';
import { RegistrationFormData } from '../fixtures/test-data';

/**
 * Registration Page Object
 * 
 * Handles interactions with the multi-step registration form
 */
export class RegistrationPage extends BasePage {
  /**
   * Navigate to registration page with status return
   * @param eventDateId - Event date ID (required for valid registration)
   * @param eventSlotId - Optional event slot ID
   * @returns Object with status: 'success' | 'redirected' | 'error' and optional message
   */
  async navigateToRegistration(eventDateId: string, eventSlotId?: string): Promise<{ status: 'success' | 'redirected' | 'error'; message?: string }> {
    // Registration form URL format: /register/form/:eventDateId or /register/form/:eventDateId/:eventSlotId
    // Use path parameters as per route definition
    let url = `/register/form`;
    if (eventDateId && eventDateId !== 'test-event-date-id') {
      // Use path parameters: /register/form/:eventDateId
      url = `/register/form/${eventDateId}`;
      if (eventSlotId) {
        url += `/${eventSlotId}`;
      }
    } else {
      // For test eventDateId, use base form URL (may redirect)
      url = `/register/form`;
    }

    await this.page.goto(url);
    await this.waitForLoad();
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });

    // Handle authentication modal if user is not authenticated
    const authModal = this.page.locator('[role="dialog"]:has-text(/sign|login|authenticate/i), [data-testid*="auth"], [data-testid*="login"]').first();
    const isAuthModalVisible = await authModal.isVisible({ timeout: 3000 }).catch(() => false);

    if (isAuthModalVisible) {
      // User needs to authenticate - try to continue as guest or sign in
      const continueAsGuestButton = this.page.getByRole('button', { name: /continue as guest/i }).first();
      const guestButtonVisible = await continueAsGuestButton.isVisible({ timeout: 2000 }).catch(() => false);

      if (guestButtonVisible) {
        await continueAsGuestButton.click();
        await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      } else {
        return {
          status: 'error',
          message: 'Authentication required. Please sign in or continue as guest.'
        };
      }
    }

    // Handle timeslot selection modal if event accepts reservations and no eventSlotId provided
    if (!eventSlotId) {
      // Wait a bit for modal to appear (it shows automatically when acceptReservations === 1)
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });

      // Check for timeslot modal - try multiple selectors
      const timeslotModalSelectors = [
        '[id="timeslot-modal-title"]',
        '[role="dialog"]:has-text(/time slot|choose time/i)',
        'dialog:has-text(/choose time slot/i)',
        '[role="dialog"]:has([id="timeslot-modal-title"])'
      ];

      let isTimeslotModalVisible = false;
      for (const selector of timeslotModalSelectors) {
        const modal = this.page.locator(selector).first();
        isTimeslotModalVisible = await modal.isVisible({ timeout: 3000 }).catch(() => false);
        if (isTimeslotModalVisible) break;
      }

      if (isTimeslotModalVisible) {
        console.log('[RegistrationPage] Timeslot modal is visible, selecting timeslot...');

        // Wait for timeslots to load (check for loading spinner first)
        const loadingSpinner = this.page.locator('[role="status"][aria-label*="Loading"]').first();
        await loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => { });

        // Wait for radio buttons to appear
        const timeslotRadio = this.page.locator('input[type="radio"][name="time_slot"]').first();
        await timeslotRadio.waitFor({ state: 'visible', timeout: 10000 });

        // Select first available timeslot
        const firstSlot = this.page.locator('input[type="radio"][name="time_slot"]').first();
        const isSlotAvailable = await firstSlot.isEnabled({ timeout: 2000 }).catch(() => false);

        if (isSlotAvailable) {
          await firstSlot.click();

          // Wait a moment for the selection to register
          await this.page.waitForTimeout(500);

          // Click "Save and Continue" button - try multiple selectors
          const saveButtonSelectors = [
            'button:has-text("Save and Continue")',
            'button:has-text(/save.*continue/i)',
            'button[type="submit"]:has-text(/continue/i)',
            'button:has-text("Continue")'
          ];

          let clicked = false;
          for (const selector of saveButtonSelectors) {
            const button = this.page.locator(selector).first();
            const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible && await button.isEnabled({ timeout: 500 }).catch(() => false)) {
              await button.click();
              clicked = true;
              break;
            }
          }

          if (clicked) {
            // Wait for navigation to form with slot ID
            await this.page.waitForURL(/\/register\/form\/[^\/]+\/[^\/]+/, { timeout: 15000 });
            await this.page.waitForLoadState('networkidle', { timeout: 10000 });
            console.log(`[RegistrationPage] Navigated to: ${this.page.url()}`);
          } else {
            return {
              status: 'error',
              message: 'Could not find or click "Save and Continue" button in timeslot modal.'
            };
          }
        } else {
          return {
            status: 'error',
            message: 'No available timeslots found for this event.'
          };
        }
      } else {
        console.log('[RegistrationPage] Timeslot modal not visible - event may not require timeslot selection');
      }
    }

    // Check if we got redirected
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });
    let currentUrl = this.page.url();
    const isErrorPage = await this.page.locator('text=/page not found|error|404/i').first().isVisible({ timeout: 2000 }).catch(() => false);
    let isOnHomePage = currentUrl.endsWith('/') && !currentUrl.includes('/register');
    const isOnLoginPage = currentUrl.includes('/login');
    let isOnRegisterForm = currentUrl.includes('/register/form');
    const isOnAlreadyRegistered = currentUrl.includes('/register/already-registered');

    // If we got redirected to home, try navigating again (might be a transient issue)
    if (isOnHomePage && !isOnRegisterForm && !isOnAlreadyRegistered) {
      // Wait a bit more and check again
      await this.page.waitForTimeout(2000);
      currentUrl = this.page.url();
      isOnHomePage = currentUrl.endsWith('/') && !currentUrl.includes('/register');
      isOnRegisterForm = currentUrl.includes('/register/form');
      const isOnAlreadyRegistered2 = currentUrl.includes('/register/already-registered');

      // If still on home page, try navigating once more
      if (isOnHomePage && !isOnRegisterForm && !isOnAlreadyRegistered2) {
        await this.page.goto(url);
        await this.waitForLoad();
        await this.page.waitForLoadState('networkidle', { timeout: 15000 });
        await this.page.waitForTimeout(3000);
        currentUrl = this.page.url();
        isOnHomePage = currentUrl.endsWith('/') && !currentUrl.includes('/register');
        isOnRegisterForm = currentUrl.includes('/register/form');
      }
    }

    // If we're on login page, we need authentication
    if (isOnLoginPage) {
      return {
        status: 'error',
        message: 'Registration form requires authentication. Please sign in first.'
      };
    }

    // If redirected to already registered page
    if (isOnAlreadyRegistered) {
      return {
        status: 'redirected',
        message: `User is already registered for eventDateId: ${eventDateId}`
      };
    }

    // If redirected to home page (likely invalid eventDateId or already registered)
    if (isOnHomePage && !isOnRegisterForm) {
      return {
        status: 'redirected',
        message: `Registration form redirected to home page. The eventDateId (${eventDateId}) might be invalid or user might already be registered.`
      };
    }

    // Only throw error if we're definitely on an error page
    if (isErrorPage && !isOnHomePage && !isOnLoginPage) {
      return {
        status: 'error',
        message: 'Registration form requires a valid eventDateId. Navigate from an event details page first.'
      };
    }

    // Wait for form to be visible (with longer timeout)
    const firstNameInput = this.locator(RegistrationSelectors.firstNameInput).first();
    try {
      await firstNameInput.waitFor({ state: 'visible', timeout: 15000 });
      return { status: 'success' };
    } catch (error) {
      // If form is not visible, check what page we're on
      const finalUrl = this.page.url();
      if (finalUrl.endsWith('/') && !finalUrl.includes('/register')) {
        // Form redirected to home - this might mean user is already registered or event is invalid
        return {
          status: 'redirected',
          message: `Registration form redirected to home page. The eventDateId (${eventDateId}) might be invalid or the user might already be registered for this event.`
        };
      }
      return {
        status: 'error',
        message: `Registration form is not visible. Current URL: ${finalUrl}`
      };
    }
  }

  /**
   * Navigate to registration page (compatible with BasePage interface)
   * @param eventDateId - Event date ID (required for valid registration)
   * @param eventSlotId - Optional event slot ID
   */
  async navigate(eventDateId: string, eventSlotId?: string): Promise<void> {
    const result = await this.navigateToRegistration(eventDateId, eventSlotId);
    if (result.status === 'error') {
      throw new Error(result.message || 'Failed to navigate to registration form');
    }
    // For 'redirected' status, we don't throw - let the test handle it
  }

  /**
   * Fill Step 0: Primary Information
   */
  async fillStep0(data: { firstName: string; lastName: string; dateOfBirth: string; gender: string }): Promise<void> {
    // First, check if timeslot modal is still visible (shouldn't be, but just in case)
    const timeslotModal = this.page.locator('[id="timeslot-modal-title"], [role="dialog"]:has-text(/time slot|choose time/i)').first();
    const isTimeslotModalVisible = await timeslotModal.isVisible({ timeout: 2000 }).catch(() => false);

    if (isTimeslotModalVisible) {
      console.log('[RegistrationPage.fillStep0] Timeslot modal still visible, waiting for it to close...');
      // Wait for modal to close (should happen after slot selection)
      await timeslotModal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => { });
    }

    // Wait for form to be visible - try multiple selectors with longer timeout
    const firstNameInput = this.locator(RegistrationSelectors.firstNameInput).first();
    const formContainer = this.locator(RegistrationSelectors.householdForm).first();

    // Wait for form to appear - check multiple ways
    let formVisible = false;
    try {
      // Check if input exists first
      const inputExists = await firstNameInput.count() > 0;
      if (inputExists) {
        await firstNameInput.waitFor({ state: 'visible', timeout: 15000 });
        formVisible = true;
      } else {
        // Try form container
        const containerExists = await formContainer.count() > 0;
        if (containerExists) {
          await formContainer.waitFor({ state: 'visible', timeout: 15000 });
          formVisible = true;
        }
      }
    } catch (error) {
      // Try waiting a bit more and check again
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });
      formVisible = await firstNameInput.isVisible({ timeout: 3000 }).catch(() => false);

      if (!formVisible) {
        // Check if we're on a different step or page
        const addressInput = this.locator(RegistrationSelectors.addressInput).first();
        const isOnStep1 = await addressInput.isVisible({ timeout: 2000 }).catch(() => false);

        if (isOnStep1) {
          throw new Error('Already on Step 1. Cannot fill Step 0.');
        }

        // Check if there's a loading spinner
        const spinner = this.page.locator('[role="status"], .spinner, [class*="loading"]').first();
        const isSpinnerVisible = await spinner.isVisible({ timeout: 2000 }).catch(() => false);

        if (isSpinnerVisible) {
          await spinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => { });
          formVisible = await firstNameInput.isVisible({ timeout: 5000 }).catch(() => false);
        }

        if (!formVisible) {
          // Check current URL to see where we are
          const currentUrl = this.page.url();
          throw new Error(`Registration form Step 0 is not visible. Current URL: ${currentUrl}`);
        }
      }
    }

    if (!formVisible) {
      throw new Error('Registration form Step 0 is not visible after waiting.');
    }

    // Small delay for form to stabilize
    await this.page.waitForLoadState('domcontentloaded').catch(() => { });

    await this.fill(RegistrationSelectors.firstNameInput, data.firstName);
    await this.fill(RegistrationSelectors.lastNameInput, data.lastName);
    await this.fill(RegistrationSelectors.dateOfBirthInput, data.dateOfBirth);
    await this.page.selectOption(RegistrationSelectors.genderSelect, data.gender);
  }

  /**
   * Fill Step 1: Address Information
   */
  async fillStep1(data: { address: string; city: string; state: string; zipCode: string; phone: string }): Promise<void> {
    // Wait for Step 1 to be visible after navigation from Step 0
    const addressInput = this.locator(RegistrationSelectors.addressInput).first();

    // Wait for step transition to complete
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });
    await this.page.waitForTimeout(1000); // Give time for step transition

    // Check if input exists first
    const inputExists = await addressInput.count() > 0;
    if (inputExists) {
      await addressInput.waitFor({ state: 'visible', timeout: 15000 });
    } else {
      // Input doesn't exist yet, wait a bit more
      await this.page.waitForTimeout(2000);
      await addressInput.waitFor({ state: 'visible', timeout: 15000 });
    }

    await this.page.waitForTimeout(500); // Small delay for form to stabilize

    await this.fill(RegistrationSelectors.addressInput, data.address);
    await this.fill(RegistrationSelectors.cityInput, data.city);
    await this.page.selectOption(RegistrationSelectors.stateSelect, data.state);
    await this.fill(RegistrationSelectors.zipCodeInput, data.zipCode);
    await this.fill(RegistrationSelectors.phoneInput, data.phone);
  }

  /**
   * Fill Step 2: Family Member Counts
   */
  async fillStep2(data: { adultCount: number; childCount: number }): Promise<void> {
    console.log(`[RegistrationPage.fillStep2] Filling Step 2 with adultCount: ${data.adultCount}, childCount: ${data.childCount}`);

    // Try multiple selectors for adults input
    const adultsSelectors = [
      '#adults_in_household',
      'input[name="adults_in_household"]',
      'input[id*="adult"]',
      'input[name*="adult"]',
      'label:has-text("Adult") + input',
      'label:has-text("Adults") + input'
    ];

    let adultsFilled = false;
    for (const selector of adultsSelectors) {
      const input = this.locator(selector).first();
      const exists = await input.count() > 0;
      if (exists) {
        const isVisible = await input.isVisible({ timeout: 2000 }).catch(() => false);
        if (isVisible) {
          await this.fill(selector, data.adultCount.toString());
          adultsFilled = true;
          break;
        }
      }
    }

    if (!adultsFilled) {
      console.log('[RegistrationPage.fillStep2] Adults input not found, trying children input...');
    }

    // Try multiple selectors for children input
    const childrenSelectors = [
      '#children_in_household',
      'input[name="children_in_household"]',
      'input[id*="child"]',
      'input[name*="child"]',
      'label:has-text("Child") + input',
      'label:has-text("Children") + input'
    ];

    let childrenFilled = false;
    for (const selector of childrenSelectors) {
      const input = this.locator(selector).first();
      const exists = await input.count() > 0;
      if (exists) {
        const isVisible = await input.isVisible({ timeout: 2000 }).catch(() => false);
        if (isVisible) {
          await this.fill(selector, data.childCount.toString());
          childrenFilled = true;
          break;
        }
      }
    }

    if (!adultsFilled || !childrenFilled) {
      console.log(`[RegistrationPage.fillStep2] Adults filled: ${adultsFilled}, Children filled: ${childrenFilled}`);
      // If inputs not found, they might already be prefilled or on a different step
    }

    // After filling, trigger validation by blurring the last input
    if (adultsFilled || childrenFilled) {
      // Trigger form validation by clicking outside or blurring
      await this.page.waitForTimeout(300);
      // Click on a label or empty space to trigger blur
      const formContainer = this.locator(RegistrationSelectors.householdForm).first();
      await formContainer.click({ position: { x: 10, y: 10 } }).catch(() => { });
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Click next button
   */
  async clickNext(): Promise<void> {
    // Try multiple selectors for the Continue button
    const continueSelectors = [
      '[data-testid="continue-button"]',
      '[data-testid="continue button"]',
      'button:has-text("Continue"):not(:has-text("Save and Continue"))',
      'button:has-text("Next")'
    ];

    let clicked = false;
    for (const selector of continueSelectors) {
      const button = this.locator(selector).first();
      const exists = await button.count() > 0;
      if (exists) {
        const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);
        const isEnabled = isVisible ? await button.isEnabled({ timeout: 1000 }).catch(() => false) : false;

        if (isVisible && isEnabled) {
          console.log(`[RegistrationPage.clickNext] Clicking Continue button with selector: ${selector}`);
          try {
            // Scroll into view and wait a moment
            await button.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(200);

            // Click the button
            await button.click({ timeout: 5000 });

            // Wait a moment to ensure click registered
            await this.page.waitForTimeout(300);

            clicked = true;
            console.log(`[RegistrationPage.clickNext] Successfully clicked Continue button`);
            break;
          } catch (error: any) {
            console.log(`[RegistrationPage.clickNext] Error clicking button: ${error?.message || error}`);
            // Try next selector
            continue;
          }
        } else {
          console.log(`[RegistrationPage.clickNext] Button found but not visible/enabled: ${selector} (visible: ${isVisible}, enabled: ${isEnabled})`);
        }
      }
    }

    if (!clicked) {
      console.log('[RegistrationPage.clickNext] No Continue button found/clickable, trying fallback...');
      // Fallback - try to click any visible Continue button
      const anyContinueButton = this.page.locator('button:has-text("Continue")').first();
      const anyVisible = await anyContinueButton.isVisible({ timeout: 2000 }).catch(() => false);
      if (anyVisible) {
        await anyContinueButton.click();
        clicked = true;
      }
    }

    if (!clicked) {
      throw new Error('Could not find or click Continue button');
    }

    await this.waitForLoad();
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });
  }

  /**
   * Click previous button
   */
  async clickPrevious(): Promise<void> {
    await this.click(RegistrationSelectors.previousButton);
    await this.waitForLoad();
  }

  /**
   * Select event slot
   */
  async selectEventSlot(slotIndex: number = 0): Promise<void> {
    const slots = this.locator(RegistrationSelectors.eventSlot);
    await slots.nth(slotIndex).click();
    await this.waitForLoad();
  }

  /**
   * Submit registration
   */
  async submitRegistration(): Promise<void> {
    // Wait for final step to be ready
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });
    await this.page.waitForTimeout(1000);

    // Try multiple selectors for Register button (not "Submit")
    const submitSelectors = [
      '[data-testid="submit-button"]', // This is the actual testid
      'button:has-text("Register"):not(:has-text("Registering"))', // Button text is "Register"
      'button[type="submit"]:not(:disabled)',
      'button:has-text("Submit")',
      '[data-testid*="submit"]',
      '[data-testid*="register"]'
    ];

    // First, check if submit button exists at all
    const allButtons = await this.page.locator('button').all();
    console.log(`[RegistrationPage.submitRegistration] Found ${allButtons.length} buttons on page`);
    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      const buttonText = await allButtons[i].textContent();
      const buttonTestId = await allButtons[i].getAttribute('data-testid');
      const buttonType = await allButtons[i].getAttribute('type');
      const isVisible = await allButtons[i].isVisible().catch(() => false);
      console.log(`[RegistrationPage.submitRegistration] Button ${i}: "${buttonText}" (testid: ${buttonTestId}, type: ${buttonType}, visible: ${isVisible})`);
    }

    let clicked = false;
    for (const selector of submitSelectors) {
      const button = this.locator(selector).first();
      const exists = await button.count() > 0;
      if (exists) {
        const isVisible = await button.isVisible({ timeout: 3000 }).catch(() => false);
        const isEnabled = isVisible ? await button.isEnabled({ timeout: 1000 }).catch(() => false) : false;

        console.log(`[RegistrationPage.submitRegistration] Button with selector "${selector}": exists=${exists}, visible=${isVisible}, enabled=${isEnabled}`);

        if (isVisible && isEnabled) {
          console.log(`[RegistrationPage.submitRegistration] Clicking submit button with selector: ${selector}`);
          await button.click();
          clicked = true;
          break;
        }
      }
    }

    if (!clicked) {
      // Maybe we need to click Continue one or more times to get to final step
      let continueClicks = 0;
      const maxContinueClicks = 3; // Maximum number of Continue clicks to try

      while (continueClicks < maxContinueClicks && !clicked) {
        const continueButton = this.locator('[data-testid="continue-button"], [data-testid="continue button"]').first();
        const continueVisible = await continueButton.isVisible({ timeout: 2000 }).catch(() => false);

        if (continueVisible) {
          console.log(`[RegistrationPage.submitRegistration] Submit button not found, clicking Continue (attempt ${continueClicks + 1}/${maxContinueClicks})...`);
          await continueButton.click();
          await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });
          await this.page.waitForTimeout(2000); // Wait longer for step transition

          // Check for submit button again
          const submitButton = this.locator('[data-testid="submit-button"]').first();
          const submitExists = await submitButton.count() > 0;
          const submitVisible = submitExists ? await submitButton.isVisible({ timeout: 3000 }).catch(() => false) : false;
          const submitEnabled = submitVisible ? await submitButton.isEnabled({ timeout: 1000 }).catch(() => false) : false;

          console.log(`[RegistrationPage.submitRegistration] After Continue click: submit exists=${submitExists}, visible=${submitVisible}, enabled=${submitEnabled}`);

          // Check what buttons are available now
          const allButtonsAfter = await this.page.locator('button').all();
          console.log(`[RegistrationPage.submitRegistration] Found ${allButtonsAfter.length} buttons after Continue click`);
          for (let i = 0; i < Math.min(allButtonsAfter.length, 5); i++) {
            const buttonText = await allButtonsAfter[i].textContent();
            const buttonTestId = await allButtonsAfter[i].getAttribute('data-testid');
            const isVisible = await allButtonsAfter[i].isVisible().catch(() => false);
            console.log(`[RegistrationPage.submitRegistration] Button ${i} after Continue: "${buttonText}" (testid: ${buttonTestId}, visible: ${isVisible})`);
          }

          // Check if we're on confirmation page (registration already completed)
          const currentUrl = this.page.url();
          const isOnConfirmation = currentUrl.includes('/register/confirmation') || currentUrl.includes('/register/success');
          if (isOnConfirmation) {
            console.log('[RegistrationPage.submitRegistration] Already on confirmation page, registration completed!');
            clicked = true; // Registration is already done
            break;
          }

          if (submitVisible && submitEnabled) {
            await submitButton.click();
            clicked = true;
            break;
          }

          continueClicks++;
        } else {
          // No Continue button, check if we're on confirmation page
          const currentUrl = this.page.url();
          const isOnConfirmation = currentUrl.includes('/register/confirmation') || currentUrl.includes('/register/success');
          if (isOnConfirmation) {
            console.log('[RegistrationPage.submitRegistration] Already on confirmation page, registration completed!');
            clicked = true;
            break;
          }
          // No Continue button and not on confirmation, we might be stuck
          break;
        }
      }
    }

    if (!clicked) {
      // Check one more time if we're on confirmation page
      const currentUrl = this.page.url();
      const isOnConfirmation = currentUrl.includes('/register/confirmation') || currentUrl.includes('/register/success');
      if (isOnConfirmation) {
        console.log('[RegistrationPage.submitRegistration] On confirmation page, registration already completed');
        clicked = true;
      } else {
        throw new Error(`Could not find or click submit button. Current URL: ${currentUrl}`);
      }
    }

    await this.waitForLoad();
  }

  /**
   * Complete full registration flow
   */
  async completeRegistration(formData: RegistrationFormData): Promise<void> {
    // Step 0: Primary Information
    // Check if we're already on Step 1 (household data might have prefilled Step 0)
    const addressInput = this.locator(RegistrationSelectors.addressInput).first();
    const isOnStep1 = await addressInput.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isOnStep1) {
      // We're on Step 0, fill it
      // Check if fields are already prefilled (from household data)
      const firstNameField = this.locator(RegistrationSelectors.firstNameInput).first();
      const existingFirstName = await firstNameField.inputValue().catch(() => '');
      const isPrefilled = existingFirstName.length > 0;

      if (isPrefilled) {
        console.log('[RegistrationPage.completeRegistration] Step 0 fields are prefilled, just clicking Continue');
        // Fields are prefilled, just click Continue
        await this.clickNext();
      } else {
        // Fields are not prefilled, fill them
        await this.fillStep0({
          firstName: formData.user.firstName || 'Test',
          lastName: formData.user.lastName || 'User',
          dateOfBirth: new Date(Date.now() - 25 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          gender: 'Other',
        });
        await this.clickNext();
      }
    } else {
      console.log('[RegistrationPage.completeRegistration] Already on Step 1, skipping Step 0');
    }

    // Step 1: Address Information
    // Check if we're already on Step 2 (household data might have prefilled Step 1 too)
    const adultsCountInput = this.locator(RegistrationSelectors.adultsCountInput).first();
    const isOnStep2 = await adultsCountInput.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isOnStep2) {
      // Check if Step 1 fields are prefilled
      const addressInput = this.locator(RegistrationSelectors.addressInput).first();
      const addressExists = await addressInput.count() > 0;
      const addressVisible = addressExists ? await addressInput.isVisible({ timeout: 2000 }).catch(() => false) : false;

      if (addressVisible) {
        await this.fillStep1({
          address: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zipCode,
          phone: formData.address.phone,
        });
        await this.clickNext();
      } else {
        console.log('[RegistrationPage.completeRegistration] Step 1 not visible, might already be on Step 2');
        // Try to proceed to Step 2
      }
    } else {
      console.log('[RegistrationPage.completeRegistration] Already on Step 2, skipping Step 1');
    }

    // Step 2: Family Member Counts (this is the FINAL step for registration mode)
    // The submit button should appear on this step after filling it
    // DO NOT click Continue after this step - the submit button should appear instead
    await this.fillStep2({
      adultCount: formData.adultCount,
      childCount: formData.childCount,
    });

    // Wait for form validation to complete and Register button to appear
    // For registration mode, MEMBER_COUNT is the final step, so Register button should replace Continue button
    console.log('[RegistrationPage.completeRegistration] Step 2 filled, waiting for Register button to appear...');

    // Check if we're actually on Step 2 (MEMBER_COUNT) by looking for the inputs we just filled
    const adultsInput = this.locator('#adults_in_household, input[name="adults_in_household"]').first();
    const adultsInputVisible = await adultsInput.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`[RegistrationPage.completeRegistration] Adults input visible (should be on Step 2): ${adultsInputVisible}`);

    // Wait for form state to update and Register button to appear
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });
    await this.page.waitForTimeout(2000); // Give time for validation and button state change

    // For registration mode, MEMBER_COUNT is the final step, so Register button should appear here
    // Check what buttons are available BEFORE waiting
    const allButtonsBefore = await this.page.locator('button').all();
    console.log(`[RegistrationPage.completeRegistration] Found ${allButtonsBefore.length} buttons immediately after Step 2`);
    let foundRegisterButton = false;
    for (let i = 0; i < Math.min(allButtonsBefore.length, 10); i++) {
      const buttonText = await allButtonsBefore[i].textContent();
      const buttonTestId = await allButtonsBefore[i].getAttribute('data-testid');
      const buttonType = await allButtonsBefore[i].getAttribute('type');
      const isVisible = await allButtonsBefore[i].isVisible().catch(() => false);
      const isEnabled = isVisible ? await allButtonsBefore[i].isEnabled().catch(() => false) : false;
      console.log(`[RegistrationPage.completeRegistration] Button ${i}: "${buttonText}" (testid: ${buttonTestId}, type: ${buttonType}, visible: ${isVisible}, enabled: ${isEnabled})`);

      // Check if this is the Register button
      if (buttonText && buttonText.trim() === 'Register' && buttonTestId === 'submit-button') {
        console.log(`[RegistrationPage.completeRegistration] Found Register button with submit-button testid!`);
        foundRegisterButton = true;
        if (isVisible && isEnabled) {
          console.log('[RegistrationPage.completeRegistration] Register button is visible and enabled, clicking it...');
          await allButtonsBefore[i].click();
          await this.waitForLoad();
          return; // Successfully clicked Register button
        }
      }
    }

    if (!foundRegisterButton) {
      console.log('[RegistrationPage.completeRegistration] Register button not found immediately, waiting for it to appear...');
    }

    // Check for Register button - it should appear on MEMBER_COUNT step (Step 2) for registration mode
    // The button has data-testid="submit-button" but the text is "Register"
    const submitButtonAfterStep2 = this.locator('[data-testid="submit-button"], button:has-text("Register"):not(:has-text("Registering"))').first();

    // Wait for Register button to appear (it should replace Continue button on final step)
    console.log('[RegistrationPage.completeRegistration] Waiting for Register button to appear on final step...');

    let submitVisible = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!submitVisible && attempts < maxAttempts) {
      await this.page.waitForTimeout(500);
      const submitExists = await submitButtonAfterStep2.count() > 0;
      submitVisible = submitExists ? await submitButtonAfterStep2.isVisible({ timeout: 1000 }).catch(() => false) : false;

      if (submitVisible) {
        console.log(`[RegistrationPage.completeRegistration] Register button appeared after ${attempts + 1} attempts`);
        break;
      }

      attempts++;

      // Check if we're still seeing Continue button (means we're not on final step yet)
      const continueButton = this.locator('[data-testid="continue-button"]').first();
      const continueVisible = await continueButton.isVisible({ timeout: 500 }).catch(() => false);
      if (!continueVisible) {
        // Continue button disappeared, Register button might be appearing
        console.log('[RegistrationPage.completeRegistration] Continue button disappeared, Register button should appear');
      } else {
        // Still seeing Continue button - check if Register button exists but is hidden
        const registerButton = this.locator('button:has-text("Register"):not(:has-text("Registering"))').first();
        const registerExists = await registerButton.count() > 0;
        const registerVisible = registerExists ? await registerButton.isVisible({ timeout: 500 }).catch(() => false) : false;
        console.log(`[RegistrationPage.completeRegistration] Register button exists: ${registerExists}, visible: ${registerVisible}`);
      }
    }

    const submitExists = await submitButtonAfterStep2.count() > 0;
    const submitEnabled = submitVisible ? await submitButtonAfterStep2.isEnabled({ timeout: 2000 }).catch(() => false) : false;

    console.log(`[RegistrationPage.completeRegistration] Register button after Step 2: exists=${submitExists}, visible=${submitVisible}, enabled=${submitEnabled}`);

    if (submitVisible && submitEnabled) {
      // Register button is ready
      console.log('[RegistrationPage.completeRegistration] Register button is ready, clicking it...');
      await submitButtonAfterStep2.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(200);
      await submitButtonAfterStep2.click();
      console.log('[RegistrationPage.completeRegistration] Clicked Register button');
      await this.waitForLoad();
      return; // Successfully submitted, don't call submitRegistration
    } else if (submitVisible && !submitEnabled) {
      console.log('[RegistrationPage.completeRegistration] Register button visible but disabled, waiting for it to be enabled...');
      // Wait for button to be enabled
      await submitButtonAfterStep2.waitFor({ state: 'visible', timeout: 5000 });
      for (let i = 0; i < 10; i++) {
        const enabled = await submitButtonAfterStep2.isEnabled({ timeout: 1000 }).catch(() => false);
        if (enabled) {
          await submitButtonAfterStep2.click();
          await this.waitForLoad();
          return;
        }
        await this.page.waitForTimeout(500);
      }
    }

    // If Register button still not visible/enabled, try submitRegistration method
    console.log('[RegistrationPage.completeRegistration] Register button not ready, trying submitRegistration method...');

    // Select event slot if available
    const slotAvailable = await this.isVisible(RegistrationSelectors.eventSlot, 2000);
    if (slotAvailable) {
      await this.selectEventSlot(0);
    }

    // Submit
    await this.submitRegistration();
  }

  /**
   * Verify validation errors are displayed
   */
  async verifyValidationErrors(): Promise<void> {
    const errorMessages = this.locator('[data-testid="error-message"], .error, [role="alert"]');
    const count = await errorMessages.count();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Verify confirmation page is displayed
   */
  async verifyConfirmationPage(): Promise<void> {
    await expect(this.locator(RegistrationSelectors.confirmationPage)).toBeVisible();
  }

  /**
   * Verify QR code is displayed
   */
  async verifyQRCodeDisplayed(): Promise<void> {
    await expect(this.locator(RegistrationSelectors.qrCode)).toBeVisible();
  }
}

