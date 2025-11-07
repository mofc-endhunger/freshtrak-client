import { test, expect } from '@playwright/test';
import { FamilyPage } from '../../pages/FamilyPage';
import { LoginPage } from '../../pages/LoginPage';
import { createTestFamilyMember, DEFAULT_TEST_CREDENTIALS } from '../../fixtures/test-data';

test.describe('Add Family Member', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.signIn(
      DEFAULT_TEST_CREDENTIALS.email,
      DEFAULT_TEST_CREDENTIALS.password
    );
    await page.waitForURL(/^\/(?!login)/, { timeout: 10000 });
  });

  test('should navigate to add family member page', async ({ page }) => {
    const familyPage = new FamilyPage(page);
    
    await familyPage.navigate();
    
    // Click add family member button
    const addButton = page.locator('[data-testid="add-family-member-button"]');
    if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await familyPage.clickAddFamilyMember();
      
      // Verify form is visible
      const firstNameInput = page.locator('[data-testid="first-name-input"]');
      await expect(firstNameInput).toBeVisible();
    } else {
      // If button doesn't exist, we might already be on the form page
      const firstNameInput = page.locator('[data-testid="first-name-input"]');
      const isVisible = await firstNameInput.isVisible({ timeout: 2000 }).catch(() => false);
      expect(isVisible).toBe(true);
    }
  });

  test('should fill family member form', async ({ page }) => {
    const familyPage = new FamilyPage(page);
    const member = createTestFamilyMember();
    
    await familyPage.navigate();
    
    // Navigate to add form
    const addButton = page.locator('[data-testid="add-family-member-button"]');
    if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await familyPage.clickAddFamilyMember();
    }
    
    // Fill the form
    await familyPage.fillFamilyMemberForm(member);
    
    // Verify form is filled
    const firstNameInput = page.locator('[data-testid="first-name-input"]');
    const firstNameValue = await firstNameInput.inputValue();
    expect(firstNameValue).toBe(member.firstName);
  });

  test('should submit family member form', async ({ page }) => {
    const familyPage = new FamilyPage(page);
    const member = createTestFamilyMember();
    
    await familyPage.navigate();
    
    // Navigate to add form
    const addButton = page.locator('[data-testid="add-family-member-button"]');
    if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await familyPage.clickAddFamilyMember();
    }
    
    // Fill and submit
    await familyPage.fillFamilyMemberForm(member);
    await familyPage.submitFamilyMemberForm();
    
    // Wait for submission
    await page.waitForTimeout(2000);
    
    // Should redirect or show success
    const url = page.url();
    expect(url).not.toContain('/create') || await page.locator('[data-testid="success-message"]').isVisible({ timeout: 2000 }).catch(() => false);
  });

  test('should display family member in list after addition', async ({ page }) => {
    const familyPage = new FamilyPage(page);
    const member = createTestFamilyMember();
    
    await familyPage.navigate();
    
    // Add family member
    await familyPage.addFamilyMember(member);
    
    // Wait for list to update
    await page.waitForTimeout(2000);
    
    // Verify member is in list
    await familyPage.verifyFamilyMemberInList(member.firstName, member.lastName);
  });

  test('should validate family member form', async ({ page }) => {
    const familyPage = new FamilyPage(page);
    
    await familyPage.navigate();
    
    // Navigate to add form
    const addButton = page.locator('[data-testid="add-family-member-button"]');
    if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await familyPage.clickAddFamilyMember();
    }
    
    // Try to submit empty form
    const saveButton = page.locator('[data-testid="save-button"]');
    if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await saveButton.click();
      
      // Wait for validation
      await page.waitForTimeout(1000);
      
      // Should show validation errors
      const errors = page.locator('[data-testid="error-message"], .error, [role="alert"]');
      const errorCount = await errors.count();
      
      expect(errorCount).toBeGreaterThan(0);
    }
  });
});

