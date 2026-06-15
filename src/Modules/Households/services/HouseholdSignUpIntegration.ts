/**
 * Household Sign-Up Integration Service
 * Manages household creation during the sign-up process
 */

import { HouseholdsApiService } from '../../../Services/HouseholdsApiService';
import { CreateHouseholdApiRequest, HouseholdResponse } from '../types/api.types';
import { StorageService } from '../../../Utils/StorageService';
import {
  hasValidNewUserSignupFlag,
  clearNewUserSignupFlag,
  storeHouseholdToLocalStorage,
  isUserAlreadyExistsError,
} from '../../../Utils/UserRecordHelper';

export interface HouseholdSignUpState {
  hasOfferedSetup: boolean;
  userChoice: 'setup' | 'skip' | 'later' | null;
  completionStatus: 'pending' | 'completed' | 'skipped';
  householdId: number | null;
  lastPromptDate: Date | null;
  isNewUser: boolean; // Track if this is a new user who just completed email confirmation
  userId: string | null; // Track which user this state belongs to
}

export interface HouseholdSignUpActions {
  offerHouseholdSetup: (userEmail: string) => Promise<void>;
  createHousehold: (data: CreateHouseholdApiRequest) => Promise<HouseholdResponse>;
  skipHouseholdSetup: () => Promise<void>;
  deferHouseholdSetup: () => Promise<void>;
  getSignUpState: () => HouseholdSignUpState;
  updateSignUpState: (state: Partial<HouseholdSignUpState>) => void;
  shouldShowPrompt: (currentUserEmail: string) => boolean;
  markPromptShown: () => void;
  isNewUserSignUp: (userEmail: string) => boolean;
}

/**
 * Service for integrating household creation with sign-up process
 */
export class HouseholdSignUpIntegrationService implements HouseholdSignUpActions {
  private apiService: HouseholdsApiService;

  constructor(apiService: HouseholdsApiService) {
    this.apiService = apiService;
  }

  /**
   * Offer household setup after email confirmation
   */
  async offerHouseholdSetup(userEmail: string): Promise<void> {
    try {
      // Update state to show that we've offered setup for this specific user
      this.updateSignUpState({
        hasOfferedSetup: true,
        completionStatus: 'pending',
        isNewUser: true,
        userId: userEmail,
      });

      // Store in localStorage for persistence
      this.persistSignUpState();
    } catch (error) {
      console.error('Error offering household setup:', error);
      throw new Error('Failed to offer household setup');
    }
  }

  /**
   * Create household during sign-up process
   */
  async createHousehold(data: CreateHouseholdApiRequest): Promise<HouseholdResponse> {
    try {
      // Create household via API
      const household = await this.apiService.createHousehold(data);

      // Store household data using centralized helper
      storeHouseholdToLocalStorage(household);

      // Update sign-up state
      this.updateSignUpState({
        userChoice: 'setup',
        completionStatus: 'completed',
        householdId: household.data.id,
      });

      // Persist state
      this.persistSignUpState();

      return household;
    } catch (error: any) {
      // If user already exists, treat as success and update state
      if (isUserAlreadyExistsError(error)) {
        this.updateSignUpState({
          userChoice: 'setup',
          completionStatus: 'completed',
        });
        this.persistSignUpState();
        // Re-throw to let caller handle fetching existing data
      }
      console.error('Error creating household during sign-up:', error);
      throw error;
    }
  }

  /**
   * Skip household setup permanently
   */
  async skipHouseholdSetup(): Promise<void> {
    try {
      this.updateSignUpState({
        userChoice: 'skip',
        completionStatus: 'skipped',
      });

      this.persistSignUpState();
    } catch (error) {
      console.error('Error skipping household setup:', error);
      throw new Error('Failed to skip household setup');
    }
  }

  /**
   * Defer household setup to later
   */
  async deferHouseholdSetup(): Promise<void> {
    try {
      this.updateSignUpState({
        userChoice: 'later',
        completionStatus: 'pending',
        lastPromptDate: new Date(),
      });

      this.persistSignUpState();
    } catch (error) {
      console.error('Error deferring household setup:', error);
      throw new Error('Failed to defer household setup');
    }
  }

