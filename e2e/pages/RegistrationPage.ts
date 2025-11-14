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
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});

    await this.fill(RegistrationSelectors.firstNameInput, data.firstName);
    await this.fill(RegistrationSelectors.lastNameInput, data.lastName);
    await this.fill(RegistrationSelectors.dateOfBirthInput, data.dateOfBirth);
    await this.page.selectOption(RegistrationSelectors.genderSelect, data.gender);
  }

  /**
   * Fill Step 1: Address Information
   */
  async fillStep1(data: { address: string; city: string; state: string; zipCode: string; phone: string }): Promise<void> {
    // Wait for address form to be visible
    const addressInput = this.locator(RegistrationSelectors.addressInput).first();
    await addressInput.waitFor({ state: 'visible', timeout: 10000 });
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
    await this.fill(RegistrationSelectors.adultsCountInput, data.adultCount.toString());
    await this.fill(RegistrationSelectors.childrenCountInput, data.childCount.toString());
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
            await button.click();
            clicked = true;
            console.log(`[RegistrationPage.clickNext] Successfully clicked Continue button`);
            break;
          } catch (error) {
            console.log(`[RegistrationPage.clickNext] Error clicking button: ${error}`);
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
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
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
    await this.click(RegistrationSelectors.submitButton);
    await this.waitForLoad();
  }

  /**
   * Complete full registration flow
   */
  async completeRegistration(formData: RegistrationFormData): Promise<void> {
    // Step 0: Primary Information
    await this.fillStep0({
      firstName: formData.user.firstName || 'Test',
      lastName: formData.user.lastName || 'User',
      dateOfBirth: new Date(Date.now() - 25 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      gender: 'Other',
    });
    await this.clickNext();

    // Step 1: Address Information
    await this.fillStep1({
      address: formData.address.street,
      city: formData.address.city,
      state: formData.address.state,
      zipCode: formData.address.zipCode,
      phone: formData.address.phone,
    });
    await this.clickNext();

    // Step 2: Family Member Counts
    await this.fillStep2({
      adultCount: formData.adultCount,
      childCount: formData.childCount,
    });
    await this.clickNext();

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

