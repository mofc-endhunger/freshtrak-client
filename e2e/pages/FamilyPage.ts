import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { FamilySelectors } from '../utils/selectors';
import { TEST_URLS } from '../utils/constants';
import { TestFamilyMember } from '../fixtures/test-data';

/**
 * Family Page Object
 * 
 * Handles interactions with the family management page
 */
export class FamilyPage extends BasePage {
    /**
     * Navigate to family page
     */
    async navigate(): Promise<void> {
        await this.page.goto(TEST_URLS.FAMILY || '/family/create');
        await this.waitForLoad();
    }

    /**
     * Click add family member button
     */
    async clickAddFamilyMember(): Promise<void> {
        await this.click(FamilySelectors.addFamilyMemberButton);
        await this.waitForLoad();
    }

    /**
     * Fill family member form
     */
    async fillFamilyMemberForm(member: TestFamilyMember): Promise<void> {
        await this.fill(FamilySelectors.firstNameInput, member.firstName);
        await this.fill(FamilySelectors.lastNameInput, member.lastName);
        await this.fill(FamilySelectors.dateOfBirthInput, member.dateOfBirth);
        await this.page.selectOption(FamilySelectors.genderSelect, member.gender);
    }

    /**
     * Submit family member form
     */
    async submitFamilyMemberForm(): Promise<void> {
        await this.click(FamilySelectors.saveButton);
        await this.waitForLoad();
    }

    /**
     * Add a new family member
     */
    async addFamilyMember(member: TestFamilyMember): Promise<void> {
        await this.clickAddFamilyMember();
        await this.fillFamilyMemberForm(member);
        await this.submitFamilyMemberForm();
    }

    /**
     * Get family member count
     */
    async getFamilyMemberCount(): Promise<number> {
        return await this.locator(FamilySelectors.familyMemberCard).count();
    }

    /**
     * Click edit on family member by index
     */
    async clickEditFamilyMember(index: number = 0): Promise<void> {
        const cards = this.locator(FamilySelectors.familyMemberCard);
        const editButton = cards.nth(index).locator(FamilySelectors.editButton);
        await editButton.click();
        await this.waitForLoad();
    }

    /**
     * Edit family member information
     */
    async editFamilyMember(index: number, updates: Partial<TestFamilyMember>): Promise<void> {
        await this.clickEditFamilyMember(index);

        if (updates.firstName) {
            await this.fill(FamilySelectors.firstNameInput, updates.firstName);
        }
        if (updates.lastName) {
            await this.fill(FamilySelectors.lastNameInput, updates.lastName);
        }
        if (updates.dateOfBirth) {
            await this.fill(FamilySelectors.dateOfBirthInput, updates.dateOfBirth);
        }
        if (updates.gender) {
            await this.page.selectOption(FamilySelectors.genderSelect, updates.gender);
        }

        await this.submitFamilyMemberForm();
    }

    /**
     * Click delete on family member by index
     */
    async clickDeleteFamilyMember(index: number = 0): Promise<void> {
        const cards = this.locator(FamilySelectors.familyMemberCard);
        const deleteButton = cards.nth(index).locator(FamilySelectors.deleteButton);
        await deleteButton.click();
    }

    /**
     * Confirm deletion
     */
    async confirmDelete(): Promise<void> {
        await this.click(FamilySelectors.confirmDeleteButton);
        await this.waitForLoad();
    }

    /**
     * Delete family member
     */
    async deleteFamilyMember(index: number = 0): Promise<void> {
        await this.clickDeleteFamilyMember(index);
        await this.confirmDelete();
    }

    /**
     * Verify family member is in list
     */
    async verifyFamilyMemberInList(firstName: string, lastName: string): Promise<void> {
        const memberCard = this.locator(FamilySelectors.familyMemberCard)
            .filter({ hasText: firstName })
            .filter({ hasText: lastName });
        await expect(memberCard).toBeVisible();
    }

    /**
     * Verify family member is removed from list
     */
    async verifyFamilyMemberRemoved(firstName: string, lastName: string): Promise<void> {
        const memberCard = this.locator(FamilySelectors.familyMemberCard)
            .filter({ hasText: firstName })
            .filter({ hasText: lastName });
        await expect(memberCard).not.toBeVisible();
    }
}