  /**
   * Get current sign-up state
   */
  getSignUpState(): HouseholdSignUpState {
    const state = StorageService.getHouseholdSignUpState();

    if (state) {
      return state;
    }

    // Return default state
    return {
      hasOfferedSetup: false,
      userChoice: null,
      completionStatus: 'pending',
      householdId: null,
      lastPromptDate: null,
      isNewUser: false,
      userId: null,
    };
  }

  /**
   * Update sign-up state
   */
  updateSignUpState(state: Partial<HouseholdSignUpState>): void {
    try {
      const currentState = this.getSignUpState();
      const newState: HouseholdSignUpState = { ...currentState, ...state };
      StorageService.setHouseholdSignUpState(newState);
    } catch (error) {
      console.error('Error updating sign-up state:', error);
    }
  }

  /**
   * Check if we should show a completion prompt
   */
  shouldShowPrompt(currentUserEmail: string): boolean {
    return StorageService.shouldShowRegistrationPrompt(currentUserEmail);
  }

  /**
   * Mark that we've shown a prompt
   */
  markPromptShown(): void {
    this.updateSignUpState({
      lastPromptDate: new Date(),
    });
  }

  /**
   * Persist sign-up state to localStorage
   * @deprecated Use StorageService.setHouseholdSignUpState() directly
   */
  private persistSignUpState(state?: HouseholdSignUpState): void {
    try {
      const stateToStore = state || this.getSignUpState();
      StorageService.setHouseholdSignUpState(stateToStore);
    } catch (error) {
      console.error('Error persisting sign-up state:', error);
    }
  }

  /**
   * Clear sign-up state (useful for testing or reset)
   */
  clearSignUpState(): void {
    try {
      StorageService.removeItem('household_signup_state');
    } catch (error) {
      console.error('Error clearing sign-up state:', error);
    }
  }

  /**
   * Check if user has completed household setup
   */
  hasCompletedSetup(): boolean {
    const state = this.getSignUpState();
    return state.completionStatus === 'completed' && state.householdId !== null;
  }

  /**
   * Get household ID if available
   */
  getHouseholdId(): number | null {
    const state = this.getSignUpState();
    return state.householdId;
  }

  /**
   * Check if this is a new user sign-up (just completed email confirmation)
   * Note: No expiration time - flag is cleared after processing to handle session timeouts
   */
  isNewUserSignUp(userEmail: string): boolean {
    try {
      // Check if there's a valid new user signup flag
      if (hasValidNewUserSignupFlag(userEmail)) {
        // Clear the flag since we're processing it
        clearNewUserSignupFlag();
        return true;
      }

      // Check if this is an existing user signing in (not a new signup)
      // If there's old household state but no new user flag, this is likely a sign-in
      const state = this.getSignUpState();

      // If user has old state but no new user flag, they're signing in (not signing up)
      if (state.hasOfferedSetup) {
        // Clear old state for this user since they're signing in fresh
        this.clearSignUpState();
        return false;
      }

      const fallbackResult =
        state.isNewUser && state.userId === userEmail && !state.hasOfferedSetup;

      return fallbackResult;
    } catch (error) {
      console.error('Error checking new user signup:', error);
      return false;
    }
  }
}

/**
 * Hook for using household sign-up integration
 */
export const useHouseholdSignUpIntegration = () => {
  const apiService = new HouseholdsApiService();
  const integrationService = new HouseholdSignUpIntegrationService(apiService);

  return {
    // State
    getSignUpState: () => integrationService.getSignUpState(),
    shouldShowPrompt: (userEmail: string) => integrationService.shouldShowPrompt(userEmail),
    hasCompletedSetup: () => integrationService.hasCompletedSetup(),
    getHouseholdId: () => integrationService.getHouseholdId(),
    isNewUserSignUp: (userEmail: string) => integrationService.isNewUserSignUp(userEmail),

    // Actions
    offerHouseholdSetup: (userEmail: string) => integrationService.offerHouseholdSetup(userEmail),
    createHousehold: (data: CreateHouseholdApiRequest) => integrationService.createHousehold(data),
    skipHouseholdSetup: () => integrationService.skipHouseholdSetup(),
    deferHouseholdSetup: () => integrationService.deferHouseholdSetup(),
    markPromptShown: () => integrationService.markPromptShown(),
    clearSignUpState: () => integrationService.clearSignUpState(),
  };
};
