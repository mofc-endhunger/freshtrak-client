/**
 * Authentication Guard Component for Protected Routes
 * Protects account page and household creation/update routes from unauthorized access
 * Redirects to /login when Cognito access token is invalidated
 */

import React, { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Authentication/AuthContext";

interface AuthGuardProps {
	children: ReactNode;
	fallback?: ReactNode;
	requireAuth?: boolean;
	showLoading?: boolean;
}

/**
 * Authentication Guard Component
 * Wraps protected components to ensure only authenticated users can access them
 * Automatically redirects to /login when access token is invalidated
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
	children,
	fallback,
	requireAuth = true,
	showLoading = true,
}) => {
	const navigate = useNavigate();
	const { user, isAuthenticated, isLoading } = useAuth();

	// Check if Cognito access token is valid
	useEffect(() => {
		if (!isLoading && requireAuth) {
			// If user is not authenticated or doesn't have a valid access token
			if (!isAuthenticated || !user?.accessToken) {
				console.log(
					"AuthGuard: Redirecting to login - no valid access token"
				);
				navigate("/login", { replace: true });
				return;
			}

			// Check if access token is expired (basic JWT expiration check)
			try {
				const token = user.accessToken;
				const tokenParts = token.split(".");
				if (tokenParts.length === 3) {
					const payload = JSON.parse(atob(tokenParts[1]));
					const currentTime = Math.floor(Date.now() / 1000);

					if (payload.exp && payload.exp < currentTime) {
						console.log(
							"AuthGuard: Access token expired, redirecting to login"
						);
						navigate("/login", { replace: true });
						return;
					}
				}
			} catch (error) {
				console.error("AuthGuard: Error validating token:", error);
				navigate("/login", { replace: true });
				return;
			}
		}
	}, [isAuthenticated, user, isLoading, requireAuth, navigate]);

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

	// If user is not authenticated, show fallback or redirect (handled by useEffect)
	if (!isAuthenticated || !user?.accessToken) {
		if (fallback) {
			return <>{fallback}</>;
		}

		// Return null while redirect is happening
		return null;
	}

	// User is authenticated with valid token, render children
	return <>{children}</>;
};

/**
 * Higher-order component for protecting components
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
