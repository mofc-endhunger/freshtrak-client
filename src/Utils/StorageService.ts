/**
 * Storage Service - Unified storage management for FreshTrak
 * 
 * Provides a centralized, type-safe abstraction for localStorage and sessionStorage
 * with automatic error handling, data expiration, and helper methods for UI rendering.
 */

import { validateToken } from './TokenUtils';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Cognito authenticated user data structure
 */
export interface CognitoUser {
    email: string;
    name: string;
    isSignedIn: boolean;
    accessToken: string;
    signInDetails: {
        isSignedIn: boolean;
        accessToken: string;
    };
    accountCreatedDate?: string;
    accountLastModified?: string;
    userStatus?: string;
}

/**
 * Guest user profile data structure
 */
export interface GuestUserProfile {
    expires_at: string; // ISO date string
    [key: string]: any; // Allow additional guest profile fields
}

/**
 * Household sign-up state structure
 */
export interface HouseholdSignUpState {
    hasOfferedSetup: boolean;
    userChoice: 'setup' | 'skip' | 'later' | null;
    completionStatus: 'pending' | 'completed' | 'skipped';
    householdId: number | null;
    lastPromptDate: Date | null;
    isNewUser: boolean;
    userId: string | null;
}

/**
 * Storage type enum
 */
export type StorageType = 'local' | 'session';

/**
 * Legacy key mapping for backward compatibility during migration
 */
const LEGACY_KEY_MAP: Record<string, string> = {
    'cognitoUser': 'freshtrak_user_cognito',
    'userToken': 'freshtrak_user_token',
    'userProfile': 'freshtrak_user_guest',
    'currentUser': 'freshtrak_user_current',
    'isLoggedIn': 'freshtrak_user_logged_in',
    'household_signup_state': 'freshtrak_household_signup_state',
    'new_user_signup': 'freshtrak_user_new_signup',
    'registeredEventDateID': 'freshtrak_session_registered_event_date_id',
    'household': 'freshtrak_household_data',
    'householdId': 'freshtrak_household_id',
    'search_zip': 'freshtrak_session_search_zip',
};

/**
 * Namespace prefixes
 */
const NAMESPACES = {
    USER: 'freshtrak_user_',
    HOUSEHOLD: 'freshtrak_household_',
    SESSION: 'freshtrak_session_',
} as const;

// ============================================================================
// Core Storage Service
// ============================================================================

/**
 * StorageService - Main service class for storage operations
 */
export class StorageService {
    /**
     * Get the storage object based on type
     */
    private static getStorage(storageType: StorageType = 'local'): Storage {
        return storageType === 'local' ? localStorage : sessionStorage;
    }

    /**
     * Normalize key name - converts legacy keys to namespaced keys
     */
    private static normalizeKey(key: string, storageType: StorageType = 'local'): string {
        // If key is already namespaced, return as-is
        if (key.startsWith('freshtrak_')) {
            return key;
        }

        // Check if it's a legacy key
        if (LEGACY_KEY_MAP[key]) {
            return LEGACY_KEY_MAP[key];
        }

        // Use appropriate namespace based on storage type
        const namespace = storageType === 'session' ? NAMESPACES.SESSION : NAMESPACES.USER;
        return `${namespace}${key}`;
    }

    /**
     * Migrate data from legacy key to new namespaced key
     */
    private static migrateKey(oldKey: string, storage: Storage, storageType: StorageType = 'local'): void {
        const newKey = this.normalizeKey(oldKey, storageType);

        // Only migrate if old key exists and new key doesn't
        if (oldKey !== newKey && storage.getItem(oldKey) && !storage.getItem(newKey)) {
            try {
                const value = storage.getItem(oldKey);
                if (value) {
                    storage.setItem(newKey, value);
                    // Remove old key after successful migration
                    storage.removeItem(oldKey);
                }
            } catch (error) {
                console.warn(`Failed to migrate key ${oldKey} to ${newKey}:`, error);
            }
        }
    }

