/**
 * User Record Helper
 * 
 * Utility functions for creating and managing user records in the backend.
 * Handles retry logic, error handling, and localStorage management.
 */

import { HouseholdsApiService } from "../Services/HouseholdsApiService";

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
		localStorage.setItem("household", JSON.stringify(householdStorage));
	}
};

/**
 * Checks if an error indicates the user already exists
 * @param error - Error object from API call
 */
export const isUserAlreadyExistsError = (error: any): boolean => {
	return (
		error?.type === "CONFLICT" ||
		error?.message?.includes("already exists")
	);
};

/**
 * Checks if an error is an authentication error
 * @param error - Error object from API call
 */
export const isAuthenticationError = (error: any): boolean => {
	return error?.type === "AUTHENTICATION_ERROR";
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

