/**
 * Household Sign-Up Integration Service
 * Manages household creation during the sign-up process
 */

import { HouseholdsApiService } from '../../../Services/HouseholdsApiService';
import { CreateHouseholdApiRequest, HouseholdResponse } from '../types/api.types';

export interface HouseholdSignUpState {
  hasOfferedSetup: boolean;
  userChoice: 'setup' | 'skip' | 'later' | null;
  completionStatus: 'pending' | 'completed' | 'skipped';
  householdId: number | null;
  lastPromptDate: Date | null;
}

export interface HouseholdSignUpActions {
  offerHouseholdSetup: () => Promise<void>;
  createHousehold: (data: CreateHouseholdApiRequest) => Promise<HouseholdResponse>;
  skipHouseholdSetup: () => Promise<void>;
  deferHouseholdSetup: () => Promise<void>;
  getSignUpState: () => HouseholdSignUpState;
  updateSignUpState: (state: Partial<HouseholdSignUpState>) => void;
  shouldShowPrompt: () => boolean;
  markPromptShown: () => void;
}

/**
 * Service for integrating household creation with sign-up process
 */
export class HouseholdSignUpIntegrationService implements HouseholdSignUpActions {
  private apiService: HouseholdsApiService;
  private storageKey = 'household_signup_state';

  constructor(apiService: HouseholdsApiService) {
    this.apiService = apiService;
  }

  /**
   * Offer household setup after email confirmation
   */
  async offerHouseholdSetup(): Promise<void> {
    try {
      // Update state to show that we've offered setup
      this.updateSignUpState({
        hasOfferedSetup: true,
        completionStatus: 'pending',
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

      // Update sign-up state
      this.updateSignUpState({
        userChoice: 'setup',
        completionStatus: 'completed',
        householdId: household.data.id,
      });

      // Persist state
      this.persistSignUpState();

      return household;
    } catch (error) {
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
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          hasOfferedSetup: parsed.hasOfferedSetup || false,
          userChoice: parsed.userChoice || null,
          completionStatus: parsed.completionStatus || 'pending',
          householdId: parsed.householdId || null,
          lastPromptDate: parsed.lastPromptDate ? new Date(parsed.lastPromptDate) : null,
        };
      }
    } catch (error) {
      console.error('Error reading sign-up state:', error);
    }

    // Return default state
    return {
      hasOfferedSetup: false,
      userChoice: null,
      completionStatus: 'pending',
      householdId: null,
      lastPromptDate: null,
    };
  }

  /**
   * Update sign-up state
   */
  updateSignUpState(state: Partial<HouseholdSignUpState>): void {
    try {
      const currentState = this.getSignUpState();
      const newState = { ...currentState, ...state };
      this.persistSignUpState(newState);
    } catch (error) {
      console.error('Error updating sign-up state:', error);
    }
  }

  /**
   * Check if we should show a completion prompt
   */
  shouldShowPrompt(): boolean {
    const state = this.getSignUpState();

    // Don't show if already completed or permanently skipped
    if (state.completionStatus === 'completed' || state.userChoice === 'skip') {
      return false;
    }

    // Don't show if we haven't offered setup yet
    if (!state.hasOfferedSetup) {
      return false;
    }

    // Show if user chose 'later' and enough time has passed
    if (state.userChoice === 'later' && state.lastPromptDate) {
      const daysSinceLastPrompt = (Date.now() - state.lastPromptDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLastPrompt >= 1; // Show again after 1 day
    }

    // Show if user hasn't made a choice yet
    return state.userChoice === null;
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
   */
  private persistSignUpState(state?: HouseholdSignUpState): void {
    try {
      const stateToStore = state || this.getSignUpState();
      localStorage.setItem(this.storageKey, JSON.stringify(stateToStore));
    } catch (error) {
      console.error('Error persisting sign-up state:', error);
    }
  }

  /**
   * Clear sign-up state (useful for testing or reset)
   */
  clearSignUpState(): void {
    try {
      localStorage.removeItem(this.storageKey);
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
    shouldShowPrompt: () => integrationService.shouldShowPrompt(),
    hasCompletedSetup: () => integrationService.hasCompletedSetup(),
    getHouseholdId: () => integrationService.getHouseholdId(),

    // Actions
    offerHouseholdSetup: () => integrationService.offerHouseholdSetup(),
    createHousehold: (data: CreateHouseholdApiRequest) => integrationService.createHousehold(data),
    skipHouseholdSetup: () => integrationService.skipHouseholdSetup(),
    deferHouseholdSetup: () => integrationService.deferHouseholdSetup(),
    markPromptShown: () => integrationService.markPromptShown(),
    clearSignUpState: () => integrationService.clearSignUpState(),
  };
};
