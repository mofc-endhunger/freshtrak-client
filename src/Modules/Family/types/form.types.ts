// Form Data and Validation TypeScript Interfaces

import {
  FieldError,
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  UseFormGetValues,
  UseFormTrigger,
} from 'react-hook-form';

// React Hook Form specific types
export interface FormRegister extends UseFormRegister<any> {}
export interface FormWatch extends UseFormWatch<any> {}
export interface FormSetValue extends UseFormSetValue<any> {}
export interface FormGetValues extends UseFormGetValues<any> {}
export interface FormTrigger extends UseFormTrigger<any> {}
export interface FormErrors extends Record<string, FieldError> {}
export interface FormError extends FieldError {}

// Form field validation rules
export interface ValidationRules {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: Record<string, (value: any) => boolean | string>;
  min?: { value: number; message: string };
  max?: { value: number; message: string };
}

// Primary Information Form Data
export interface PrimaryInfoFormData {
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: 'Jr' | 'Sr' | 'II' | 'III' | 'IV' | 'V';
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'not_specify';
}

// Address Form Data
export interface AddressFormData {
  address_line_1: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
  neighborhood?: string;
}

// Contact Information Form Data
export interface ContactInfoFormData {
  phone?: string;
  alternate_phone?: string;
  email?: string;
  no_phone_number?: boolean;
  no_email?: boolean;
  permission_to_text?: boolean;
  permission_to_email?: boolean;
  preferred_contact_method?: 'phone' | 'email' | 'text';
}

// Household Information Form Data
export interface HouseholdFormData {
  seniors_in_household: number;
  adults_in_household: number;
  children_in_household: number;
  total_household_size?: number;
}

// Event Selection Form Data
export interface EventSelectionFormData {
  event_id?: string;
  selected_event_slots?: number;
  event_date?: string;
  event_time?: string;
  event_location?: string;
}

// Password Registration Form Data
export interface PasswordFormData {
  email: string;
  password: string;
  password_confirm: string;
  password_strength?: 'weak' | 'medium' | 'strong';
  accept_terms?: boolean;
}

// Additional Pickup Person Form Data
export interface AdditionalPickupFormData {
  additional_pickup_first_name?: string;
  additional_pickup_last_name?: string;
  additional_pickup_relationship?: string;
  additional_pickup_phone?: string;
  additional_pickup_email?: string;
  has_additional_pickup?: boolean;
}

// Complete Family Registration Form Data
export interface CompleteFamilyFormData
  extends
    PrimaryInfoFormData,
    AddressFormData,
    ContactInfoFormData,
    HouseholdFormData,
    EventSelectionFormData,
    Partial<PasswordFormData>,
    Partial<AdditionalPickupFormData> {
  // Additional form-wide properties
  form_step?: number;
  is_complete?: boolean;
  submitted_at?: string;
  updated_at?: string;
}

// Form validation schemas
export interface PrimaryInfoValidationSchema {
  first_name: ValidationRules;
  last_name: ValidationRules;
  date_of_birth: ValidationRules;
  gender: ValidationRules;
}

export interface AddressValidationSchema {
  address_line_1: ValidationRules;
  city: ValidationRules;
  state: ValidationRules;
  zip_code: ValidationRules;
}

export interface ContactInfoValidationSchema {
  phone: ValidationRules;
  email: ValidationRules;
  permission_to_text?: ValidationRules;
  permission_to_email?: ValidationRules;
}

export interface HouseholdValidationSchema {
  seniors_in_household: ValidationRules;
  adults_in_household: ValidationRules;
  children_in_household: ValidationRules;
}

export interface PasswordValidationSchema {
  email: ValidationRules;
  password: ValidationRules;
  password_confirm: ValidationRules;
}

// Form component props with proper typing
export interface FormComponentProps {
  register: FormRegister;
  errors: FormErrors;
  watch: FormWatch;
  setValue: FormSetValue;
  getValues?: FormGetValues;
  trigger?: FormTrigger;
  continueHandler?: () => void;
}

// Specific form component props
export interface PrimaryInfoFormProps extends FormComponentProps {
  // Additional props specific to PrimaryInfoForm
}

export interface AddressFormProps extends FormComponentProps {
  // Additional props specific to AddressForm
}

export interface ContactInfoFormProps extends FormComponentProps {
  // Additional props specific to ContactInfoForm
}

export interface HouseholdFormProps extends FormComponentProps {
  event: any; // Event type from family.types.ts
}

export interface PasswordFormProps extends FormComponentProps {
  // Additional props specific to PasswordForm
}

export interface AdditionalPickupFormProps extends FormComponentProps {
  // Additional props specific to AdditionalPickupForm
}

// Form validation functions
export type ValidationFunction<T> = (value: T) => boolean | string;

export interface DateValidationFunctions {
  isValidDate: ValidationFunction<string>;
  isValidAge: ValidationFunction<string>;
  isValidDateFormat: ValidationFunction<string>;
}

export interface PhoneValidationFunctions {
  isValidPhone: ValidationFunction<string>;
  formatPhone: ValidationFunction<string>;
  isCompletePhone: ValidationFunction<string>;
}

export interface EmailValidationFunctions {
  isValidEmail: ValidationFunction<string>;
  isUniqueEmail: ValidationFunction<string>;
}

export interface PasswordValidationFunctions {
  isStrongPassword: ValidationFunction<string>;
  passwordsMatch: ValidationFunction<string>;
  hasMinLength: ValidationFunction<string>;
  hasUppercase: ValidationFunction<string>;
  hasLowercase: ValidationFunction<string>;
  hasNumber: ValidationFunction<string>;
  hasSpecialChar: ValidationFunction<string>;
}

export interface AddressValidationFunctions {
  isValidAddress: ValidationFunction<string>;
  isValidZipCode: ValidationFunction<string>;
  isValidState: ValidationFunction<string>;
  isValidCity: ValidationFunction<string>;
}

// Form submission types
export interface FormSubmissionData {
  formData: CompleteFamilyFormData;
  validationErrors: FormErrors;
  isValid: boolean;
  timestamp: string;
}

export interface FormSubmissionResult {
  success: boolean;
  data?: CompleteFamilyFormData;
  errors?: FormErrors;
  message?: string;
}

// Form state management
export interface FormState {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  isSubmitted: boolean;
  hasErrors: boolean;
  errors: FormErrors;
  data: Partial<CompleteFamilyFormData>;
}

// Form navigation
export interface FormNavigation {
  canGoNext: boolean;
  canGoPrevious: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToNext: () => void;
  goToPrevious: () => void;
  goToStep: (step: number) => void;
}

// Form field types for dynamic rendering
export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'textarea';

export interface FormField {
  name: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRules;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: any;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  validation?: Record<string, ValidationRules>;
}

// Form configuration
export interface FormConfig {
  sections: FormSection[];
  validation: Record<string, ValidationRules>;
  navigation: {
    allowStepBack: boolean;
    requireStepValidation: boolean;
    autoAdvance: boolean;
  };
  submission: {
    endpoint: string;
    method: 'POST' | 'PUT' | 'PATCH';
    headers?: Record<string, string>;
  };
}
