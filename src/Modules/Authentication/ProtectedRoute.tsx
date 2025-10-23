/**
 * Protected Route Component
 * Wraps routes that require authentication
 * Automatically redirects to /login when access token is invalidated
 */

import React from "react";
import { AuthGuard } from "../Households/components/AuthGuard";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

/**
 * Protected Route Component
 * Wraps routes that require authentication
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	return <AuthGuard>{children}</AuthGuard>;
};

export default ProtectedRoute;
