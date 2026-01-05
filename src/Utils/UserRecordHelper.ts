/**
 * User Record Helper
 * 
 * Utility functions for creating and managing user records in the backend.
 * Handles retry logic, error handling, and localStorage management.
 */

import { fetchUserAttributes } from "aws-amplify/auth";
import { HouseholdsApiService } from "../Services/HouseholdsApiService";
import { StorageService } from "./StorageService";

export interface CreateUserRecordOptions {
	name?: string;
	maxRetries?: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

export interface CreateUserRecordResult {
	success: boolean;
	alreadyExists?: boolean;
	error?: any;
}

/**
 * Builds minimal user data object for creating a new user record
 * @param name - User's full name (will be split into first/last)
 */
export const buildMinimalUserData = (name?: string) => {
	const firstName = name?.split(" ")[0] || "User";
	const lastName = name?.split(" ").slice(1).join(" ") || "";

	return {
		// Required fields for CreateHouseholdRequest
		primary_first_name: firstName,
		primary_last_name: lastName,
		primary_date_of_birth: "",
		preferred_language: "en",
		address_line_1: "",
		city: "",
		state: "",
		zip_code: "",
		// Additional fields for new API
		first_name: firstName,
		last_name: lastName,
		phone: undefined,
		date_of_birth: undefined,
		permission_to_email: undefined,
		children_in_household: undefined,
	};
};

/**
 * Stores household data to localStorage after successful creation
 * @param response - API response containing user and household IDs
 */
export const storeHouseholdToLocalStorage = (response: any): void => {
	if (response?.data) {
		const householdStorage = {
			userId: response.data.primary_user_id,
			household_id: response.data.id,
		};
		StorageService.setItem("household", householdStorage);
	}
};

// ============================================================================
// API Error Type Helpers
// ============================================================================

/**
 * Checks if an error indicates the user already exists (409 Conflict)
 * @param error - Error object from API call
 */
export const isUserAlreadyExistsError = (error: any): boolean => {
	return (
		error?.type === "CONFLICT" ||
		error?.message?.includes("already exists")
	);
};

/**
 * Checks if an error is an authentication error (401)
 * @param error - Error object from API call
 */
export const isAuthenticationError = (error: any): boolean => {
	return (
		error?.response?.status === 401 ||
		error?.type === "AUTHENTICATION_ERROR"
	);
};

/**
 * Checks if an error is a not found error (404)
 * Commonly occurs when user exists in Cognito but not in backend
 * @param error - Error object from API call
 */
export const isNotFoundError = (error: any): boolean => {
	return (
		error?.response?.status === 404 ||
		error?.type === "NOT_FOUND" ||
		error?.message?.toLowerCase().includes("not found") ||
		error?.message?.toLowerCase().includes("user not found")
	);
};

/**
 * Creates a user record in the backend with retry logic
 * 
 * @param apiService - HouseholdsApiService instance
 * @param options - Configuration options including name, retry count, callbacks
 * @returns Promise resolving to CreateUserRecordResult
 * 
 * @example
 * ```ts
 * const result = await createUserRecordWithRetry(householdsApiService, {
 *   name: "John Doe",
 *   maxRetries: 3,
 * });
 * if (result.success) {
 *   console.log("User created or already exists");
 * }
 * ```
 */
export const createUserRecordWithRetry = async (
	apiService: HouseholdsApiService,
	options: CreateUserRecordOptions = {}
): Promise<CreateUserRecordResult> => {
	const { name, maxRetries = 3, onSuccess, onError } = options;
	const minimalUserData = buildMinimalUserData(name);

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const response = await apiService.createHousehold(minimalUserData);

			// Store user ID and household ID in localStorage
			storeHouseholdToLocalStorage(response);

			console.log("User record created successfully on attempt", attempt);
			onSuccess?.();

			return { success: true };
		} catch (error: any) {
			console.warn(`User creation attempt ${attempt} failed:`, error);

			// If it's a conflict (user already exists), that's fine
			if (isUserAlreadyExistsError(error)) {
				console.log("User record already exists, continuing...");
				return { success: true, alreadyExists: true };
			}

			// If it's an auth error, don't retry - token might not be ready yet
			if (isAuthenticationError(error)) {
				console.warn(
					"Auth error during user creation, will retry on next page load"
				);
				onError?.(error);
				return { success: false, error };
			}

			// Wait before retrying (exponential backoff)
			if (attempt < maxRetries) {
				await new Promise((resolve) =>
					setTimeout(resolve, 1000 * attempt)
				);
			}
		}
	}

	console.error("Failed to create user record after", maxRetries, "attempts");
	return { success: false, error: new Error("Max retries exceeded") };
};

