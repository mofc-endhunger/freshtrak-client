/**
 * Token validation utilities for JWT tokens
 */

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  expiresAt?: number;
  error?: string;
}

/**
 * Validates a JWT token and checks if it's expired
 * @param token - The JWT token to validate
 * @returns TokenValidationResult with validation details
 */
export const validateToken = (token: string): TokenValidationResult => {
  try {
    // Basic JWT structure validation
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return {
        isValid: false,
        isExpired: false,
        error: 'Invalid token format',
      };
    }

    // Decode the payload
    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if token has expiration claim
    if (!payload.exp) {
      return {
        isValid: false,
        isExpired: false,
        error: 'Token missing expiration claim',
      };
    }

    const expiresAt = payload.exp;
    const isExpired = expiresAt < currentTime;

    return {
      isValid: true,
      isExpired,
      expiresAt,
      error: isExpired ? 'Token expired' : undefined,
    };
  } catch (error) {
    return {
      isValid: false,
      isExpired: false,
      error: `Token validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Checks if a token is expired (convenience function)
 * @param token - The JWT token to check
 * @returns true if token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  const result = validateToken(token);
  return result.isExpired;
};

/**
 * Gets token expiration time in milliseconds
 * @param token - The JWT token
 * @returns expiration time in milliseconds, or null if invalid
 */
export const getTokenExpirationTime = (token: string): number | null => {
  const result = validateToken(token);
  return result.expiresAt ? result.expiresAt * 1000 : null;
};
