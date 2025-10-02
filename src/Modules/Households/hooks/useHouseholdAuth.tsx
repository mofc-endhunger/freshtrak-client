/**
 * Simple Household Authentication Hook
 * Provides basic authentication state for household components
 */

import { useState, useEffect } from "react";

interface UseHouseholdAuthReturn {
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

/**
 * Hook for household authentication state
 * Returns authentication status and loading state
 */
export const useHouseholdAuth = (): UseHouseholdAuthReturn => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Simple authentication check
		// In a real app, this would check against your auth service
		const checkAuth = async () => {
			try {
				setIsLoading(true);
				setError(null);

				// For now, assume user is authenticated if they have a token
				const token =
					localStorage.getItem("authToken") ||
					sessionStorage.getItem("authToken");
				setIsAuthenticated(!!token);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Authentication check failed"
				);
				setIsAuthenticated(false);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, []);

	return {
		isAuthenticated,
		isLoading,
		error,
	};
};
