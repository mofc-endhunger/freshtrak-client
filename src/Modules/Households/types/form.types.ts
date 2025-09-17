// Households Form TypeScript Interfaces

import { MemberGender, MemberRace, MemberEthnicity, LanguagePreference } from './household.types';

// Form validation error types
export interface FormValidationError {
  type: string;
  message: string;
  field?: string;
}

export interface FormErrors {
  [key: string]: FormValidationError;
}

// Household setup form data
export interface HouseholdSetupFormData {
  // Address Information
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;

  // Language Preference
  preferred_language: LanguagePreference;

  // Notes
  notes?: string;

  // Primary User Information
  primary_first_name: string;
  primary_middle_name?: string;
  primary_last_name: string;
  primary_suffix?: string;
  primary_date_of_birth: string;
  primary_gender?: MemberGender;
  primary_phone?: string;
  primary_email?: string;
  primary_race?: MemberRace;
  primary_ethnicity?: MemberEthnicity;
}

// Member form data
export interface MemberFormData {
  // Personal Information
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;

  // Demographics
  date_of_birth: string;
  gender?: MemberGender;
  race?: MemberRace;
  ethnicity?: MemberEthnicity;

  // Contact Information
  phone?: string;
  email?: string;

  // Address Information (optional - defaults to household address)
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;

  // Status
  is_active: boolean;
}

// Household edit form data
export interface HouseholdEditFormData {
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  preferred_language: LanguagePreference;
  notes?: string;
}

// Form component props
export interface FormComponentProps {
  register: any; // react-hook-form register function
  errors: any; // react-hook-form errors object
  watch: any; // react-hook-form watch function
  setValue: any; // react-hook-form setValue function
  getValues?: any; // react-hook-form getValues function
  trigger?: any; // react-hook-form trigger function
  control?: any; // react-hook-form control object
}

// Household setup wizard props
export interface HouseholdSetupWizardProps {
  onComplete: (data: HouseholdSetupFormData) => Promise<void>;
  onSkip: () => void;
  isLoading?: boolean;
  initialData?: Partial<HouseholdSetupFormData>;
}

// Member form props
export interface MemberFormProps extends FormComponentProps {
  onSave: (data: MemberFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<MemberFormData>;
  isEdit?: boolean;
  memberId?: number;
}

// Household edit form props
export interface HouseholdEditFormProps extends FormComponentProps {
  onSave: (data: HouseholdEditFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<HouseholdEditFormData>;
}

// Form step configuration
export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  validation?: any; // Zod schema or similar
  isOptional?: boolean;
}

export interface MultiStepFormConfig {
  steps: FormStep[];
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  onComplete: (data: any) => void;
  onSkip?: () => void;
}

// Address autocomplete types
export interface AddressAutocompleteProps extends FormComponentProps {
  onAddressSelect: (address: GooglePlaceAddress) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export interface GooglePlaceAddress {
  street_number?: string;
  route?: string;
  locality?: string;
  administrative_area_level_1?: string;
  administrative_area_level_1_short?: string;
  country?: string;
  postal_code?: string;
  neighborhood?: string;
  formatted_address?: string;
  place_id?: string;
}

// Phone input types
export interface PhoneInputProps extends FormComponentProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  countryCode?: string;
  onPhoneChange?: (phone: string) => void;
}

// Date picker types
export interface DatePickerProps extends FormComponentProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  maxDate?: Date;
  minDate?: Date;
  onDateChange?: (date: string) => void;
}

// Language selector types
export interface LanguageSelectorProps extends FormComponentProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  onLanguageChange?: (language: LanguagePreference) => void;
}

// Gender selector types
export interface GenderSelectorProps extends FormComponentProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  onGenderChange?: (gender: MemberGender) => void;
}

// Form validation schemas
export interface ValidationSchema {
  householdSetup: any; // Zod schema
  memberForm: any; // Zod schema
  householdEdit: any; // Zod schema
}

// Form submission states
export type FormSubmissionState = 'idle' | 'submitting' | 'success' | 'error';

export interface FormSubmissionStatus {
  state: FormSubmissionState;
  message?: string;
  error?: string;
  progress?: number;
}

// Form field configuration
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  validation?: any;
  options?: Array<{ value: string; label: string }>;
  helpText?: string;
  disabled?: boolean;
}

// Dynamic form configuration
export interface DynamicFormConfig {
  fields: FormFieldConfig[];
  validation: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}
