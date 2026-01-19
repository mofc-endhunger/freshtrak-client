// Registration Module Type Definitions
// This file contains all TypeScript interfaces and types for the Registration module

// ============================================================================
// CORE DATA TYPES
// ============================================================================

/**
 * Family member data interface for household setup
 */
export interface FamilyMemberData {
  first_name: string;
  last_name: string;
  middle_name?: string;
  gender_id: number; // 1 for male, 2 for female, 3 for other, 4 for prefer_not_to_say
  date_of_birth: string;
  suffix_id?: number;
}

/**
 * Household counts interface
 */
export interface HouseholdCounts {
  seniors: number;
  adults: number;
  children: number;
  total: number;
}

/**
 * Registration form data interface
 * Represents the complete user registration form data
 */

export interface RegistrationFormDataPatch {
  updated: boolean;
}
export interface RegistrationFormData {
  // Personal Information
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  date_of_birth: string;
  gender: string;

  // Address Information
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;

  // Contact Information
  phone: string;
  permission_to_text: boolean;
  email: string;
  permission_to_email: boolean;
  no_phone_number?: boolean;
  no_email?: boolean;

  // Household Information
  seniors_in_household: number;
  adults_in_household: number;
  children_in_household: number;

  // Family Members (for household setup)
  family_members?: FamilyMemberData[];
  household_counts?: HouseholdCounts;
  deleted_member_ids?: number[];

  // Additional Information
  license_plate?: string;
  identification_code?: string;

  // System Fields
  id?: string;
  user_type?: string;
  created_at?: string;
  updated_at?: string;
  credential_id?: string;
  user_detail_id?: string;
}

/**
 * Event interface
 * Represents event data structure
 */
export interface Event {
  id: string;
  agencyName: string;
  date: string;
  startTime: string;
  endTime: string;
  acceptWalkin: boolean;
  eventDetails?: string;
  // Additional event properties as needed
  [key: string]: any;
}

/**
 * API Response interface
 * Generic API response structure
 */
export interface ApiResponse<T = any> {
  data?: T;
  errors?: string[];
  message?: string;
  success?: boolean;
}

/**
 * User API Response interface
 * Specific response structure for user data
 */
export interface UserApiResponse {
  date_of_birth?: string | null;
  phone?: string | null;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  identification_code?: string;
  [key: string]: any;
}

/**
 * Event API Response interface
 * Specific response structure for event data
 */
export interface EventApiResponse {
  event?: {
    id: string;
    agencyName: string;
    date: string;
    startTime: string;
    endTime: string;
    acceptWalkin: boolean;
    eventDetails?: string;
    [key: string]: any;
  };
}

// ============================================================================
// COMPONENT PROPS INTERFACES
// ============================================================================

/**
 * General Registration props interface
 * Common props shared across registration components
 */
export interface RegistrationProps {
  event?: Event;
  user?: RegistrationFormData;
  onRegister?: (data: RegistrationFormData) => Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
}

/**
 * RegistrationContainer component props
 */
export interface RegistrationContainerProps {
  // Add any specific props if needed
}

/**
 * RegistrationComponent props
 */
export interface RegistrationComponentProps {
  user: RegistrationFormData;
  onRegister: (data: RegistrationFormData) => Promise<void>;
  event: Event;
  disabled: boolean;
  householdMembers?: any[]; // Existing household members for count validation
}

/**
 * RegistrationConfirmComponent props
 */
export interface RegistrationConfirmProps {
  location?: {
    state: {
      user: RegistrationFormData;
      eventTimeStamp: Record<string, any>;
    };
  };
}

/**
 * RegistrationEventDetailsContainer props
 */
export interface RegistrationEventDetailsProps {
  // Add specific props as needed
}

/**
 * RegistrationTextInfoComponent props
 */
export interface RegistrationTextInfoProps {
  event?: Event;
  onRegisterNow?: () => void;
}

/**
 * RegistrationHeaderComponent props
 */
export interface RegistrationHeaderProps {
  event?: Event;
}

/**
 * RegistrationTextComponent props
 */
export interface RegistrationTextProps {
  event?: Event;
}

/**
 * QRCodeComponent props
 */
export interface QRCodeProps {
  code?: string;
}

// ============================================================================
// STATE INTERFACES
// ============================================================================

/**
 * RegistrationContainer state interface
 */
export interface RegistrationContainerState {
  isLoading: boolean;
  userToken: string | undefined;
  isError: boolean;
  pageError: boolean;
  errors: string[];
  disabled: boolean;
  showAuthModal: boolean;
  selectedEvent: Event | null;
  user: RegistrationFormData | null;
}

/**
 * RegistrationComponent state interface
 */
export interface RegistrationComponentState {
  formStep: number;
  formValues: RegistrationFormData;
  selectedSlotId: string | null;
  isSubmitting: boolean;
}

// ============================================================================
// FUNCTION TYPES
// ============================================================================

/**
 * Event handler types
 */
export type EventHandler<T = Event> = (event: T) => void;
export type FormSubmitHandler = (data: RegistrationFormData) => Promise<void>;
export type ValidationHandler = (data: RegistrationFormData) => boolean;

/**
 * API function types
 */
export type ApiFunction<T = any> = (params?: any) => Promise<ApiResponse<T>>;
export type GetEventFunction = (eventDateId: string) => Promise<Event>;
export type RegisterUserFunction = (user: RegistrationFormData, event: Event) => Promise<void>;

// ============================================================================
// FORM VALIDATION TYPES
// ============================================================================

/**
 * Form validation error interface
 */
export interface FormValidationError {
  field: string;
  message: string;
  type: 'required' | 'invalid' | 'custom';
}

/**
 * Form validation result interface
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: FormValidationError[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Redux store types
 */
export interface RegistrationStore {
  event: Event | null;
  user: RegistrationFormData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Navigation types
 */
export interface RegistrationNavigationParams {
  eventDateId: string;
  eventSlotId?: string;
}

/**
 * Toast notification types
 */
export interface ToastNotification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Form step constants
 */
export enum FormStep {
  PRIMARY_INFO = 0,
  ADDRESS_CONTACT = 1,
  FAMILY_MEMBERS = 2,
}

/**
 * Gender options
 */
export const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;
export type Gender = typeof GENDER_OPTIONS[number];

/**
 * State options (US states)
 */
export const STATE_OPTIONS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
] as const;
export type State = typeof STATE_OPTIONS[number];

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default user object
 */
export const DEFAULT_USER: RegistrationFormData = {
  first_name: '',
  middle_name: '',
  last_name: '',
  suffix: '',
  date_of_birth: '',
  gender: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  zip_code: '',
  phone: '',
  permission_to_text: false,
  email: '',
  permission_to_email: false,
  seniors_in_household: 0,
  adults_in_household: 0,
  children_in_household: 0,
  identification_code: '',
};

/**
 * Default event object
 */
export const DEFAULT_EVENT: Event = {
  id: '',
  agencyName: '',
  date: '',
  startTime: '',
  endTime: '',
  acceptWalkin: false,
  eventDetails: '',
}; 