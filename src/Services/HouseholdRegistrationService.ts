import axios from 'axios';
import { API_URL } from '../Utils/Urls';
import { UsersMeResponse } from '../Modules/Households/types/api.types';
import { RegistrationResponse, HouseholdRegistrationError } from '../Modules/Registration/types/household-registration.types';

/**
 * HouseholdRegistrationService
 * 
 * Service class for handling household-based registration operations.
 * Provides methods for registering with household data and checking completeness.
 */
export class HouseholdRegistrationService {
  private readonly timeout = 5000; // 5 seconds timeout
  private readonly maxRetryAttempts = 3;
  private readonly retryDelay = 1000; // 1 second

  /**
   * Get authentication token from localStorage
   * @returns The Cognito token or null if not found
   */
  private getAuthToken(): string | null {
    try {
      const cognitoUser = localStorage.getItem('cognitoUser');

      if (cognitoUser) {
        const userData = JSON.parse(cognitoUser);

        if (!userData.accessToken) {
          console.warn('⚠️ HouseholdRegistrationService - No accessToken found in userData:', userData);
        }

        return userData.accessToken || null;
      }
      return null;
    } catch (error) {
      console.warn('⚠️ HouseholdRegistrationService - Error parsing cognitoUser:', error);
      return null;
    }
  }

  /**
   * Register user with household data using existing registration API
   * @param timeslotData - Event and timeslot information
   * @returns Promise<RegistrationResponse>
   */
  async registerWithHousehold(
    timeslotData: {
      eventId: string;
      eventDateId: string;
      eventSlotId: string;
    }
  ): Promise<RegistrationResponse> {
    return this.registerWithRetry(timeslotData, 0);
  }

  /**
   * Register with retry logic for transient errors
   * @param timeslotData - Event and timeslot information
   * @param attempt - Current attempt number
   * @returns Promise<RegistrationResponse>
   */
  private async registerWithRetry(
    timeslotData: {
      eventId: string;
      eventDateId: string;
      eventSlotId: string;
    },
    attempt: number
  ): Promise<RegistrationResponse> {
    try {
      const headers = {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
      };

      const payload = {
        event_id: timeslotData.eventId,
        event_date_id: timeslotData.eventDateId,
        event_slot_id: timeslotData.eventSlotId,
      };


      const response = await axios.post<RegistrationResponse>(
        API_URL.CREATE_RESERVATION,
        payload,
        {
          headers,
          timeout: this.timeout,
        }
      );


      return {
        success: true,
        message: 'Registration completed successfully',
        data: response.data,
      };
    } catch (error: any) {
      console.error(`❌ Household registration failed (attempt ${attempt + 1}):`, error);

      const registrationError = this.mapApiError(error);

      // Check if we should retry
      if (registrationError.retryable && attempt < this.maxRetryAttempts - 1) {
        await this.delay(this.retryDelay);
        return this.registerWithRetry(timeslotData, attempt + 1);
      }

      return {
        success: false,
        error: registrationError.message,
        message: 'Registration failed',
      };
    }
  }

  /**
   * Delay execution for retry logic
   * @param ms - Milliseconds to delay
   * @returns Promise<void>
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if household data is complete enough for registration
   * @param householdData - User's household data
   * @returns boolean indicating completeness
   */
  checkHouseholdCompleteness(householdData: UsersMeResponse): boolean {
    // Required fields for registration
    const requiredFields = [
      'address_line_1',
      'city',
      'state',
      'zip_code',
      'phone',
      'email',
    ];

    // Check if all required fields are present and not empty
    const hasRequiredFields = requiredFields.every(field => {
      const value = householdData[field as keyof UsersMeResponse];
      return value !== null && value !== undefined && value !== '';
    });

    // Check if household has at least one member
    const hasMembers = householdData.counts.total > 0;

    // Check if counts are valid (non-negative)
    const hasValidCounts = Object.values(householdData.counts).every(count => count >= 0);

    const isComplete = hasRequiredFields && hasMembers && hasValidCounts;

    return isComplete;
  }

  /**
   * Map API errors to user-friendly messages
   * @param error - Axios error object
   * @returns HouseholdRegistrationError
   */
  private mapApiError(error: any): HouseholdRegistrationError {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        type: 'TIMEOUT_ERROR',
        message: 'Request timed out. Please try again.',
        retryable: true,
      };
    }

    if (error.response?.status === 401) {
      return {
        type: 'API_ERROR',
        message: 'Authentication failed. Please sign in again.',
        code: 'AUTH_ERROR',
        retryable: false,
      };
    }

    if (error.response?.status === 409) {
      return {
        type: 'API_ERROR',
        message: 'This timeslot is no longer available. Please select another time.',
        code: 'TIMESLOT_CONFLICT',
        retryable: false,
      };
    }

    if (error.response?.status === 422) {
      return {
        type: 'VALIDATION_ERROR',
        message: 'Invalid registration data. Please review your information.',
        code: 'VALIDATION_ERROR',
        retryable: false,
      };
    }

    if (error.response?.status >= 500) {
      return {
        type: 'API_ERROR',
        message: 'Server error. Please try again later.',
        code: 'SERVER_ERROR',
        retryable: true,
      };
    }

    if (!error.response) {
      // Check if it's a timeout error
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return {
          type: 'TIMEOUT_ERROR',
          message: 'Request timed out. Please try again.',
          retryable: true,
        };
      }

      // Check if it's a network-related error
      if (error.message?.includes('Network') || error.code === 'NETWORK_ERROR') {
        return {
          type: 'NETWORK_ERROR',
          message: 'Network error. Please check your connection and try again.',
          retryable: true,
        };
      }

      // Unknown errors without response are not retryable
      return {
        type: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred. Please try again.',
        retryable: false,
      };
    }

    return {
      type: 'API_ERROR',
      message: error.response?.data?.message || 'An unexpected error occurred.',
      code: error.response?.status?.toString(),
      retryable: true,
    };
  }
}

// Export singleton instance
export const householdRegistrationService = new HouseholdRegistrationService();
