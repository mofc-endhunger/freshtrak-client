// Unified HouseholdForm Component Type Definitions
// This file contains all TypeScript interfaces and types for the unified HouseholdForm component

import { RegistrationFormData, HouseholdCounts } from "../../../Modules/Registration/types/registration.types";
import { HouseholdMember } from "../../../Modules/Households/types/household.types";

// ============================================================================
// CORE COMPONENT TYPES
// ============================================================================

/**
 * Mode for the unified HouseholdForm component
 */
export type HouseholdFormMode = "registration" | "householdSetup";

/**
 * Configuration for different form modes
 */
export interface FormModeConfig {
  mode: HouseholdFormMode;
  title: string;
  subtitle: string;
  showEventSlots: boolean;
  showFamilyMemberDetails: boolean;
  showCurrentHouseholdMembers: boolean;
  submitButtonText: string;
  cancelButtonText: string;
  steps: FormStepConfig[];
}

/**
 * Configuration for each form step
 */
export interface FormStepConfig {
  id: number;
  title: string;
  component: string;
  isVisible: boolean;
  isRequired: boolean;
}

/**
 * Props for the unified HouseholdForm component
 */
export interface HouseholdFormProps {
  // Core props
  mode: HouseholdFormMode;
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  onCancel: () => void;

  // Data props
  prefilledData?: Partial<RegistrationFormData>;
  event?: any; // Event object for registration mode
  disabled?: boolean;

  // UI customization props
  title?: string;
  subtitle?: string;
  submitButtonText?: string;
  cancelButtonText?: string;

  // Household-specific props (only used in householdSetup mode)
  currentHouseholdMembers?: any[]; // ApiHouseholdMember[]
  onDeleteMember?: (memberId: number) => void;
  deletedMemberIds?: number[];

  // Additional props for flexibility
  className?: string;
  "data-testid"?: string;
}

/**
 * Internal state for the HouseholdForm component
 */
export interface HouseholdFormState {
  formStep: number;
  formValues: Partial<RegistrationFormData>;
  isSubmitting: boolean;
  isLoadingUserData: boolean;
  familyMembers: HouseholdMember[];
  householdCounts: HouseholdCounts | null;
  hasAdditionalMembers: boolean;
  selectedSlotId: string;
}

/**
 * Step navigation configuration
 */
export interface StepNavigationConfig {
  canGoBack: boolean;
  canContinue: boolean;
  canSubmit: boolean;
  nextStepHandler: () => void;
  previousStepHandler: () => void;
  submitHandler: () => void;
}

/**
 * Form validation configuration
 */
export interface FormValidationConfig {
  requiredFields: (keyof RegistrationFormData)[];
  conditionalFields: {
    phone: boolean;
    email: boolean;
  };
}

// ============================================================================
// MODE-SPECIFIC CONFIGURATIONS
// ============================================================================

/**
 * Default configuration for registration mode
 */
export const REGISTRATION_MODE_CONFIG: FormModeConfig = {
  mode: "registration",
  title: "Event Registration",
  subtitle: "Complete your registration for the upcoming event",
  showEventSlots: true,
  showFamilyMemberDetails: false,
  showCurrentHouseholdMembers: false,
  submitButtonText: "Register",
  cancelButtonText: "Cancel",
  steps: [
    { id: 0, title: "Your Details", component: "PrimaryInfo", isVisible: true, isRequired: true },
    { id: 1, title: "Your Address Details", component: "AddressContact", isVisible: true, isRequired: true },
    { id: 2, title: "Your Family Details", component: "MemberCount", isVisible: true, isRequired: true },
  ],
};

/**
 * Default configuration for household setup mode
 */
export const HOUSEHOLD_SETUP_MODE_CONFIG: FormModeConfig = {
  mode: "householdSetup",
  title: "Set Up Your Household",
  subtitle: "Complete your household profile to get personalized services",
  showEventSlots: false,
  showFamilyMemberDetails: true,
  showCurrentHouseholdMembers: true,
  submitButtonText: "Complete Setup",
  cancelButtonText: "Cancel",
  steps: [
    { id: 0, title: "Your Details", component: "PrimaryInfo", isVisible: true, isRequired: true },
    { id: 1, title: "Your Address Details", component: "Address", isVisible: true, isRequired: true },
    { id: 2, title: "Your Family Details", component: "MemberCount", isVisible: true, isRequired: true },
    { id: 3, title: "Contact Information", component: "Contact", isVisible: true, isRequired: true },
    { id: 4, title: "Family Member Details", component: "FamilyMemberDetails", isVisible: false, isRequired: false },
  ],
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Step component mapping
 */
export type StepComponent =
  | "PrimaryInfo"
  | "Address"
  | "AddressContact"
  | "Contact"
  | "MemberCount"
  | "FamilyMemberDetails";

/**
 * Form step enumeration
 */
export enum HouseholdFormStep {
  PRIMARY_INFO = 0,
  ADDRESS = 1,
  ADDRESS_CONTACT = 1, // For registration mode
  MEMBER_COUNT = 2,
  CONTACT = 3, // For household setup mode
  FAMILY_MEMBER_DETAILS = 4, // For household setup mode
}

/**
 * Button variant types
 */
export type ButtonVariant = "highlight" | "highlightOutline" | "outline" | "default";

/**
 * Progress indicator configuration
 */
export interface ProgressIndicatorConfig {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  showProgress: boolean;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Event handler types for the unified component
 */
export type FormSubmitHandler = (data: RegistrationFormData) => Promise<void>;
export type FormCancelHandler = () => void;
export type StepChangeHandler = (step: number) => void;
export type MemberDeleteHandler = (memberId: number) => void;
export type FamilyMembersCompleteHandler = (members: HouseholdMember[], counts: HouseholdCounts) => void;
export type FamilyMembersSkipHandler = (counts: HouseholdCounts) => void;

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
}

/**
 * Step validation configuration
 */
export interface StepValidationConfig {
  step: number;
  requiredFields: (keyof RegistrationFormData)[];
  conditionalValidation?: {
    field: keyof RegistrationFormData;
    condition: (formData: Partial<RegistrationFormData>) => boolean;
  }[];
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default form state
 */
export const DEFAULT_FORM_STATE: HouseholdFormState = {
  formStep: 0,
  formValues: {},
  isSubmitting: false,
  isLoadingUserData: false,
  familyMembers: [],
  householdCounts: null,
  hasAdditionalMembers: false,
  selectedSlotId: "",
};

/**
 * Default validation configuration
 */
export const DEFAULT_VALIDATION_CONFIG: FormValidationConfig = {
  requiredFields: [
    "first_name",
    "last_name",
    "date_of_birth",
    "gender",
    "address_line_1",
    "city",
    "state",
    "zip_code",
  ],
  conditionalFields: {
    phone: true,
    email: true,
  },
};