    /**
     * Get item from storage with automatic JSON parsing
     * @param key - Storage key (legacy keys will be automatically migrated)
     * @param storageType - 'local' or 'session', defaults to 'local'
     * @returns Parsed value or null if not found or invalid
     */
    static getItem<T>(key: string, storageType: StorageType = 'local'): T | null {
        try {
            const storage = this.getStorage(storageType);
            const normalizedKey = this.normalizeKey(key, storageType);

            // Attempt migration if using legacy key
            if (key !== normalizedKey) {
                this.migrateKey(key, storage, storageType);
            }

            const item = storage.getItem(normalizedKey);

            if (item === null) {
                return null;
            }

            // Attempt JSON parsing
            try {
                return JSON.parse(item) as T;
            } catch (parseError) {
                // If parsing fails, return the raw string (for backward compatibility)
                // This handles cases where values were stored as plain strings
                return item as unknown as T;
            }
        } catch (error) {
            console.warn(`Error getting item from storage (key: ${key}):`, error);
            return null;
        }
    }

    /**
     * Set item in storage with automatic JSON stringification
     * @param key - Storage key (will be normalized to namespaced key)
     * @param value - Value to store (will be JSON stringified)
     * @param storageType - 'local' or 'session', defaults to 'local'
     */
    static setItem<T>(key: string, value: T, storageType: StorageType = 'local'): void {
        const storage = this.getStorage(storageType);
        const normalizedKey = this.normalizeKey(key, storageType);

        try {
            // Attempt migration if using legacy key
            if (key !== normalizedKey) {
                this.migrateKey(key, storage, storageType);
            }

            // Stringify value
            const stringified = JSON.stringify(value);
            storage.setItem(normalizedKey, stringified);
        } catch (error) {
            // Handle quota exceeded error
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.error('Storage quota exceeded. Clearing old data...');
                // Attempt to clear expired data and retry
                this.clearExpiredData(storageType);
                try {
                    const stringified = JSON.stringify(value);
                    const retryNormalizedKey = this.normalizeKey(key, storageType);
                    storage.setItem(retryNormalizedKey, stringified);
                } catch (retryError) {
                    console.error('Failed to store item after cleanup:', retryError);
                    throw new Error('Storage quota exceeded and cleanup failed');
                }
            } else {
                console.error(`Error setting item in storage (key: ${key}):`, error);
                throw error;
            }
        }
    }

    /**
     * Remove item from storage
     * @param key - Storage key (will check both legacy and normalized keys)
     * @param storageType - 'local' or 'session', defaults to 'local'
     */
    static removeItem(key: string, storageType: StorageType = 'local'): void {
        try {
            const storage = this.getStorage(storageType);
            const normalizedKey = this.normalizeKey(key, storageType);

            // Remove both legacy and normalized keys
            storage.removeItem(key);
            if (key !== normalizedKey) {
                storage.removeItem(normalizedKey);
            }
        } catch (error) {
            console.warn(`Error removing item from storage (key: ${key}):`, error);
        }
    }

    /**
     * Clear all items from storage
     * @param storageType - 'local' or 'session', defaults to 'local'
     */
    static clear(storageType: StorageType = 'local'): void {
        try {
            const storage = this.getStorage(storageType);
            storage.clear();
        } catch (error) {
            console.error(`Error clearing storage (type: ${storageType}):`, error);
        }
    }

    /**
     * Clear expired data from storage
     * Automatically removes expired guest tokens and invalid data
     * @param storageType - 'local' or 'session', defaults to 'local'
     */
    static clearExpiredData(storageType: StorageType = 'local'): void {
        // Check and clear expired guest user profile
        const guestUser = this.getItem<GuestUserProfile>('freshtrak_user_guest', storageType);
        if (guestUser && guestUser.expires_at) {
            try {
                const expiresAt = new Date(guestUser.expires_at);
                if (expiresAt <= new Date()) {
                    this.removeItem('freshtrak_user_guest', storageType);
                }
            } catch (error) {
                // Invalid date, remove it
                this.removeItem('freshtrak_user_guest', storageType);
            }
        }

        // Check and clear expired Cognito tokens
        const cognitoUser = this.getItem<CognitoUser>('freshtrak_user_cognito', storageType);
        if (cognitoUser && cognitoUser.accessToken) {
            const validation = validateToken(cognitoUser.accessToken);
            if (validation.isExpired || !validation.isValid) {
                this.removeItem('freshtrak_user_cognito', storageType);
                this.removeItem('freshtrak_user_token', storageType);
            }
        }
    }

    // ============================================================================
    // Authentication Helper Methods
    // ============================================================================

    /**
     * Check if a Cognito user is logged in
     * @returns true if user is authenticated and token is valid
     */
    static isLoggedInUser(): boolean {
        const cognitoUser = this.getCognitoUser();
        if (!cognitoUser || !cognitoUser.isSignedIn) {
            return false;
        }

        // Validate token
        if (cognitoUser.accessToken) {
            const validation = validateToken(cognitoUser.accessToken);
            return validation.isValid && !validation.isExpired;
        }

        return false;
    }

    /**
     * Get Cognito user data
     * @returns CognitoUser object or null if not found/invalid
     */
    static getCognitoUser(): CognitoUser | null {
        const user = this.getItem<CognitoUser>('freshtrak_user_cognito');

        if (!user) {
            return null;
        }

        // Validate token if present
        if (user.accessToken) {
            const validation = validateToken(user.accessToken);
            if (validation.isExpired || !validation.isValid) {
                // Clear expired user data
                this.removeItem('freshtrak_user_cognito');
                this.removeItem('freshtrak_user_token');
                return null;
            }
        }

        return user;
    }

    /**
     * Get guest user profile
     * @returns GuestUserProfile object or null if not found/expired
     */
    static getGuestUser(): GuestUserProfile | null {
        // Try new namespaced key first
        let profile = this.getItem<GuestUserProfile>('freshtrak_user_guest');

        // If not found, try legacy key directly (for backward compatibility)
        // We access localStorage directly to avoid normalization
        if (!profile) {
            try {
                const storage = this.getStorage('local');
                const legacyValue = storage.getItem('userProfile');
                if (legacyValue) {
                    try {
                        profile = JSON.parse(legacyValue) as GuestUserProfile;
                        // If found via legacy key, migrate it to new key
                        if (profile) {
                            this.setItem('freshtrak_user_guest', profile);
                            // Remove legacy key after migration
                            storage.removeItem('userProfile');
                        }
                    } catch (parseError) {
                        // Invalid JSON in legacy key, remove it
                        storage.removeItem('userProfile');
                        return null;
                    }
                }
            } catch (error) {
                console.warn('Error checking legacy userProfile key:', error);
            }
        }

        if (!profile) {
            return null;
        }

        // Check expiration
        if (profile.expires_at) {
            try {
                const expiresAt = new Date(profile.expires_at);
                if (expiresAt <= new Date()) {
                    // Token expired, remove it
                    this.removeItem('freshtrak_user_guest');
                    // Also remove legacy key directly
                    try {
                        const storage = this.getStorage('local');
                        storage.removeItem('userProfile');
                    } catch (e) {
                        // Ignore errors removing legacy key
                    }
                    return null;
                }
            } catch (error) {
                // Invalid date format, remove it
                this.removeItem('freshtrak_user_guest');
                // Also remove legacy key directly
                try {
                    const storage = this.getStorage('local');
                    storage.removeItem('userProfile');
                } catch (e) {
                    // Ignore errors removing legacy key
                }
                return null;
            }
        }

        return profile;
    }

    /**
     * Check if current user is a guest user
     * @returns true if guest user session is active and valid
     */
    static isGuestUser(): boolean {
        const guestUser = this.getGuestUser();
        return guestUser !== null;
    }

    // ============================================================================
    // Token Management Methods
    // ============================================================================

    /**
     * Get user authentication token
     * Checks both Cognito and guest tokens
     * @returns Token string or null if not found
     */
    static getUserToken(): string | null {
        // Try Cognito token first
        const cognitoUser = this.getCognitoUser();
        if (cognitoUser?.accessToken) {
            return cognitoUser.accessToken;
        }

        // Try direct token storage
        const token = this.getItem<string>('freshtrak_user_token');
        if (token) {
            return token;
        }

        return null;
    }

    /**
     * Set user authentication token
     * @param token - Token string to store
     */
    static setUserToken(token: string): void {
        this.setItem('freshtrak_user_token', token);
    }

    /**
     * Clear user authentication token
     */
    static clearUserToken(): void {
        this.removeItem('freshtrak_user_token');
    }

    // ============================================================================
    // Household Helper Methods
    // ============================================================================

    /**
     * Check if household data exists
     * @returns true if household sign-up state exists and has household ID
     */
    static hasHouseholdData(): boolean {
        const state = this.getHouseholdSignUpState();
        return state !== null && state.householdId !== null;
    }

    /**
     * Get household sign-up state
     * @returns HouseholdSignUpState object or null if not found
     */
    static getHouseholdSignUpState(): HouseholdSignUpState | null {
        const state = this.getItem<{
            hasOfferedSetup: boolean;
            userChoice: 'setup' | 'skip' | 'later' | null;
            completionStatus: 'pending' | 'completed' | 'skipped';
            householdId: number | null;
            lastPromptDate: string | null; // ISO date string in storage
            isNewUser: boolean;
            userId: string | null;
        }>('freshtrak_household_signup_state');

        if (!state) {
            return null;
        }

        // Convert lastPromptDate from string to Date
        return {
            ...state,
            lastPromptDate: state.lastPromptDate ? new Date(state.lastPromptDate) : null,
        };
    }

    /**
     * Set household sign-up state
     * @param state - HouseholdSignUpState object to store
     */
    static setHouseholdSignUpState(state: HouseholdSignUpState): void {
        // Convert Date to ISO string for storage
        const stateToStore = {
            ...state,
            lastPromptDate: state.lastPromptDate ? state.lastPromptDate.toISOString() : null,
        };
        this.setItem('freshtrak_household_signup_state', stateToStore);
    }

    // ============================================================================
    // Registration Helper Methods
    // ============================================================================

    /**
     * Check if user has completed registration
     * @returns true if user has completed registration process
     */
    static isRegistered(): boolean {
        // Check if user has household data
        if (this.hasHouseholdData()) {
            return true;
        }

        // Check if user has completed sign-up process
        const state = this.getHouseholdSignUpState();
        if (state && state.completionStatus === 'completed') {
            return true;
        }

        // Could add additional checks here based on registration requirements
        return false;
    }

    /**
     * Determine if registration prompt should be shown
     * @param userEmail - Current user email
     * @returns true if prompt should be shown
     */
    static shouldShowRegistrationPrompt(userEmail: string): boolean {
        const state = this.getHouseholdSignUpState();

        if (!state) {
            return false;
        }

        // Don't show if this is a different user
        if (state.userId && state.userId !== userEmail) {
            return false;
        }

        // Don't show if already completed or permanently skipped
        if (state.completionStatus === 'completed' || state.userChoice === 'skip') {
            return false;
        }

        // Don't show if we haven't offered setup yet
        if (!state.hasOfferedSetup) {
            return false;
        }

        // Only show for new users
        if (!state.isNewUser) {
            return false;
        }

        // Show if user chose 'later' and enough time has passed (1 day)
        if (state.userChoice === 'later' && state.lastPromptDate) {
            const daysSinceLastPrompt =
                (Date.now() - state.lastPromptDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceLastPrompt >= 1;
        }

        // Show if user hasn't made a choice yet
        return state.userChoice === null;
    }

    // ============================================================================
    // Session Management Methods
    // ============================================================================

    /**
     * Clear authentication data based on user type
     * @param userType - 'cognito' or 'guest'
     */
    static clearAuthData(userType: 'cognito' | 'guest'): void {
        if (userType === 'cognito') {
            this.removeItem('freshtrak_user_cognito');
            this.removeItem('freshtrak_user_token');
            this.removeItem('freshtrak_user_logged_in');
        } else {
            this.removeItem('freshtrak_user_guest');
            this.removeItem('freshtrak_user_token');
        }

        // Clear common auth data
        this.removeItem('freshtrak_user_current');
    }

    /**
     * Clear all authentication data
     */
    static clearAllAuthData(): void {
        this.removeItem('freshtrak_user_cognito');
        this.removeItem('freshtrak_user_guest');
        this.removeItem('freshtrak_user_token');
        this.removeItem('freshtrak_user_current');
        this.removeItem('freshtrak_user_logged_in');
    }

    /**
     * Clear all application data from localStorage
     * This includes all user data, household data, preferences, etc.
     * Use this when user logs out to ensure complete cleanup
     */
    static clearAllAppData(): void {
        try {
            const storage = this.getStorage('local');
            const keysToRemove: string[] = [];

            // Get all keys from localStorage
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (key) {
                    // Remove all freshtrak_ prefixed keys
                    if (key.startsWith('freshtrak_')) {
                        keysToRemove.push(key);
                    }
                    // Remove legacy keys that might still exist
                    if (LEGACY_KEY_MAP[key] ||
                        key === 'householdId' ||
                        key === 'search_zip' ||
                        key === 'pendingUser' ||
                        key === 'shouldShowSetupWizard' ||
                        key === 'household_signup_state' ||
                        key === 'household' ||
                        key === 'isLoggedIn' ||
                        key === 'userToken' ||
                        key === 'cognitoUser' ||
                        key === 'userProfile' ||
                        key === 'guestId' ||
                        key === 'guestType') {
                        keysToRemove.push(key);
                    }
                    // Remove dynamically created userName_ keys (userName_<email>)
                    if (key.startsWith('userName_')) {
                        keysToRemove.push(key);
                    }
                    // Remove Redux persist data
                    if (key === 'persist:root') {
                        keysToRemove.push(key);
                    }
                }
            }

            // Remove all identified keys
            keysToRemove.forEach(key => {
                try {
                    storage.removeItem(key);
                } catch (error) {
                    console.warn(`Failed to remove key ${key}:`, error);
                }
            });

            // Also clear sessionStorage
            const sessionStorage = this.getStorage('session');
            const sessionKeysToRemove: string[] = [];

            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith('freshtrak_')) {
                    sessionKeysToRemove.push(key);
                }
            }

            sessionKeysToRemove.forEach(key => {
                try {
                    sessionStorage.removeItem(key);
                } catch (error) {
                    console.warn(`Failed to remove session key ${key}:`, error);
                }
            });
        } catch (error) {
            console.error('Error clearing app data:', error);
        }
    }

    /**
     * Get registered event date ID from session storage
     * @returns Event date ID string or null
     */
    static getRegisteredEventDateID(): string | null {
        return this.getItem<string>('freshtrak_session_registered_event_date_id', 'session');
    }

    /**
     * Set registered event date ID in session storage
     * @param eventDateId - Event date ID string
     */
    static setRegisteredEventDateID(eventDateId: string): void {
        this.setItem('freshtrak_session_registered_event_date_id', eventDateId, 'session');
    }
}

// Export default instance for convenience
export default StorageService;