/**
 * Creates a user record without retry logic (single attempt)
 * Used for fallback recovery scenarios
 * 
 * @param apiService - HouseholdsApiService instance
 * @param name - User's full name
 * @returns Promise resolving to CreateUserRecordResult
 */
export const createUserRecordSingleAttempt = async (
	apiService: HouseholdsApiService,
	name?: string
): Promise<CreateUserRecordResult> => {
	const minimalUserData = buildMinimalUserData(name);

	try {
		const response = await apiService.createHousehold(minimalUserData);
		storeHouseholdToLocalStorage(response);
		console.log("User record created via single attempt");
		return { success: true };
	} catch (error: any) {
		// If it's a conflict (user already exists), that's fine
		if (isUserAlreadyExistsError(error)) {
			console.log("User record already exists");
			return { success: true, alreadyExists: true };
		}
		console.error("User creation failed:", error);
		return { success: false, error };
	}
};

// ============================================================================
// Post-Confirmation User Record Creation
// ============================================================================

/**
 * Options for creating user record after email confirmation
 */
export interface PostConfirmationOptions {
	pendingEmail?: string;
	authUser?: { name?: string; email?: string } | null;
	apiService: HouseholdsApiService;
	maxRetries?: number;
}

/**
 * Result of post-confirmation user record creation
 */
export interface PostConfirmationResult {
	success: boolean;
	userName?: string;
	userEmail?: string;
	alreadyExists?: boolean;
	error?: any;
}

/**
 * Resolves user name using multiple fallback sources
 * 
 * Resolution order:
 * 1. pendingUser.name from localStorage (stored during signup)
 * 2. Auth context user name
 * 3. Cognito user attributes (fetched from AWS)
 * 4. Email prefix (last resort)
 * 
 * @param pendingEmail - Email from pending confirmation state
 * @param authUser - User object from auth context
 * @returns Object containing resolved userName and userEmail
 */
export const resolveUserNameWithFallback = async (
	pendingEmail?: string,
	authUser?: { name?: string; email?: string } | null
): Promise<{ userName: string; userEmail: string | undefined }> => {
	// Get pending user data from localStorage (stored during signup)
	const pendingUser = StorageService.getItem<{
		name?: string;
		email?: string;
	}>("pendingUser");

	let userName = pendingUser?.name || authUser?.name;
	let userEmail = pendingEmail || pendingUser?.email || authUser?.email;

	// If name not found in localStorage or context, try fetching from Cognito attributes
	// This handles the case where user cleared localStorage after signup but before confirmation
	if (!userName || userName === userEmail?.split("@")[0]) {
		try {
			const cognitoAttributes = await fetchUserAttributes();
			if (cognitoAttributes?.name) {
				userName = cognitoAttributes.name;
			}
			if (!userEmail && cognitoAttributes?.email) {
				userEmail = cognitoAttributes.email;
			}
		} catch (error) {
			console.warn("Could not fetch Cognito user attributes:", error);
		}
	}

	// Final fallback to email prefix if still no name
	if (!userName) {
		userName = userEmail?.split("@")[0] || "User";
	}

	return { userName, userEmail };
};

/**
 * Creates user record after email confirmation with proper name resolution
 * 
 * This function handles the complete post-confirmation flow:
 * 1. Resolves user name from multiple sources (localStorage, Cognito, etc.)
 * 2. Sets the new user signup flag
 * 3. Creates the user record in the backend
 * 4. Updates the signup flag on success
 * 
 * @param options - Configuration options
 * @returns Promise resolving to PostConfirmationResult
 */
