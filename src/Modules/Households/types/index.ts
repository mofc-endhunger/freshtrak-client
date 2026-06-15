// Households Module TypeScript Interfaces - Main Export File

// Core household types
export * from './household.types';

// API types
export * from './api.types';

// Form types
export * from './form.types';

// Error types
export * from './error.types';

// Re-export commonly used types for convenience
export type {
  Household,
  HouseholdMember,
  HouseholdMemberDisplay,
  HouseholdCounts,
  CreateHouseholdRequest,
  UpdateHouseholdRequest,
  CreateMemberRequest,
  UpdateMemberRequest,
  HouseholdSetupStatus,
  MemberStatus,
  MemberGender,
  MemberRace,
  MemberEthnicity,
  LanguagePreference,
} from './household.types';

export type {
  ApiResponse,
  ApiErrorResponse,
  HouseholdResponse,
  MemberResponse,
  HouseholdApiService,
  HouseholdApiError,
  HouseholdApiErrorDetails,
} from './api.types';

export type {
  HouseholdSetupFormData,
  MemberFormData,
  HouseholdEditFormData,
  FormComponentProps,
  MemberFormProps,
  HouseholdEditFormProps,
  ValidationSchema,
  FormSubmissionState,
  FormSubmissionStatus,
} from './form.types';

export type {
  HouseholdErrorType,
  ErrorContext,
  ErrorHandler,
  ErrorState,
  ErrorRecoveryAction,
  ErrorMessageConfig,
} from './error.types';

// Export enums
export { HouseholdErrorCodes, ErrorSeverity, ErrorCategory } from './error.types';
