/**
 * Error Handling Utilities for Households Module
 * Comprehensive error handling, retry mechanisms, and user-friendly messages
 */

import { HouseholdApiError } from '../types/api.types';

// Error types for different scenarios
export interface ErrorContext {
  operation: string;
  component?: string;
  userId?: string;
  householdId?: number;
  memberId?: number;
  timestamp: string;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface ErrorMessage {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action?: string;
  retryable: boolean;
}

// Default retry configuration
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

/**
 * Error message mappings for user-friendly display
 */
export const ERROR_MESSAGES: Record<HouseholdApiError, ErrorMessage> = {
  NETWORK_ERROR: {
    title: 'Connection Problem',
    message: 'Unable to connect to the server. Please check your internet connection.',
    severity: 'medium',
    action: 'Check your internet connection and try again.',
    retryable: true,
  },
  AUTHENTICATION_ERROR: {
    title: 'Authentication Required',
    message: 'Your session has expired. Please sign in again.',
    severity: 'high',
    action: 'Sign in to continue.',
    retryable: false,
  },
  AUTHORIZATION_ERROR: {
    title: 'Access Denied',
    message: "You don't have permission to perform this action.",
    severity: 'high',
    action: 'Contact support if you believe this is an error.',
    retryable: false,
  },
  VALIDATION_ERROR: {
    title: 'Invalid Information',
    message: 'Please check your input and try again.',
    severity: 'medium',
    action: 'Review the highlighted fields and correct any errors.',
    retryable: false,
  },
  NOT_FOUND: {
    title: 'Not Found',
    message: 'The requested information could not be found.',
    severity: 'medium',
    action: 'The item may have been deleted or moved.',
    retryable: false,
  },
  CONFLICT: {
    title: 'Conflict',
    message: 'This action conflicts with existing data.',
    severity: 'medium',
    action: 'Please review the information and try again.',
    retryable: false,
  },
  SERVER_ERROR: {
    title: 'Server Error',
    message: "Something went wrong on our end. We're working to fix it.",
    severity: 'high',
    action: 'Please try again in a few minutes.',
    retryable: true,
  },
  TIMEOUT: {
    title: 'Request Timeout',
    message: 'The request took too long to complete.',
    severity: 'medium',
    action: 'Please try again.',
    retryable: true,
  },
  API_RATE_LIMIT: {
    title: 'Rate Limited',
    message: 'Too many requests. Please wait a moment before trying again.',
    severity: 'medium',
    action: 'Wait a few seconds and try again.',
    retryable: true,
  },
  UNKNOWN_ERROR: {
    title: 'Unexpected Error',
    message: 'Something unexpected happened. Please try again.',
    severity: 'medium',
    action: 'If the problem persists, contact support.',
    retryable: true,
  },
};

/**
 * Create error context for logging and debugging
 */
export const createErrorContext = (
  operation: string,
  additionalData?: Partial<ErrorContext>,
): ErrorContext => ({
  operation,
  timestamp: new Date().toISOString(),
  ...additionalData,
});

/**
 * Get user-friendly error message
 */
export const getUserFriendlyErrorMessage = (
  error: HouseholdApiError,
  context?: ErrorContext,
): ErrorMessage => {
  const baseMessage = ERROR_MESSAGES[error];

  // Add context-specific information if available
  if (context) {
    return {
      ...baseMessage,
      message: `${baseMessage.message} (Operation: ${context.operation})`,
    };
  }

  return baseMessage;
};

/**
 * Calculate retry delay with exponential backoff
 */
export const calculateRetryDelay = (
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
): number => {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  context?: ErrorContext,
): Promise<T> => {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on the last attempt
      if (attempt === config.maxRetries) {
        break;
      }

      // Check if error is retryable based on status code
      const axiosError = error as any;
      const status = axiosError?.response?.status;

      // Don't retry on 4xx errors (except 429 rate limit)
      // Only retry on 5xx errors or network errors
      const isRetryable = !status || status >= 500 || status === 429;

      if (!isRetryable) {
        throw error;
      }

      // Wait before retrying
      const delay = calculateRetryDelay(attempt, config);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Operation failed after all retry attempts');
};

/**
 * Check if the application is offline
 */
export const isOffline = (): boolean => {
  return !navigator.onLine;
};

/**
 * Handle offline scenarios
 */
export const handleOfflineError = (): ErrorMessage => ({
  title: 'Offline',
  message: 'You appear to be offline. Please check your internet connection.',
  severity: 'medium',
  action: 'Check your internet connection and try again.',
  retryable: true,
});

/**
 * Log error for debugging and monitoring
 */
export const logError = (
  error: Error,
  context: ErrorContext,
  additionalData?: Record<string, any>,
): void => {
  const errorLog = {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
    additionalData,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Household Error:', errorLog);
  }

  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
};

/**
 * Format error for display in UI
 */
export const formatErrorForDisplay = (
  error: Error | HouseholdApiError,
  context?: ErrorContext,
): ErrorMessage => {
  let errorType: HouseholdApiError;

  if (typeof error === 'string') {
    errorType = error as HouseholdApiError;
  } else {
    // Try to determine error type from error message or name
    const errorMessage = error.message.toLowerCase();
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      errorType = 'NETWORK_ERROR';
    } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      errorType = 'AUTHENTICATION_ERROR';
    } else if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
      errorType = 'AUTHORIZATION_ERROR';
    } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      errorType = 'NOT_FOUND';
    } else if (errorMessage.includes('409') || errorMessage.includes('conflict')) {
      errorType = 'CONFLICT';
    } else if (errorMessage.includes('500') || errorMessage.includes('server')) {
      errorType = 'SERVER_ERROR';
    } else if (errorMessage.includes('timeout')) {
      errorType = 'TIMEOUT';
    } else {
      errorType = 'UNKNOWN_ERROR';
    }
  }

  return getUserFriendlyErrorMessage(errorType, context);
};

/**
 * Create error boundary props for React error boundaries
 */
export const createErrorBoundaryProps = (context: ErrorContext) => ({
  fallback: (error: Error) => {
    const errorMessage = formatErrorForDisplay(error, context);
    logError(error, context);

    return {
      title: errorMessage.title,
      message: errorMessage.message,
      severity: errorMessage.severity,
      action: errorMessage.action,
    };
  },
});
