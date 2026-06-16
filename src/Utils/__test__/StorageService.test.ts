/**
 * StorageService Unit Tests
 *
 * Comprehensive test suite for StorageService including:
 * - Core CRUD operations
 * - Error handling scenarios
 * - Helper methods
 * - Integration scenarios
 */

import {
  StorageService,
  CognitoUser,
  GuestUserProfile,
  HouseholdSignUpState,
} from '../StorageService';
import { validateToken } from '../TokenUtils';

// Mock TokenUtils
jest.mock('../TokenUtils', () => ({
  validateToken: jest.fn(),
}));

describe('StorageService', () => {
  let mockLocalStorage: { [key: string]: string };
  let mockSessionStorage: { [key: string]: string };

  beforeEach(() => {
    // Reset storage mocks
    mockLocalStorage = {};
    mockSessionStorage = {};

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: jest.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
    });

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key: string) => mockSessionStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockSessionStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockSessionStorage[key];
        }),
        clear: jest.fn(() => {
          mockSessionStorage = {};
        }),
      },
      writable: true,
    });

    jest.clearAllMocks();
  });

  // ============================================================================
  // Core CRUD Operations Tests
  // ============================================================================

  describe('Core Operations', () => {
    describe('getItem', () => {
      it('should retrieve and parse JSON item from localStorage', () => {
        const testData = { name: 'test', value: 123 };
        mockLocalStorage['freshtrak_user_test'] = JSON.stringify(testData);

        const result = StorageService.getItem<typeof testData>('test');
        expect(result).toEqual(testData);
      });

      it('should return null for non-existent key', () => {
        const result = StorageService.getItem('nonexistent');
        expect(result).toBeNull();
      });

      it('should migrate legacy keys to namespaced keys', () => {
        const testData = { data: 'test' };
        mockLocalStorage['cognitoUser'] = JSON.stringify(testData);

        const result = StorageService.getItem('cognitoUser');
        expect(result).toEqual(testData);
        // Should have migrated to new key
        expect(mockLocalStorage['freshtrak_user_cognito']).toBeDefined();
        expect(mockLocalStorage['cognitoUser']).toBeUndefined();
      });

      it('should handle corrupted JSON gracefully', () => {
        mockLocalStorage['freshtrak_user_test'] = 'invalid json{';

        const result = StorageService.getItem('test');
        expect(result).toBe('invalid json{'); // Returns raw string for backward compatibility
      });

      it('should retrieve from sessionStorage when specified', () => {
        const testData = { session: 'data' };
        // Use the normalized key directly since sessionStorage uses freshtrak_session_ prefix
        mockSessionStorage['freshtrak_session_test'] = JSON.stringify(testData);

        const result = StorageService.getItem('test', 'session');
        expect(result).toEqual(testData);
      });
    });

    describe('setItem', () => {
      it('should store and stringify JSON item to localStorage', () => {
        const testData = { name: 'test', value: 123 };
        StorageService.setItem('test', testData);

        expect(mockLocalStorage['freshtrak_user_test']).toBe(JSON.stringify(testData));
      });

      it('should use namespaced keys', () => {
        StorageService.setItem('test', { data: 'value' });
        expect(mockLocalStorage['freshtrak_user_test']).toBeDefined();
      });

      it('should store to sessionStorage when specified', () => {
        const testData = { session: 'data' };
        StorageService.setItem('test', testData, 'session');

        // Check that sessionStorage.setItem was called with the correct key
        expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
          'freshtrak_session_test',
          JSON.stringify(testData),
        );
      });

      it('should handle quota exceeded error with cleanup', () => {
        const originalSetItem = window.localStorage.setItem;
        let callCount = 0;
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Mock setItem to throw QuotaExceededError on first call, succeed on second
        window.localStorage.setItem = jest.fn((key: string, value: string) => {
          callCount++;
          if (callCount === 1) {
            const error = new DOMException('Quota exceeded', 'QuotaExceededError');
            throw error;
          }
          originalSetItem.call(window.localStorage, key, value);
        });

        const testData = { data: 'test' };
        StorageService.setItem('test', testData);

        expect(window.localStorage.setItem).toHaveBeenCalledTimes(2);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Storage quota exceeded. Clearing old data...',
        );

        consoleErrorSpy.mockRestore();
      });

      it('should throw error if quota exceeded after cleanup fails', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        window.localStorage.setItem = jest.fn(() => {
          const error = new DOMException('Quota exceeded', 'QuotaExceededError');
          throw error;
        });

        expect(() => {
          StorageService.setItem('test', { data: 'test' });
        }).toThrow('Storage quota exceeded and cleanup failed');
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Storage quota exceeded. Clearing old data...',
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to store item after cleanup:',
          expect.any(DOMException),
        );

        consoleErrorSpy.mockRestore();
      });
    });

    describe('removeItem', () => {
      it('should remove item from localStorage', () => {
        mockLocalStorage['freshtrak_user_test'] = JSON.stringify({ data: 'test' });
        StorageService.removeItem('test');

        expect(mockLocalStorage['freshtrak_user_test']).toBeUndefined();
      });

      it('should remove both legacy and normalized keys', () => {
        mockLocalStorage['cognitoUser'] = JSON.stringify({ data: 'test' });
        mockLocalStorage['freshtrak_user_cognito'] = JSON.stringify({ data: 'test' });

        StorageService.removeItem('cognitoUser');
        expect(mockLocalStorage['cognitoUser']).toBeUndefined();
        expect(mockLocalStorage['freshtrak_user_cognito']).toBeUndefined();
      });

      it('should remove from sessionStorage when specified', () => {
        mockSessionStorage['freshtrak_session_test'] = JSON.stringify({ data: 'test' });
        StorageService.removeItem('test', 'session');

        // Check that sessionStorage.removeItem was called
        expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('freshtrak_session_test');
        // Also verify the mock was cleared
        expect(mockSessionStorage['freshtrak_session_test']).toBeUndefined();
      });
    });

    describe('clear', () => {
      it('should clear all localStorage items', () => {
        mockLocalStorage['freshtrak_user_test1'] = 'value1';
        mockLocalStorage['freshtrak_user_test2'] = 'value2';

        StorageService.clear('local');
        expect(window.localStorage.clear).toHaveBeenCalled();
      });

      it('should clear sessionStorage when specified', () => {
        mockSessionStorage['freshtrak_session_test'] = 'value';
        StorageService.clear('session');

        expect(window.sessionStorage.clear).toHaveBeenCalled();
      });
    });
  });

  // ============================================================================
  // Authentication Helper Methods Tests
  // ============================================================================

  describe('Authentication Helpers', () => {
    describe('isLoggedInUser', () => {
      it('should return true for valid Cognito user with valid token', () => {
        const mockUser: CognitoUser = {
          email: 'test@example.com',
          name: 'Test User',
          isSignedIn: true,
          accessToken: 'valid-token',
          signInDetails: {
            isSignedIn: true,
            accessToken: 'valid-token',
          },
        };

        mockLocalStorage['freshtrak_user_cognito'] = JSON.stringify(mockUser);
        (validateToken as jest.Mock).mockReturnValue({ isValid: true, isExpired: false });

        expect(StorageService.isLoggedInUser()).toBe(true);
      });

      it('should return false for expired token', () => {
        const mockUser: CognitoUser = {
          email: 'test@example.com',
          name: 'Test User',
          isSignedIn: true,
          accessToken: 'expired-token',
          signInDetails: {
            isSignedIn: true,
            accessToken: 'expired-token',
          },
        };

        mockLocalStorage['freshtrak_user_cognito'] = JSON.stringify(mockUser);
        (validateToken as jest.Mock).mockReturnValue({ isValid: true, isExpired: true });

        expect(StorageService.isLoggedInUser()).toBe(false);
      });

      it('should return false when no user exists', () => {
        expect(StorageService.isLoggedInUser()).toBe(false);
      });
    });

    describe('getCognitoUser', () => {
      it('should return CognitoUser object when valid', () => {
        const mockUser: CognitoUser = {
          email: 'test@example.com',
          name: 'Test User',
          isSignedIn: true,
          accessToken: 'valid-token',
          signInDetails: {
            isSignedIn: true,
            accessToken: 'valid-token',
          },
        };

        mockLocalStorage['freshtrak_user_cognito'] = JSON.stringify(mockUser);
        (validateToken as jest.Mock).mockReturnValue({ isValid: true, isExpired: false });

        const result = StorageService.getCognitoUser();
        expect(result).toEqual(mockUser);
      });

      it('should return null and clear expired user data', () => {
        const mockUser: CognitoUser = {
          email: 'test@example.com',
          name: 'Test User',
          isSignedIn: true,
          accessToken: 'expired-token',
          signInDetails: {
            isSignedIn: true,
            accessToken: 'expired-token',
          },
        };

        mockLocalStorage['freshtrak_user_cognito'] = JSON.stringify(mockUser);
        mockLocalStorage['freshtrak_user_token'] = 'token';
        (validateToken as jest.Mock).mockReturnValue({ isValid: false, isExpired: true });

        const result = StorageService.getCognitoUser();
        expect(result).toBeNull();
        expect(mockLocalStorage['freshtrak_user_cognito']).toBeUndefined();
        expect(mockLocalStorage['freshtrak_user_token']).toBeUndefined();
      });
    });

    describe('getGuestUser', () => {
      it('should return GuestUserProfile when valid and not expired', () => {
        const futureDate = new Date();
        futureDate.setHours(futureDate.getHours() + 1);
        const mockProfile: GuestUserProfile = {
          expires_at: futureDate.toISOString(),
          token: 'guest-token',
        };

        mockLocalStorage['freshtrak_user_guest'] = JSON.stringify(mockProfile);

        const result = StorageService.getGuestUser();
        expect(result).toEqual(mockProfile);
      });

      it('should return null and remove expired guest profile', () => {
        const pastDate = new Date();
        pastDate.setHours(pastDate.getHours() - 1);
        const mockProfile: GuestUserProfile = {
          expires_at: pastDate.toISOString(),
        };

        mockLocalStorage['freshtrak_user_guest'] = JSON.stringify(mockProfile);

        const result = StorageService.getGuestUser();
        expect(result).toBeNull();
        expect(mockLocalStorage['freshtrak_user_guest']).toBeUndefined();
      });

      it('should return null when profile does not exist', () => {
        expect(StorageService.getGuestUser()).toBeNull();
      });
    });

    describe('isGuestUser', () => {
      it('should return true for valid guest user', () => {
        const futureDate = new Date();
        futureDate.setHours(futureDate.getHours() + 1);
        const mockProfile: GuestUserProfile = {
          expires_at: futureDate.toISOString(),
        };

        mockLocalStorage['freshtrak_user_guest'] = JSON.stringify(mockProfile);

        expect(StorageService.isGuestUser()).toBe(true);
      });

      it('should return false when no guest user exists', () => {
        expect(StorageService.isGuestUser()).toBe(false);
      });
    });
  });

  // ============================================================================
  // Token Management Tests
  // ============================================================================

  describe('Token Management', () => {
    describe('getUserToken', () => {
      it('should return token from CognitoUser', () => {
        const mockUser: CognitoUser = {
          email: 'test@example.com',
          name: 'Test User',
          isSignedIn: true,
          accessToken: 'cognito-token',
          signInDetails: {
            isSignedIn: true,
            accessToken: 'cognito-token',
          },
        };

        mockLocalStorage['freshtrak_user_cognito'] = JSON.stringify(mockUser);
        (validateToken as jest.Mock).mockReturnValue({ isValid: true, isExpired: false });

        expect(StorageService.getUserToken()).toBe('cognito-token');
      });

      it('should return token from direct token storage', () => {
        mockLocalStorage['freshtrak_user_token'] = JSON.stringify('direct-token');

        expect(StorageService.getUserToken()).toBe('direct-token');
      });

      it('should return null when no token exists', () => {
        expect(StorageService.getUserToken()).toBeNull();
      });
    });

    describe('setUserToken', () => {
      it('should store token in storage', () => {
        StorageService.setUserToken('test-token');
        expect(mockLocalStorage['freshtrak_user_token']).toBe(JSON.stringify('test-token'));
      });
    });

    describe('clearUserToken', () => {
      it('should remove token from storage', () => {
        mockLocalStorage['freshtrak_user_token'] = 'token';
        StorageService.clearUserToken();
        expect(mockLocalStorage['freshtrak_user_token']).toBeUndefined();
      });
    });
  });

  // ============================================================================
  // Household Helper Methods Tests
  // ============================================================================

  describe('Household Helpers', () => {
    describe('hasHouseholdData', () => {
      it('should return true when household ID exists', () => {
        const mockState: HouseholdSignUpState = {
          hasOfferedSetup: true,
          userChoice: 'setup',
          completionStatus: 'completed',
          householdId: 123,
          lastPromptDate: null,
          isNewUser: false,
          userId: 'user@example.com',
        };

        mockLocalStorage['freshtrak_household_signup_state'] = JSON.stringify({
          ...mockState,
          lastPromptDate: null,
        });

        expect(StorageService.hasHouseholdData()).toBe(true);
      });

      it('should return false when no household ID', () => {
        const mockState: HouseholdSignUpState = {
          hasOfferedSetup: true,
          userChoice: null,
          completionStatus: 'pending',
          householdId: null,
          lastPromptDate: null,
          isNewUser: false,
          userId: null,
        };

        mockLocalStorage['freshtrak_household_signup_state'] = JSON.stringify({
          ...mockState,
          lastPromptDate: null,
        });

        expect(StorageService.hasHouseholdData()).toBe(false);
      });
    });

    describe('getHouseholdSignUpState', () => {
      it('should return HouseholdSignUpState with Date conversion', () => {
        const date = new Date();
        const mockState = {
          hasOfferedSetup: true,
          userChoice: 'setup',
          completionStatus: 'completed',
          householdId: 123,
          lastPromptDate: date.toISOString(),
          isNewUser: false,
          userId: 'user@example.com',
        };

        mockLocalStorage['freshtrak_household_signup_state'] = JSON.stringify(mockState);

        const result = StorageService.getHouseholdSignUpState();
        expect(result).toBeDefined();
        expect(result?.lastPromptDate).toBeInstanceOf(Date);
        expect(result?.lastPromptDate?.getTime()).toBe(date.getTime());
      });

      it('should return null when no state exists', () => {
        expect(StorageService.getHouseholdSignUpState()).toBeNull();
      });
    });

    describe('setHouseholdSignUpState', () => {
      it('should store state with Date converted to ISO string', () => {
        const date = new Date();
        const mockState: HouseholdSignUpState = {
          hasOfferedSetup: true,
          userChoice: 'setup',
          completionStatus: 'completed',
          householdId: 123,
          lastPromptDate: date,
          isNewUser: false,
          userId: 'user@example.com',
        };

        StorageService.setHouseholdSignUpState(mockState);

        const stored = JSON.parse(mockLocalStorage['freshtrak_household_signup_state']);
        expect(stored.lastPromptDate).toBe(date.toISOString());
      });
    });
  });

  // ============================================================================
  // Registration Helper Methods Tests
  // ============================================================================

  describe('Registration Helpers', () => {
    describe('isRegistered', () => {
      it('should return true when household data exists', () => {
        const mockState = {
          hasOfferedSetup: true,
          userChoice: 'setup',
          completionStatus: 'completed',
          householdId: 123,
          lastPromptDate: null,
          isNewUser: false,
          userId: 'user@example.com',
        };

        mockLocalStorage['freshtrak_household_signup_state'] = JSON.stringify({
          ...mockState,
          lastPromptDate: null,
        });

        expect(StorageService.isRegistered()).toBe(true);
      });

      it('should return false when not registered', () => {
        expect(StorageService.isRegistered()).toBe(false);
      });
    });

    describe('shouldShowRegistrationPrompt', () => {
      it('should return true for new user with no choice', () => {
        const mockState = {
          hasOfferedSetup: true,
          userChoice: null,
          completionStatus: 'pending',
          householdId: null,
          lastPromptDate: null,
          isNewUser: true,
          userId: 'user@example.com',
        };

        mockLocalStorage['freshtrak_household_signup_state'] = JSON.stringify({
          ...mockState,
          lastPromptDate: null,
        });

        expect(StorageService.shouldShowRegistrationPrompt('user@example.com')).toBe(true);
      });

      it('should return false for different user', () => {
        const mockState = {
          hasOfferedSetup: true,
          userChoice: null,
          completionStatus: 'pending',
          householdId: null,
          lastPromptDate: null,
          isNewUser: true,
          userId: 'user1@example.com',
        };

        mockLocalStorage['freshtrak_household_signup_state'] = JSON.stringify({
          ...mockState,
          lastPromptDate: null,
        });

        expect(StorageService.shouldShowRegistrationPrompt('user2@example.com')).toBe(false);
      });

      it('should return false when already completed', () => {
        const mockState = {
          hasOfferedSetup: true,
          userChoice: 'setup',
          completionStatus: 'completed',
          householdId: 123,
          lastPromptDate: null,
          isNewUser: true,
          userId: 'user@example.com',
        };

        mockLocalStorage['freshtrak_household_signup_state'] = JSON.stringify({
          ...mockState,
          lastPromptDate: null,
        });

        expect(StorageService.shouldShowRegistrationPrompt('user@example.com')).toBe(false);
      });

      it('should return true when user chose "later" and 1+ days passed', () => {
        const date = new Date();
        date.setDate(date.getDate() - 2); // 2 days ago

        const mockState = {
          hasOfferedSetup: true,
          userChoice: 'later',
          completionStatus: 'pending',
          householdId: null,
          lastPromptDate: date.toISOString(),
          isNewUser: true,
          userId: 'user@example.com',
        };

        mockLocalStorage['freshtrak_household_signup_state'] = JSON.stringify(mockState);

        expect(StorageService.shouldShowRegistrationPrompt('user@example.com')).toBe(true);
      });
    });
  });

  // ============================================================================
  // Session Management Tests
  // ============================================================================

  describe('Session Management', () => {
    describe('clearAuthData', () => {
      it('should clear Cognito data for cognito user type', () => {
        mockLocalStorage['freshtrak_user_cognito'] = 'data';
        mockLocalStorage['freshtrak_user_token'] = 'token';
        mockLocalStorage['freshtrak_user_logged_in'] = 'true';
        mockLocalStorage['freshtrak_user_current'] = 'current';

        StorageService.clearAuthData('cognito');

        expect(mockLocalStorage['freshtrak_user_cognito']).toBeUndefined();
        expect(mockLocalStorage['freshtrak_user_token']).toBeUndefined();
        expect(mockLocalStorage['freshtrak_user_logged_in']).toBeUndefined();
        expect(mockLocalStorage['freshtrak_user_current']).toBeUndefined();
      });

      it('should clear guest data for guest user type', () => {
        mockLocalStorage['freshtrak_user_guest'] = 'data';
        mockLocalStorage['freshtrak_user_token'] = 'token';
        mockLocalStorage['freshtrak_user_current'] = 'current';

        StorageService.clearAuthData('guest');

        expect(mockLocalStorage['freshtrak_user_guest']).toBeUndefined();
        expect(mockLocalStorage['freshtrak_user_token']).toBeUndefined();
        expect(mockLocalStorage['freshtrak_user_current']).toBeUndefined();
      });
    });

    describe('clearAllAuthData', () => {
      it('should clear all authentication data', () => {
        mockLocalStorage['freshtrak_user_cognito'] = 'data';
        mockLocalStorage['freshtrak_user_guest'] = 'data';
        mockLocalStorage['freshtrak_user_token'] = 'token';
        mockLocalStorage['freshtrak_user_current'] = 'current';
        mockLocalStorage['freshtrak_user_logged_in'] = 'true';

        StorageService.clearAllAuthData();

        expect(mockLocalStorage['freshtrak_user_cognito']).toBeUndefined();
        expect(mockLocalStorage['freshtrak_user_guest']).toBeUndefined();
        expect(mockLocalStorage['freshtrak_user_token']).toBeUndefined();
        expect(mockLocalStorage['freshtrak_user_current']).toBeUndefined();
        expect(mockLocalStorage['freshtrak_user_logged_in']).toBeUndefined();
      });
    });

    describe('getRegisteredEventDateID / setRegisteredEventDateID', () => {
      it('should store and retrieve event date ID from session storage', () => {
        StorageService.setRegisteredEventDateID('event-date-123');
        expect(mockSessionStorage['freshtrak_session_registered_event_date_id']).toBe(
          JSON.stringify('event-date-123'),
        );

        const result = StorageService.getRegisteredEventDateID();
        expect(result).toBe('event-date-123');
      });
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle corrupted JSON gracefully in getItem', () => {
      mockLocalStorage['freshtrak_user_test'] = 'invalid{json}';
      const result = StorageService.getItem('test');
      expect(result).toBe('invalid{json}'); // Returns raw string
    });

    it('should handle missing storage gracefully', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      // Simulate storage not available
      Object.defineProperty(window, 'localStorage', {
        value: null,
        writable: true,
      });

      // Should not throw, but may return null
      expect(() => StorageService.getItem('test')).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Error getting item from storage (key: test):',
        expect.any(TypeError),
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle storage errors in setItem', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      window.localStorage.setItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        StorageService.setItem('test', { data: 'value' });
      }).toThrow('Storage error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error setting item in storage (key: test):',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  // ============================================================================
  // Key Migration Tests
  // ============================================================================

  describe('Key Migration', () => {
    it('should migrate cognitoUser to freshtrak_user_cognito', () => {
      const testData = { email: 'test@example.com' };
      mockLocalStorage['cognitoUser'] = JSON.stringify(testData);

      StorageService.getItem('cognitoUser');

      expect(mockLocalStorage['freshtrak_user_cognito']).toBeDefined();
      expect(mockLocalStorage['cognitoUser']).toBeUndefined();
    });

    it('should migrate userToken to freshtrak_user_token', () => {
      mockLocalStorage['userToken'] = JSON.stringify('token-value');

      StorageService.getItem('userToken');

      expect(mockLocalStorage['freshtrak_user_token']).toBeDefined();
      expect(mockLocalStorage['userToken']).toBeUndefined();
    });

    it('should migrate household_signup_state to freshtrak_household_signup_state', () => {
      const testData = { hasOfferedSetup: true };
      mockLocalStorage['household_signup_state'] = JSON.stringify(testData);

      StorageService.getItem('household_signup_state');

      expect(mockLocalStorage['freshtrak_household_signup_state']).toBeDefined();
      expect(mockLocalStorage['household_signup_state']).toBeUndefined();
    });
  });
});
