/**
 * Authentication Guard Component for Households Module
 * Protects household routes and components from unauthorized access
 */

import React, { ReactNode } from "react";
import { useHouseholdAuth } from "../hooks/useHouseholdAuth";

interface AuthGuardProps {
	children: ReactNode;
	fallback?: ReactNode;
	requireAuth?: boolean;
	showLoading?: boolean;
}

/**
 * Authentication Guard Component
 * Wraps household components to ensure only authenticated users can access them
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
	children,
	fallback,
	requireAuth = true,
	showLoading = true,
}) => {
	const { isAuthenticated, isLoading, error } = useHouseholdAuth();

	// Show loading state while checking authentication
	if (isLoading && showLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-highlight"></div>
				<span className="ml-4 text-gray-600">
					Checking authentication...
				</span>
			</div>
		);
	}

	// If authentication is not required, render children
	if (!requireAuth) {
		return <>{children}</>;
	}

	// Check if user is authenticated
	if (!isAuthenticated) {
		if (fallback) {
			return <>{fallback}</>;
		}

		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
				<div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
					<div className="mb-6">
						<div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
							<svg
								className="w-8 h-8 text-red-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Authentication Required
						</h2>
						<p className="text-gray-600 mb-6">
							You need to be logged in to access household
							features. Please sign in to continue.
						</p>
					</div>

					<div className="space-y-3">
						<button
							onClick={() => (window.location.href = "/login")}
							className="w-full bg-highlight text-white px-6 py-3 rounded-lg hover:bg-highlight-dark transition-colors font-medium"
						>
							Sign In
						</button>
						<button
							onClick={() => (window.location.href = "/register")}
							className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
						>
							Create Account
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Show error state if authentication failed
	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
				<div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
					<div className="mb-6">
						<div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
							<svg
								className="w-8 h-8 text-red-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-red-600 mb-2">
							Authentication Error
						</h2>
						<p className="text-gray-600 mb-6">
							There was an issue with your authentication. Please
							try signing in again.
						</p>
					</div>

					<div className="space-y-3">
						<button
							onClick={() => (window.location.href = "/login")}
							className="w-full bg-highlight text-white px-6 py-3 rounded-lg hover:bg-highlight-dark transition-colors font-medium"
						>
							Sign In Again
						</button>
						<button
							onClick={() => window.location.reload()}
							className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
						>
							Refresh Page
						</button>
					</div>
				</div>
			</div>
		);
	}

	// User is authenticated, render children
	return <>{children}</>;
};

/**
 * Higher-order component for protecting household components
 * Provides a cleaner way to wrap components with authentication
 */
export const withAuthGuard = <P extends object>(
	Component: React.ComponentType<P>,
	options?: Omit<AuthGuardProps, "children">
) => {
	const WrappedComponent: React.FC<P> = (props: P) => (
		<AuthGuard {...options}>
			<Component {...props} />
		</AuthGuard>
	);

	WrappedComponent.displayName = `withAuthGuard(${
		Component.displayName || Component.name
	})`;

	return WrappedComponent;
};

/**
 * Hook for conditional rendering based on authentication state
 * Useful for showing different content based on auth status
 */
export const useAuthConditional = () => {
	const { isAuthenticated, isLoading, error } = useHouseholdAuth();

	const renderIfAuthenticated = (component: ReactNode): ReactNode => {
		return isAuthenticated && !error ? component : null;
	};

	const renderIfNotAuthenticated = (component: ReactNode): ReactNode => {
		return !isAuthenticated && !isLoading ? component : null;
	};

	const renderIfLoading = (component: ReactNode): ReactNode => {
		return isLoading ? component : null;
	};

	const renderIfError = (component: ReactNode): ReactNode => {
		return error ? component : null;
	};

	return {
		renderIfAuthenticated,
		renderIfNotAuthenticated,
		renderIfLoading,
		renderIfError,
		isAuthenticated,
		isLoading,
		error,
	};
};
