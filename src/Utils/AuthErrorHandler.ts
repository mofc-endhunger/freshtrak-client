/**
 * Authentication Error Handler Utility
 * Handles 401 errors consistently across the application
 * Provides clean redirects and localStorage cleanup for both Cognito and guest users
 */

export interface AuthErrorHandlerOptions {
  userType: "cognito" | "guest";
  redirectPath?: string;
  showToast?: (message: string, type: "error" | "success") => void;
}

/**
 * Handles authentication errors (401) with appropriate cleanup and redirection
 * @param error - The error object from API call
 * @param options - Configuration options for error handling
 * @returns true if error was handled as auth error, false otherwise
 */
export const handleAuthError = (
  error: any,
  options: AuthErrorHandlerOptions
): boolean => {
  // Check if this is a 401 authentication error
  if (error?.response?.status === 401 || error?.type === 'AUTHENTICATION_ERROR') {
    // Clean up localStorage based on user type
    if (options.userType === "cognito") {
      // Clear all Cognito-related data
      localStorage.removeItem("cognitoUser");
      localStorage.removeItem("userToken");
    } else {
      // Clear guest-related data
      localStorage.removeItem("userProfile");
      localStorage.removeItem("userToken");
    }

    // Clear any other authentication-related data
    localStorage.removeItem("currentUser");

    // Show appropriate error message
    const errorMessage = options.userType === "cognito"
      ? "Your session has expired. Please sign in again."
      : "Guest session expired. Please start over.";

    if (options.showToast) {
      options.showToast(errorMessage, "error");
    }

    // Determine redirect path
    const redirectPath = options.redirectPath ||
      (options.userType === "cognito" ? "/login" : "/");

    // Redirect after a short delay to show the error message
    setTimeout(() => {
      window.location.href = redirectPath;
    }, 2000);

    return true;
  }

  return false;
};

/**
 * Hook for handling authentication errors in React components
 * @param userType - Type of user (cognito or guest)
 * @param redirectPath - Optional custom redirect path
 * @param showToast - Optional toast function for showing messages
 * @returns Function to handle authentication errors
 */
export const useAuthErrorHandler = (
  userType: "cognito" | "guest",
  redirectPath?: string,
  showToast?: (message: string, type: "error" | "success") => void
) => {
  return (error: any): boolean => {
    return handleAuthError(error, {
      userType,
      redirectPath,
      showToast,
    });
  };
};

/**
 * Utility function to check if a guest token is expired
 * @param userProfile - The user profile object from localStorage
 * @returns true if token is expired, false otherwise
 */
export const isGuestTokenExpired = (userProfile: string | null): boolean => {
  if (!userProfile) return true;

  try {
    const userProfileData = JSON.parse(userProfile);
    const expiresAt = new Date(userProfileData.expires_at);
    const now = new Date();
    return expiresAt <= now;
  } catch (error) {
    console.warn("Could not parse userProfile:", error);
    return true;
  }
};

/**
 * Utility function to check if a Cognito token is expired
 * @param cognitoUser - The cognito user object from localStorage
 * @returns true if token is expired, false otherwise
 */
export const isCognitoTokenExpired = (cognitoUser: string | null): boolean => {
  if (!cognitoUser) return true;

  try {
    const cognitoUserData = JSON.parse(cognitoUser);
    if (!cognitoUserData.accessToken) return true;

    // Use existing token validation utility
    const { validateToken } = require('./TokenUtils');
    const validation = validateToken(cognitoUserData.accessToken);
    return validation.isExpired;
  } catch (error) {
    console.warn("Could not parse cognitoUser:", error);
    return true;
  }
};

/**
 * Clean up all authentication data from localStorage
 * Used when user needs to be completely logged out
 */
export const clearAllAuthData = (): void => {
  localStorage.removeItem("cognitoUser");
  localStorage.removeItem("userProfile");
  localStorage.removeItem("userToken");
  localStorage.removeItem("currentUser");
};
