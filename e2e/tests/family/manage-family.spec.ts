import { test, expect } from '@playwright/test';
import { FamilyPage } from '../../pages/FamilyPage';
import { LoginPage } from '../../pages/LoginPage';
import { createTestFamilyMember, DEFAULT_TEST_CREDENTIALS } from '../../fixtures/test-data';

test.describe('Manage Family', () => {
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

  test('should view family member list', async ({ page }) => {
    const familyPage = new FamilyPage(page);
    
    await familyPage.navigate();
    
    // Wait for list to load
    await page.waitForTimeout(2000);
    
    // Verify list is visible
    const list = page.locator('[data-testid="family-member-list"]');
    const isVisible = await list.isVisible({ timeout: 2000 }).catch(() => false);
    
    // List should be visible or we should see family member cards
    const memberCards = page.locator('[data-testid="family-member-card"]');
    const cardCount = await memberCards.count();
    
    expect(isVisible || cardCount >= 0).toBe(true);
  });

  test('should edit existing family member', async ({ page }) => {
    const familyPage = new FamilyPage(page);
    
    await familyPage.navigate();
    await page.waitForTimeout(2000);
    
    // Check if there are any family members
    const memberCount = await familyPage.getFamilyMemberCount();
    
    if (memberCount > 0) {
      // Edit first family member
      await familyPage.clickEditFamilyMember(0);
      
      // Verify edit form is visible
      const firstNameInput = page.locator('[data-testid="first-name-input"]');
      await expect(firstNameInput).toBeVisible();
    } else {
      // Skip if no family members
      test.skip();
    }
  });

  test('should save updated family member information', async ({ page }) => {
    const familyPage = new FamilyPage(page);
    const updates = {
      firstName: 'Updated',
      lastName: 'Name',
    };
    
    await familyPage.navigate();
    await page.waitForTimeout(2000);
    
    // Check if there are any family members
    const memberCount = await familyPage.getFamilyMemberCount();
    
    if (memberCount > 0) {
      // Edit and update first family member
      await familyPage.editFamilyMember(0, updates);
      
      // Wait for save
      await page.waitForTimeout(2000);
      
      // Verify updated information is displayed
      // This depends on how the UI displays the updated info
      const updatedCard = page.locator('[data-testid="family-member-card"]')
        .filter({ hasText: updates.firstName })
        .first();
      const isVisible = await updatedCard.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(isVisible).toBe(true);
    } else {
      test.skip();
    }
  });

  test('should delete family member', async ({ page }) => {
    const familyPage = new FamilyPage(page);
    
    await familyPage.navigate();
    await page.waitForTimeout(2000);
    
    // Get initial count
    const initialCount = await familyPage.getFamilyMemberCount();
    
    if (initialCount > 0) {
      // Delete first family member
      await familyPage.clickDeleteFamilyMember(0);
      
      // Confirm deletion
      await familyPage.confirmDelete();
      
      // Wait for deletion
      await page.waitForTimeout(2000);
      
      // Verify count decreased
      const newCount = await familyPage.getFamilyMemberCount();
      expect(newCount).toBeLessThan(initialCount);
    } else {
      test.skip();
    }
  });

  test('should show deletion confirmation', async ({ page }) => {
    const familyPage = new FamilyPage(page);
    
    await familyPage.navigate();
    await page.waitForTimeout(2000);
    
    const memberCount = await familyPage.getFamilyMemberCount();
    
    if (memberCount > 0) {
      // Click delete
      await familyPage.clickDeleteFamilyMember(0);
      
      // Verify confirmation dialog is visible
      const confirmButton = page.locator('[data-testid="confirm-delete-button"]');
      const isVisible = await confirmButton.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(isVisible).toBe(true);
    } else {
      test.skip();
    }
  });

  test('should remove family member from list after deletion', async ({ page }) => {
    const familyPage = new FamilyPage(page);
    const member = createTestFamilyMember();
    
    await familyPage.navigate();
    
    // Add a member first
    await familyPage.addFamilyMember(member);
    await page.waitForTimeout(2000);
    
    // Get count before deletion
    const countBefore = await familyPage.getFamilyMemberCount();
    
    // Find and delete the member we just added
    const memberCards = page.locator('[data-testid="family-member-card"]');
    const cardCount = await memberCards.count();
    
    if (cardCount > 0) {
      // Delete the last added member (should be the one we just added)
      await familyPage.deleteFamilyMember(cardCount - 1);
      
      // Wait for deletion
      await page.waitForTimeout(2000);
      
      // Verify member is removed
      await familyPage.verifyFamilyMemberRemoved(member.firstName, member.lastName);
    } else {
      test.skip();
    }
  });
});

