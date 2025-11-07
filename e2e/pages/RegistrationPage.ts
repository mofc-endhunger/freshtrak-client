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
   * Navigate to registration page
   */
  async navigate(eventDateId: string, eventSlotId?: string): Promise<void> {
    let url = `/register/form/${eventDateId}`;
    if (eventSlotId) {
      url += `/${eventSlotId}`;
    }
    await this.page.goto(url);
    await this.waitForLoad();
  }

  /**
   * Fill Step 0: Primary Information
   */
  async fillStep0(data: { firstName: string; lastName: string; dateOfBirth: string; gender: string }): Promise<void> {
    await this.fill(RegistrationSelectors.firstNameInput, data.firstName);
    await this.fill(RegistrationSelectors.lastNameInput, data.lastName);
    await this.fill(RegistrationSelectors.dateOfBirthInput, data.dateOfBirth);
    await this.page.selectOption(RegistrationSelectors.genderSelect, data.gender);
  }

  /**
   * Fill Step 1: Address Information
   */
  async fillStep1(data: { address: string; city: string; state: string; zipCode: string; phone: string }): Promise<void> {
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
    await this.fill(RegistrationSelectors.adultCountInput, data.adultCount.toString());
    await this.fill(RegistrationSelectors.childCountInput, data.childCount.toString());
  }

  /**
   * Click next button
   */
  async clickNext(): Promise<void> {
    await this.click(RegistrationSelectors.nextButton);
    await this.waitForLoad();
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

