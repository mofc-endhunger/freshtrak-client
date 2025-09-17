/**
 * Custom hook for household authentication integration
 * Provides authentication checks and token management for household operations
 */

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../Authentication/AuthContext";
import { HouseholdApiError } from "../types/api.types";

export interface HouseholdAuthState {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: any | null;
	token: string | null;
	error: HouseholdApiError | null;
}

export interface HouseholdAuthActions {
	refreshToken: () => Promise<void>;
	clearError: () => void;
	requireAuth: () => boolean;
}

/**
 * Custom hook for household authentication
 * Integrates with existing AuthContext and provides household-specific auth functionality
 */
export const useHouseholdAuth = (): HouseholdAuthState &
	HouseholdAuthActions => {
	const authContext = useAuth();
	const [token, setToken] = useState<string | null>(null);
	const [error, setError] = useState<HouseholdApiError | null>(null);

	// Get authentication token from localStorage or Cognito
	const getAuthToken = (): string | null => {
		try {
			// First try to get from localStorage (existing pattern)
			const storedUser = localStorage.getItem("cognitoUser");
			if (storedUser) {
				const userData = JSON.parse(storedUser);
				return userData.accessToken || userData.token || null;
			}

			// If no stored user, return null (user not authenticated)
			return null;
		} catch (err) {
			console.error("Error getting auth token:", err);
			setError("AUTHENTICATION_ERROR");
			return null;
		}
	};

	// Refresh authentication token
	const refreshToken = useCallback(async (): Promise<void> => {
		try {
			setError(null);
			const newToken = getAuthToken();
			setToken(newToken);
		} catch (err) {
			console.error("Error refreshing token:", err);
			setError("AUTHENTICATION_ERROR");
		}
	}, []);

	// Clear authentication error
	const clearError = (): void => {
		setError(null);
	};

	// Require authentication - returns true if user is authenticated
	const requireAuth = (): boolean => {
		if (!authContext.isAuthenticated) {
			setError("AUTHENTICATION_ERROR");
			return false;
		}
		return true;
	};

	// Update token when authentication state changes
	useEffect(() => {
		if (authContext.isAuthenticated && authContext.user) {
			refreshToken();
		} else {
			setToken(null);
			setError(null);
		}
	}, [authContext.isAuthenticated, authContext.user, refreshToken]);

	return {
		// State
		isAuthenticated: authContext.isAuthenticated,
		isLoading: authContext.isLoading,
		user: authContext.user,
		token,
		error,

		// Actions
		refreshToken,
		clearError,
		requireAuth,
	};
};

/**
 * Higher-order component for protecting household routes
 * Redirects unauthenticated users and shows loading states
 */
export const withHouseholdAuth = <P extends object>(
	Component: React.ComponentType<P>
): React.FC<P> => {
	return (props: P) => {
		const { isAuthenticated, isLoading, error } = useHouseholdAuth();

		// Show loading state while checking authentication
		if (isLoading) {
			return (
				<div className="flex items-center justify-center min-h-screen">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-highlight"></div>
				</div>
			);
		}

		// Redirect if not authenticated
		if (!isAuthenticated) {
			return (
				<div className="flex flex-col items-center justify-center min-h-screen p-8">
					<div className="text-center">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							Authentication Required
						</h2>
						<p className="text-gray-600 mb-6">
							You need to be logged in to access household
							features.
						</p>
						<button
							onClick={() => (window.location.href = "/login")}
							className="bg-highlight text-white px-6 py-3 rounded-lg hover:bg-highlight-dark transition-colors"
						>
							Sign In
						</button>
					</div>
				</div>
			);
		}

		// Show error state if authentication failed
		if (error) {
			return (
				<div className="flex flex-col items-center justify-center min-h-screen p-8">
					<div className="text-center">
						<h2 className="text-2xl font-bold text-red-600 mb-4">
							Authentication Error
						</h2>
						<p className="text-gray-600 mb-6">
							There was an issue with your authentication. Please
							try signing in again.
						</p>
						<button
							onClick={() => (window.location.href = "/login")}
							className="bg-highlight text-white px-6 py-3 rounded-lg hover:bg-highlight-dark transition-colors"
						>
							Sign In Again
						</button>
					</div>
				</div>
			);
		}

		// Render the protected component
		return <Component {...props} />;
	};
};

/**
 * Hook for checking if user can perform household operations
 * Provides granular permission checks
 */
export const useHouseholdPermissions = () => {
	const { isAuthenticated, user, token } = useHouseholdAuth();

	const canCreateHousehold = (): boolean => {
		return isAuthenticated && !!token && !!user;
	};

	const canManageHousehold = (householdId?: number): boolean => {
		return isAuthenticated && !!token && !!user;
	};

	const canAddMembers = (householdId?: number): boolean => {
		return isAuthenticated && !!token && !!user;
	};

	const canEditMembers = (
		householdId?: number,
		memberId?: number
	): boolean => {
		return isAuthenticated && !!token && !!user;
	};

	const canDeleteMembers = (
		householdId?: number,
		memberId?: number
	): boolean => {
		return isAuthenticated && !!token && !!user;
	};

	return {
		canCreateHousehold,
		canManageHousehold,
		canAddMembers,
		canEditMembers,
		canDeleteMembers,
	};
};
