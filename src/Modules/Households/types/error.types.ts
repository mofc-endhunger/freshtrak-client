// Households Error TypeScript Interfaces

// Base error interface
export interface BaseError {
  message: string;
  code?: string;
  timestamp: Date;
  stack?: string;
}

// Household-specific errors
export interface HouseholdError extends BaseError {
  type: 'HOUSEHOLD_ERROR';
  householdId?: number;
  operation?: 'create' | 'read' | 'update' | 'delete';
}

// Member-specific errors
export interface MemberError extends BaseError {
  type: 'MEMBER_ERROR';
  memberId?: number;
  householdId?: number;
  operation?: 'create' | 'read' | 'update' | 'delete' | 'deactivate';
}

// Validation errors
export interface ValidationError extends BaseError {
  type: 'VALIDATION_ERROR';
  field?: string;
  value?: any;
  constraint?: string;
}

// API errors
export interface ApiError extends BaseError {
  type: 'API_ERROR';
  statusCode?: number;
  endpoint?: string;
  method?: string;
  retryable?: boolean;
}

// Authentication errors
export interface AuthenticationError extends BaseError {
  type: 'AUTHENTICATION_ERROR';
  reason?: 'token_expired' | 'token_invalid' | 'user_not_found' | 'permission_denied';
}

// Network errors
export interface NetworkError extends BaseError {
  type: 'NETWORK_ERROR';
  url?: string;
  timeout?: boolean;
  retryable?: boolean;
}

// Form errors
export interface FormError extends BaseError {
  type: 'FORM_ERROR';
  field?: string;
  formData?: any;
  validationErrors?: ValidationError[];
}

// Setup wizard errors
export interface SetupWizardError extends BaseError {
  type: 'SETUP_WIZARD_ERROR';
  step?: string;
  stepData?: any;
}

// Union type for all household errors
export type HouseholdErrorType =
  | HouseholdError
  | MemberError
  | ValidationError
  | ApiError
  | AuthenticationError
  | NetworkError
  | FormError
  | SetupWizardError;

// Error context for better debugging
export interface ErrorContext {
  userId?: number;
  householdId?: number;
  memberId?: number;
  operation?: string;
  component?: string;
  userAgent?: string;
  timestamp: Date;
  sessionId?: string;
}

// Error handler interface
export interface ErrorHandler {
  handle(error: HouseholdErrorType, context?: ErrorContext): void;
  log(error: HouseholdErrorType, context?: ErrorContext): void;
  report(error: HouseholdErrorType, context?: ErrorContext): Promise<void>;
}

// Error boundary props
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: HouseholdErrorType; reset: () => void }>;
  onError?: (error: HouseholdErrorType, context: ErrorContext) => void;
}

// Error state for components
export interface ErrorState {
  hasError: boolean;
  error?: HouseholdErrorType;
  context?: ErrorContext;
}

// Error recovery actions
export interface ErrorRecoveryAction {
  type: 'retry' | 'fallback' | 'redirect' | 'show_message';
  payload?: any;
  label: string;
  action: () => void;
}

// Error message configuration
export interface ErrorMessageConfig {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actions?: ErrorRecoveryAction[];
  dismissible?: boolean;
  autoDismiss?: boolean;
  dismissTimeout?: number;
}

// Error logging configuration
export interface ErrorLoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  includeStack: boolean;
  includeContext: boolean;
  maxRetries: number;
  retryDelay: number;
}

// Error reporting service interface
export interface ErrorReportingService {
  report(error: HouseholdErrorType, context?: ErrorContext): Promise<void>;
  setUserContext(userId: number, userInfo?: any): void;
  clearUserContext(): void;
  setCustomContext(key: string, value: any): void;
}

// Error codes enumeration
export enum HouseholdErrorCodes {
  // Household errors
  HOUSEHOLD_NOT_FOUND = 'HOUSEHOLD_NOT_FOUND',
  HOUSEHOLD_CREATION_FAILED = 'HOUSEHOLD_CREATION_FAILED',
  HOUSEHOLD_UPDATE_FAILED = 'HOUSEHOLD_UPDATE_FAILED',
  HOUSEHOLD_DELETE_FAILED = 'HOUSEHOLD_DELETE_FAILED',

  // Member errors
  MEMBER_NOT_FOUND = 'MEMBER_NOT_FOUND',
  MEMBER_CREATION_FAILED = 'MEMBER_CREATION_FAILED',
  MEMBER_UPDATE_FAILED = 'MEMBER_UPDATE_FAILED',
  MEMBER_DEACTIVATION_FAILED = 'MEMBER_DEACTIVATION_FAILED',
  MEMBER_REACTIVATION_FAILED = 'MEMBER_REACTIVATION_FAILED',

  // Validation errors
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_DATE_OF_BIRTH = 'INVALID_DATE_OF_BIRTH',
  INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',
  INVALID_EMAIL = 'INVALID_EMAIL',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',

  // Authentication errors
  USER_NOT_AUTHENTICATED = 'USER_NOT_AUTHENTICATED',
  USER_NOT_AUTHORIZED = 'USER_NOT_AUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',

  // API errors
  API_NETWORK_ERROR = 'API_NETWORK_ERROR',
  API_TIMEOUT = 'API_TIMEOUT',
  API_SERVER_ERROR = 'API_SERVER_ERROR',
  API_RATE_LIMIT = 'API_RATE_LIMIT',

  // Setup wizard errors
  SETUP_WIZARD_INVALID_STEP = 'SETUP_WIZARD_INVALID_STEP',
  SETUP_WIZARD_MISSING_DATA = 'SETUP_WIZARD_MISSING_DATA',
  SETUP_WIZARD_COMPLETION_FAILED = 'SETUP_WIZARD_COMPLETION_FAILED',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error categories for grouping
export enum ErrorCategory {
  HOUSEHOLD = 'household',
  MEMBER = 'member',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  API = 'api',
  NETWORK = 'network',
  FORM = 'form',
  SETUP = 'setup',
}
