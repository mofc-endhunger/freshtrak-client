/**
 * Authentication Guard Component for Protected Routes
 * Protects account page and household creation/update routes from unauthorized access
 * Automatically logs out users with expired tokens and redirects to /login
 * Ensures complete cleanup of authentication state for security
 */

import React, { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Authentication/AuthContext";
import { validateToken } from "../../../Utils/TokenUtils";

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
	const { user, isAuthenticated, isLoading, signOut } = useAuth();

	// Check if Cognito access token is valid and handle expired tokens
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

			// Validate token and check expiration
			const tokenValidation = validateToken(user.accessToken);

			if (!tokenValidation.isValid) {
				console.log("AuthGuard: Invalid token format, logging out");
				signOut();
				navigate("/login", { replace: true });
				return;
			}

			if (tokenValidation.isExpired) {
				console.log(
					"AuthGuard: Token expired, automatically logging out"
				);
				signOut();
				navigate("/login", { replace: true });
				return;
			}

			// Token is valid and not expired
			console.log("AuthGuard: Token is valid");
		}
	}, [isAuthenticated, user, isLoading, requireAuth, navigate, signOut]);

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
