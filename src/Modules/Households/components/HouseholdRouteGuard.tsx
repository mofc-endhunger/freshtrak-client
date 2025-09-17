/**
 * Household Route Guard Component
 * Protects household routes and provides authentication checks
 */

import React, { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useHouseholdAuth } from "../hooks/useHouseholdAuth";
import { useHouseholdSignUpIntegration } from "../services/HouseholdSignUpIntegration";

interface HouseholdRouteGuardProps {
	children: ReactNode;
	requireAuth?: boolean;
	requireHousehold?: boolean;
	redirectTo?: string;
}

/**
 * Route guard specifically for household routes
 * Provides additional checks beyond basic authentication
 */
export const HouseholdRouteGuard: React.FC<HouseholdRouteGuardProps> = ({
	children,
	requireAuth = true,
	requireHousehold = false,
	redirectTo,
}) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { isAuthenticated, isLoading, token } = useHouseholdAuth();
	const { hasCompletedSetup } = useHouseholdSignUpIntegration();

	// Show loading state while checking authentication
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-highlight"></div>
				<span className="ml-4 text-gray-600">
					Checking authentication...
				</span>
			</div>
		);
	}

	// Check authentication requirement
	if (requireAuth && !isAuthenticated) {
		const redirectPath = redirectTo || "/login";
		navigate(redirectPath, {
			state: { from: location.pathname },
			replace: true,
		});
		return null;
	}

	// Check household requirement
	if (requireHousehold && !hasCompletedSetup()) {
		const redirectPath = redirectTo || "/households/setup";
		navigate(redirectPath, {
			state: { from: location.pathname },
			replace: true,
		});
		return null;
	}

	// Check token requirement
	if (requireAuth && !token) {
		const redirectPath = redirectTo || "/login";
		navigate(redirectPath, {
			state: { from: location.pathname },
			replace: true,
		});
		return null;
	}

	// All checks passed, render children
	return <>{children}</>;
};

/**
 * Higher-order component for protecting household routes
 * Provides a cleaner way to wrap components with route protection
 */
export const withHouseholdRouteGuard = <P extends object>(
	Component: React.ComponentType<P>,
	options?: Omit<HouseholdRouteGuardProps, "children">
) => {
	const WrappedComponent: React.FC<P> = (props: P) => (
		<HouseholdRouteGuard {...options}>
			<Component {...props} />
		</HouseholdRouteGuard>
	);

	WrappedComponent.displayName = `withHouseholdRouteGuard(${
		Component.displayName || Component.name
	})`;

	return WrappedComponent;
};

/**
 * Hook for checking household route permissions
 * Provides utilities for conditional rendering based on route requirements
 */
export const useHouseholdRoutePermissions = () => {
	const { isAuthenticated, isLoading, token } = useHouseholdAuth();
	const { hasCompletedSetup, getHouseholdId } =
		useHouseholdSignUpIntegration();
	const location = useLocation();

	const canAccessHouseholdRoutes = (): boolean => {
		return isAuthenticated && !!token;
	};

	const canAccessHouseholdManagement = (): boolean => {
		return isAuthenticated && !!token && hasCompletedSetup();
	};

	const canCreateHousehold = (): boolean => {
		return isAuthenticated && !!token && !hasCompletedSetup();
	};

	const getRedirectPath = (): string => {
		if (!isAuthenticated) {
			return "/login";
		}
		if (!hasCompletedSetup()) {
			return "/households/setup";
		}
		return "/households";
	};

	const shouldRedirectToSetup = (): boolean => {
		return (
			isAuthenticated &&
			!hasCompletedSetup() &&
			location.pathname !== "/households/setup"
		);
	};

	return {
		// State
		isAuthenticated,
		isLoading,
		token,
		hasCompletedSetup: hasCompletedSetup(),
		householdId: getHouseholdId(),

		// Permissions
		canAccessHouseholdRoutes: canAccessHouseholdRoutes(),
		canAccessHouseholdManagement: canAccessHouseholdManagement(),
		canCreateHousehold: canCreateHousehold(),

		// Utilities
		getRedirectPath,
		shouldRedirectToSetup: shouldRedirectToSetup(),
	};
};

/**
 * Component for handling household route redirects
 * Automatically redirects users to appropriate pages based on their state
 */
export const HouseholdRouteRedirect: React.FC<{
	children: ReactNode;
	fallback?: ReactNode;
}> = ({ children, fallback }) => {
	const { shouldRedirectToSetup, getRedirectPath, isLoading } =
		useHouseholdRoutePermissions();
	const navigate = useNavigate();

	// Show loading state
	if (isLoading) {
		return (fallback || (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-highlight"></div>
			</div>
		)) as React.ReactElement;
	}

	// Redirect if needed
	if (shouldRedirectToSetup) {
		const redirectPath = getRedirectPath();
		navigate(redirectPath, { replace: true });
		return null;
	}

	// Render children if no redirect needed
	return <>{children}</>;
};

/**
 * Hook for managing household route state
 * Provides utilities for handling route-specific state and navigation
 */
export const useHouseholdRouteState = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { getSignUpState, hasCompletedSetup } =
		useHouseholdSignUpIntegration();

	const isHouseholdRoute = (): boolean => {
		return location.pathname.startsWith("/households");
	};

	const isSetupRoute = (): boolean => {
		return location.pathname === "/households/setup";
	};

	const isManagementRoute = (): boolean => {
		return (
			location.pathname === "/households" ||
			location.pathname === "/households/"
		);
	};

	const navigateToHouseholdSetup = (): void => {
		navigate("/households/setup");
	};

	const navigateToHouseholdManagement = (): void => {
		navigate("/households");
	};

	const navigateToDashboard = (): void => {
		navigate("/dashboard");
	};

	const getRouteTitle = (): string => {
		if (isSetupRoute()) {
			return "Set Up Household";
		}
		if (isManagementRoute()) {
			return "Manage Household";
		}
		return "Households";
	};

	return {
		// Route info
		currentPath: location.pathname,
		isHouseholdRoute: isHouseholdRoute(),
		isSetupRoute: isSetupRoute(),
		isManagementRoute: isManagementRoute(),

		// Navigation
		navigateToHouseholdSetup,
		navigateToHouseholdManagement,
		navigateToDashboard,

		// Utilities
		getRouteTitle,
		getSignUpState,
		hasCompletedSetup: hasCompletedSetup(),
	};
};
