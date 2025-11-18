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
            // Wait for timeslot modal to close (indicates navigation started)
            // Get modal locator again to check if it's hidden
            let timeslotModal = null;
            for (const selector of timeslotModalSelectors) {
              const modal = this.page.locator(selector).first();
              const isVisible = await modal.isVisible({ timeout: 1000 }).catch(() => false);
              if (isVisible) {
                timeslotModal = modal;
                break;
              }
            }
            if (timeslotModal) {
              await timeslotModal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => { });
            }
            
            // Wait for form to be visible instead of waiting for URL change
            // React Router client-side navigation may not immediately update URL in Playwright
            const firstNameInput = this.locator(RegistrationSelectors.firstNameInput).first();
            try {
              await firstNameInput.waitFor({ state: 'visible', timeout: 15000 });
              console.log(`[RegistrationPage] Form is visible, navigated to: ${this.page.url()}`);
            } catch (error) {
              // Fallback: check if URL changed
              const currentUrl = this.page.url();
              if (currentUrl.includes('/register/form/') && currentUrl.split('/').length >= 5) {
                console.log(`[RegistrationPage] URL contains slot ID: ${currentUrl}`);
              } else {
                console.warn(`[RegistrationPage] Form not visible after timeslot selection. Current URL: ${currentUrl}`);
                // Continue anyway - form might still be loading
              }
            }
            
            await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });
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

    // Wait for form to be visible (with longer timeout)
    // Try multiple selectors to detect the form
    const formSelectors = [
      RegistrationSelectors.firstNameInput,
      RegistrationSelectors.householdForm,
      'form',
      '[data-testid="household-form"]',
      'input[name="first_name"]',
      '#first_name'
    ];

    let formFound = false;
    for (const selector of formSelectors) {
      try {
        const element = this.locator(selector).first();
        await element.waitFor({ state: 'visible', timeout: 15000 });
        formFound = true;
        console.log(`[RegistrationPage] Form detected using selector: ${selector}`);
        break;
      } catch (error) {
        // Try next selector
        continue;
      }
    }

    if (formFound) {
      return { status: 'success' };
    }

    // If form is not visible, check what page we're on
    const finalUrl = this.page.url();
    
    // Check if we're on an error page
    if (isErrorPage && !isOnHomePage && !isOnLoginPage) {
      return {
        status: 'error',
        message: 'Registration form requires a valid eventDateId. Navigate from an event details page first.'
      };
    }

    if (finalUrl.endsWith('/') && !finalUrl.includes('/register')) {
      // Form redirected to home - this might mean user is already registered or event is invalid
      return {
        status: 'redirected',
        message: `Registration form redirected to home page. The eventDateId (${eventDateId}) might be invalid or the user might already be registered for this event.`
      };
    }

    // If we're on the registration form URL but form isn't visible, it might still be loading
    if (finalUrl.includes('/register/form')) {
      // Wait a bit more and try once more
      await this.page.waitForTimeout(2000);
      const firstNameInput = this.locator(RegistrationSelectors.firstNameInput).first();
      const retryVisible = await firstNameInput.isVisible({ timeout: 5000 }).catch(() => false);
      if (retryVisible) {
        return { status: 'success' };
      }
    }

    return {
      status: 'error',
      message: `Registration form is not visible. Current URL: ${finalUrl}`
    };
  }

  /**
   * Navigate to registration page (compatible with BasePage interface)
   * @param eventDateId - Event date ID (required for valid registration)
   * @param eventSlotId - Optional event slot ID
   * @returns Result object with status and optional message
   */
  async navigate(eventDateId: string, eventSlotId?: string): Promise<{ status: 'success' | 'redirected' | 'error'; message?: string }> {
    const result = await this.navigateToRegistration(eventDateId, eventSlotId);
    if (result.status === 'error') {
      throw new Error(result.message || 'Failed to navigate to registration form');
    }
    // Return the result so tests can check for 'redirected' status
    return result;
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
   * Fill Step 1: Address + Contact Information (combined in registration mode)
   */
  async fillStep1(data: { address: string; city: string; state: string; zipCode: string; phone: string; email?: string }): Promise<void> {
    // Wait for Step 1 to be visible after navigation from Step 0
    // Step 1 includes both AddressComponent and ContactInformationComponent
    const addressInput = this.locator(RegistrationSelectors.addressInput).first();
    const cityInput = this.locator(RegistrationSelectors.cityInput).first();
    const phoneInput = this.locator(RegistrationSelectors.phoneInput).first();

    // Wait for step transition to complete
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });
    await this.page.waitForTimeout(1000); // Give time for step transition

    // Wait for at least one Step 1 field to be visible (address, city, or phone)
    const addressVisible = await addressInput.isVisible({ timeout: 5000 }).catch(() => false);
    const cityVisible = await cityInput.isVisible({ timeout: 5000 }).catch(() => false);
    const phoneVisible = await phoneInput.isVisible({ timeout: 5000 }).catch(() => false);

    if (!addressVisible && !cityVisible && !phoneVisible) {
      // Wait a bit more and try again
      await this.page.waitForTimeout(2000);
      const addressCheck = await addressInput.isVisible({ timeout: 5000 }).catch(() => false);
      const cityCheck = await cityInput.isVisible({ timeout: 5000 }).catch(() => false);
      const phoneCheck = await phoneInput.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (!addressCheck && !cityCheck && !phoneCheck) {
        throw new Error('Step 1 fields (address, city, phone) are not visible. Form might not have transitioned to Step 1.');
      }
    }

    await this.page.waitForTimeout(500); // Small delay for form to stabilize

    // Fill address fields
    if (addressVisible || await addressInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.fill(RegistrationSelectors.addressInput, data.address);
    }
    if (cityVisible || await cityInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.fill(RegistrationSelectors.cityInput, data.city);
    }
    await this.page.selectOption(RegistrationSelectors.stateSelect, data.state);
    await this.fill(RegistrationSelectors.zipCodeInput, data.zipCode);
    
    // Fill contact information (phone and email)
    if (phoneVisible || await phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.fill(RegistrationSelectors.phoneInput, data.phone);
    }
    
    // Fill email if provided (email is required in Step 1 unless no_email is checked)
    if (data.email) {
      const emailInput = this.locator(RegistrationSelectors.emailInput).first();
      const emailVisible = await emailInput.isVisible({ timeout: 2000 }).catch(() => false);
      if (emailVisible) {
        await this.fill(RegistrationSelectors.emailInput, data.email);
      }
    }
  }

  /**
   * Fill Step 2: Family Member Counts
   */
  async fillStep2(data: { adultCount: number; childCount: number }): Promise<void> {
    console.log(`[RegistrationPage.fillStep2] Filling Step 2 with adultCount: ${data.adultCount}, childCount: ${data.childCount}`);

    // The MemberCountFormComponent uses increment/decrement buttons, not direct input
    // We need to click the increment buttons to set the values
    
    // First, check current values by reading the input
    const adultsInput = this.locator('#adults_in_household, input[name="adults_in_household"]').first();
    const childrenInput = this.locator('#children_in_household, input[name="children_in_household"]').first();
    
    const adultsInputExists = await adultsInput.count() > 0;
    const childrenInputExists = await childrenInput.count() > 0;
    
    if (!adultsInputExists || !childrenInputExists) {
      console.log(`[RegistrationPage.fillStep2] Inputs not found - adults: ${adultsInputExists}, children: ${childrenInputExists}`);
      return;
    }

    // Get current values
    const currentAdults = parseInt(await adultsInput.inputValue().catch(() => '0')) || 0;
    const currentChildren = parseInt(await childrenInput.inputValue().catch(() => '0')) || 0;

    console.log(`[RegistrationPage.fillStep2] Current values - adults: ${currentAdults}, children: ${currentChildren}`);
    console.log(`[RegistrationPage.fillStep2] Target values - adults: ${data.adultCount}, children: ${data.childCount}`);

    // Calculate how many clicks needed
    const adultsClicks = data.adultCount - currentAdults;
    const childrenClicks = data.childCount - currentChildren;

    // Click increment buttons for adults
    if (adultsClicks > 0) {
      const adultIncButton = this.locator('[data-testid="count_adult_inc"]').first();
      const adultIncVisible = await adultIncButton.isVisible({ timeout: 2000 }).catch(() => false);
      if (adultIncVisible) {
        for (let i = 0; i < adultsClicks; i++) {
          await adultIncButton.click();
          await this.page.waitForTimeout(100); // Small delay between clicks
        }
        console.log(`[RegistrationPage.fillStep2] Clicked adult increment button ${adultsClicks} times`);
      }
    } else if (adultsClicks < 0) {
      // Need to decrement
      const adultDecButton = this.locator('[data-testid="count_adult_dec"]').first();
      const adultDecVisible = await adultDecButton.isVisible({ timeout: 2000 }).catch(() => false);
      if (adultDecVisible) {
        for (let i = 0; i < Math.abs(adultsClicks); i++) {
          await adultDecButton.click();
          await this.page.waitForTimeout(100);
        }
        console.log(`[RegistrationPage.fillStep2] Clicked adult decrement button ${Math.abs(adultsClicks)} times`);
      }
    }

    // Click increment buttons for children
    if (childrenClicks > 0) {
      const childIncButton = this.locator('[data-testid="count_kid_inc"]').first();
      const childIncVisible = await childIncButton.isVisible({ timeout: 2000 }).catch(() => false);
      if (childIncVisible) {
        for (let i = 0; i < childrenClicks; i++) {
          await childIncButton.click();
          await this.page.waitForTimeout(100);
        }
        console.log(`[RegistrationPage.fillStep2] Clicked child increment button ${childrenClicks} times`);
      }
    } else if (childrenClicks < 0) {
      // Need to decrement
      const childDecButton = this.locator('[data-testid="count_kid_dec"]').first();
      const childDecVisible = await childDecButton.isVisible({ timeout: 2000 }).catch(() => false);
      if (childDecVisible) {
        for (let i = 0; i < Math.abs(childrenClicks); i++) {
          await childDecButton.click();
          await this.page.waitForTimeout(100);
        }
        console.log(`[RegistrationPage.fillStep2] Clicked child decrement button ${Math.abs(childrenClicks)} times`);
      }
    }

    // Wait for form state to update
    await this.page.waitForTimeout(500);
    
    // Verify values were set
    const finalAdults = parseInt(await adultsInput.inputValue().catch(() => '0')) || 0;
    const finalChildren = parseInt(await childrenInput.inputValue().catch(() => '0')) || 0;
    console.log(`[RegistrationPage.fillStep2] Final values - adults: ${finalAdults}, children: ${finalChildren}`);
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
    await this.page.waitForTimeout(2000); // Wait longer for form to stabilize

    // First, check if we're already on confirmation page
    const currentUrl = this.page.url();
    const isOnConfirmation = currentUrl.includes('/register/confirmation') || currentUrl.includes('/register/success');
    if (isOnConfirmation) {
      console.log('[RegistrationPage.submitRegistration] Already on confirmation page, registration completed!');
      return;
    }

    // Try multiple selectors for Register/Submit button
    const submitSelectors = [
      '[data-testid="submit-button"]', // Primary selector from HouseholdForm
      'button[type="submit"]:not(:disabled)', // Fallback to any enabled submit button
      'button:has-text("Register"):not(:has-text("Registering"))', // Button text is "Register"
      'button:has-text("Submit")', // Alternative text
      '[data-testid*="submit"]', // Any testid containing "submit"
      '[data-testid*="register"]' // Any testid containing "register"
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
    const step1AddressInput = this.locator(RegistrationSelectors.addressInput).first();
    const isOnStep1 = await step1AddressInput.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isOnStep1) {
      // We're on Step 0, fill it
      // Check if fields are already prefilled (from household data)
      const firstNameField = this.locator(RegistrationSelectors.firstNameInput).first();
      const lastNameField = this.locator(RegistrationSelectors.lastNameInput).first();
      const dobField = this.locator(RegistrationSelectors.dateOfBirthInput).first();
      const genderField = this.locator(RegistrationSelectors.genderSelect).first();
      
      const existingFirstName = await firstNameField.inputValue().catch(() => '');
      const existingLastName = await lastNameField.inputValue().catch(() => '');
      const existingDob = await dobField.inputValue().catch(() => '');
      const existingGender = await genderField.inputValue().catch(() => '');
      
      // Check if all required fields are filled and valid
      const isPrefilled = existingFirstName.length > 0 && existingLastName.length > 0 && 
                         existingDob.length > 0 && existingGender.length > 0;
      
      // Validate date format (should be mm/dd/yyyy)
      const isValidDob = existingDob.match(/^\d{2}\/\d{2}\/\d{4}$/);

      if (isPrefilled && isValidDob) {
        console.log('[RegistrationPage.completeRegistration] Step 0 fields are prefilled and valid, just clicking Continue');
        // Fields are prefilled and valid, just click Continue
        await this.clickNext();
      } else {
        // Fields are not prefilled or invalid, fill/update them
        console.log(`[RegistrationPage.completeRegistration] Step 0 fields need to be filled/updated. FirstName: ${existingFirstName}, LastName: ${existingLastName}, DOB: ${existingDob}, Gender: ${existingGender}`);
        
        // Calculate a valid date of birth (25 years ago) in mm/dd/yyyy format
        const birthDate = new Date(Date.now() - 25 * 365 * 24 * 60 * 60 * 1000);
        const month = String(birthDate.getMonth() + 1).padStart(2, '0');
        const day = String(birthDate.getDate()).padStart(2, '0');
        const year = birthDate.getFullYear();
        const dobFormatted = `${month}/${day}/${year}`;
        
        await this.fillStep0({
          firstName: formData.user.firstName || existingFirstName || 'Test',
          lastName: formData.user.lastName || existingLastName || 'User',
          dateOfBirth: dobFormatted,
          gender: existingGender || 'Other',
        });
        await this.clickNext();
      }
    } else {
      console.log('[RegistrationPage.completeRegistration] Already on Step 1, skipping Step 0');
    }

    // Step 1: Address + Contact Information (combined in registration mode)
    // Wait for step transition and network to settle
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(2000); // Give form time to transition
    
    // Determine which step we're on by checking what inputs are visible
    // In registration mode, Step 1 shows BOTH AddressComponent AND ContactInformationComponent
    console.log('[RegistrationPage.completeRegistration] Determining current step...');
    const firstNameInput = this.locator(RegistrationSelectors.firstNameInput).first();
    const addressInput = this.locator(RegistrationSelectors.addressInput).first();
    const cityInput = this.locator(RegistrationSelectors.cityInput).first();
    const phoneInput = this.locator(RegistrationSelectors.phoneInput).first();
    const adultsCountInput = this.locator(RegistrationSelectors.adultsCountInput).first();
    
    const firstNameVisible = await firstNameInput.isVisible({ timeout: 2000 }).catch(() => false);
    const addressVisible = await addressInput.isVisible({ timeout: 2000 }).catch(() => false);
    const cityVisible = await cityInput.isVisible({ timeout: 2000 }).catch(() => false);
    const phoneVisible = await phoneInput.isVisible({ timeout: 2000 }).catch(() => false);
    const step2Visible = await adultsCountInput.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Step 1 is visible if we see address OR city OR phone (any of the Step 1 fields)
    const step1Visible = addressVisible || cityVisible || phoneVisible;
    
    console.log(`[RegistrationPage.completeRegistration] Step visibility - Step 0 (firstName): ${firstNameVisible}, Step 1 (address/city/phone): ${step1Visible} (address: ${addressVisible}, city: ${cityVisible}, phone: ${phoneVisible}), Step 2 (adults): ${step2Visible}`);
    
    if (step2Visible) {
      console.log('[RegistrationPage.completeRegistration] Already on Step 2, skipping Step 1');
    } else if (step1Visible) {
      // We're on Step 1 (Address + Contact combined)
      console.log('[RegistrationPage.completeRegistration] On Step 1 (Address + Contact Information), filling it...');
      
      // Wait for all Step 1 fields to be ready
      if (addressVisible) {
        await addressInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      }
      if (cityVisible) {
        await cityInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      }
      if (phoneVisible) {
        await phoneInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      }
      
      await this.fillStep1({
        address: formData.address.street,
        city: formData.address.city,
        state: formData.address.state,
        zipCode: formData.address.zipCode,
        phone: formData.address.phone,
        email: formData.user.email,
      });
      
      // Wait a moment for form to update
      await this.page.waitForTimeout(500);
      
      // Click Continue to go to Step 2
      // Note: Step 1 uses data-testid="continue button" (with space) and calls validateStep1
      console.log('[RegistrationPage.completeRegistration] Clicking Continue to proceed to Step 2...');
      await this.clickNext();
      
      // Wait for Step 2 to appear
      console.log('[RegistrationPage.completeRegistration] Waiting for Step 2 to appear...');
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await this.page.waitForTimeout(1000); // Give time for step transition
      await adultsCountInput.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
        console.warn('[RegistrationPage.completeRegistration] Step 2 did not appear after clicking Continue from Step 1');
      });
    } else if (firstNameVisible) {
      // Still on Step 0 - wait for step transition after clicking Continue
      console.log('[RegistrationPage.completeRegistration] Still on Step 0, waiting for step transition...');
      
      // Check for validation errors that might be preventing progression
      const validationErrors = await this.page.locator('[class*="error"], [class*="invalid"], [data-testid*="error"]').all();
      if (validationErrors.length > 0) {
        const errorTexts = await Promise.all(validationErrors.map(async (err) => {
          try {
            return await err.textContent();
          } catch {
            return '';
          }
        }));
        console.log(`[RegistrationPage.completeRegistration] Found validation errors: ${errorTexts.filter(t => t).join(', ')}`);
      }
      
      // Wait for network and DOM to settle
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await this.page.waitForTimeout(2000);
      
      // Check again for Step 1 or Step 2 with longer timeout
      const addressCheck = await addressInput.isVisible({ timeout: 8000 }).catch(() => false);
      const cityCheck = await cityInput.isVisible({ timeout: 8000 }).catch(() => false);
      const phoneCheck = await phoneInput.isVisible({ timeout: 8000 }).catch(() => false);
      const step2Check = await adultsCountInput.isVisible({ timeout: 8000 }).catch(() => false);
      
      // Also check if firstName is still visible (might indicate we're still on Step 0)
      const firstNameStillVisible = await firstNameInput.isVisible({ timeout: 2000 }).catch(() => false);
      
      const step1Check = addressCheck || cityCheck || phoneCheck;
      
      if (step1Check) {
        console.log('[RegistrationPage.completeRegistration] Step 1 appeared after waiting');
        // Fill Step 1
        await this.fillStep1({
          address: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zipCode,
          phone: formData.address.phone,
          email: formData.user.email,
        });
        await this.page.waitForTimeout(500);
        await this.clickNext();
        await adultsCountInput.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      } else if (step2Check) {
        console.log('[RegistrationPage.completeRegistration] Step 2 appeared after waiting (Step 1 was skipped or prefilled)');
      } else if (firstNameStillVisible) {
        // Still on Step 0 - might need to check if Continue button is disabled or if there are validation errors
        const continueButton = this.locator(RegistrationSelectors.nextButton).first();
        const isDisabled = await continueButton.isDisabled({ timeout: 2000 }).catch(() => false);
        const currentUrl = this.page.url();
        throw new Error(`Still on Step 0 after clicking Continue. Continue button disabled: ${isDisabled}. Current URL: ${currentUrl}. Form might have validation errors preventing progression.`);
      } else {
        // Neither step is visible - form might be in an error state
        const currentUrl = this.page.url();
        throw new Error(`Cannot determine current step. Step 0, Step 1, and Step 2 are all not visible. Current URL: ${currentUrl}. Form might be in an error state.`);
      }
    } else {
      // None of the steps are visible - form might be loading or in error state
      console.log('[RegistrationPage.completeRegistration] No step inputs visible, waiting for form to load...');
      await this.page.waitForTimeout(3000);
      // Try one more time
      const finalStep2Check = await adultsCountInput.isVisible({ timeout: 5000 }).catch(() => false);
      const finalStep1Check = await addressInput.isVisible({ timeout: 5000 }).catch(() => false) || 
                               await cityInput.isVisible({ timeout: 5000 }).catch(() => false) ||
                               await phoneInput.isVisible({ timeout: 5000 }).catch(() => false);
      if (!finalStep2Check && !finalStep1Check) {
        throw new Error('Cannot determine current step after waiting. Form might be in an error state or still loading.');
      }
    }

    // Step 2: Family Member Counts (this is the FINAL step for registration mode)
    // The submit button should appear on this step after filling it
    // DO NOT click Continue after this step - the submit button should appear instead
    
    // Ensure we're on Step 2 before trying to fill it
    const adultsCountInputCheck = this.locator(RegistrationSelectors.adultsCountInput).first();
    const isOnStep2Check = await adultsCountInputCheck.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!isOnStep2Check) {
      console.log('[RegistrationPage.completeRegistration] Not on Step 2 yet, waiting for it to appear...');
      // Wait for Step 2 to appear (might need to click Continue from Step 1)
      await adultsCountInputCheck.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
        console.warn('[RegistrationPage.completeRegistration] Step 2 inputs never appeared');
      });
    }
    
    // Verify we're on Step 2 before filling
    const finalStep2Check = await adultsCountInputCheck.isVisible({ timeout: 2000 }).catch(() => false);
    if (!finalStep2Check) {
      throw new Error('Cannot fill Step 2 - Step 2 inputs are not visible. Current step might be different.');
    }
    
    console.log('[RegistrationPage.completeRegistration] Confirmed on Step 2, filling member counts...');
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