export const createUserRecordAfterConfirmation = async (
	options: PostConfirmationOptions
): Promise<PostConfirmationResult> => {
	const { pendingEmail, authUser, apiService, maxRetries = 3 } = options;

	// Resolve user name with fallbacks
	const { userName, userEmail } = await resolveUserNameWithFallback(
		pendingEmail,
		authUser
	);

	// Mark this user as a new user who just completed email confirmation
	if (userEmail) {
		setNewUserSignupFlag(userEmail, false);
	}

	// Attempt to create user record
	try {
		const result = await createUserRecordWithRetry(apiService, {
			name: userName,
			maxRetries,
		});

		// Update flag to indicate user record was created
		if (result.success && userEmail) {
			setNewUserSignupFlag(userEmail, true);
		}

		return {
			success: result.success,
			userName,
			userEmail,
			alreadyExists: result.alreadyExists,
		};
	} catch (error) {
		console.error("Error creating user record on confirmation:", error);
		return {
			success: false,
			userName,
			userEmail,
			error,
		};
	}
};

// ============================================================================
// New User Signup Flag Management
// ============================================================================

/**
 * Interface for the new_user_signup flag stored in localStorage
 * This flag tracks new users who have completed email confirmation
 */
export interface NewUserSignupFlag {
	email: string;
	timestamp: number;
	completed: boolean;
	userRecordCreated: boolean;
}

const NEW_USER_SIGNUP_KEY = "new_user_signup";

/**
 * Sets the new user signup flag after email confirmation
 * 
 * @param email - User's email address
 * @param userRecordCreated - Whether the backend user record was created
 * 
 * @example
 * ```ts
 * // After email confirmation, before user record creation
 * setNewUserSignupFlag("user@example.com", false);
 * 
 * // After successful user record creation
 * setNewUserSignupFlag("user@example.com", true);
 * ```
 */
export const setNewUserSignupFlag = (
	email: string,
	userRecordCreated: boolean = false
): void => {
	const flagData: NewUserSignupFlag = {
		email,
		timestamp: Date.now(),
		completed: true,
		userRecordCreated,
	};
	StorageService.setItem(NEW_USER_SIGNUP_KEY, flagData);
};

/**
 * Updates the userRecordCreated status of an existing flag
 * Only updates if the flag exists and email matches
 * 
 * @param email - User's email to verify match
 * @param userRecordCreated - New value for userRecordCreated
 * @returns true if flag was updated, false if not found or email mismatch
 */
export const updateNewUserSignupFlag = (
	email: string,
	userRecordCreated: boolean
): boolean => {
	const existingFlag = getNewUserSignupFlag();

	if (!existingFlag || existingFlag.email !== email) {
		return false;
	}

	setNewUserSignupFlag(email, userRecordCreated);
	return true;
};

/**
 * Gets the current new user signup flag
 * 
 * @returns The flag data or null if not set
 */
export const getNewUserSignupFlag = (): NewUserSignupFlag | null => {
	return StorageService.getItem<NewUserSignupFlag>(NEW_USER_SIGNUP_KEY);
};

/**
 * Clears the new user signup flag
 * Should be called after the flag has been processed
 */
export const clearNewUserSignupFlag = (): void => {
	StorageService.removeItem(NEW_USER_SIGNUP_KEY);
};

/**
 * Checks if a valid new user signup flag exists for the given email
 * Validates email match and age (must be less than 24 hours old)
 * 
 * @param userEmail - Email to validate against (optional)
 * @returns true if valid flag exists, false otherwise
 */
export const hasValidNewUserSignupFlag = (userEmail?: string): boolean => {
	const flag = getNewUserSignupFlag();

	if (!flag || !flag.completed) {
		return false;
	}

	// Verify email matches if provided
	if (userEmail && flag.email && flag.email !== userEmail) {
		// Different user - clear the stale flag
		clearNewUserSignupFlag();
		return false;
	}

	// Check if flag is extremely old (more than 24 hours) - safety cleanup
	const isVeryOld = (Date.now() - flag.timestamp) > (24 * 60 * 60 * 1000);
	if (isVeryOld) {
		clearNewUserSignupFlag();
		return false;
	}

	return true;
};

