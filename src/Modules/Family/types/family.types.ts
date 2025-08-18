// Family Module TypeScript Interfaces

// Event-related types
export interface Event {
  id?: string;
  name?: string;
  date?: string;
  time?: string;
  location?: string;
  seniorAge?: number;
  maxHouseholdSize?: number;
  availableSlots?: number;
  description?: string;
  acceptReservations?: number;
  [key: string]: any; // Allow additional properties
}

// Address-related types
export interface Address {
  address_line_1: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
  neighborhood?: string;
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
}

export interface GooglePlaceComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface GooglePlace {
  address_components: GooglePlaceComponent[];
  formatted_address?: string;
  place_id?: string;
}

// Family member types
export interface FamilyMember {
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  date_of_birth?: string;
  age?: number;
  member_type: 'senior' | 'adult' | 'child';
}

export interface HouseholdCounts {
  seniors_in_household: number;
  adults_in_household: number;
  children_in_household: number;
}

// Contact information types
export interface ContactInformation {
  email: string;
  phone: string;
  alternate_phone?: string;
  preferred_contact_method?: 'email' | 'phone' | 'text';
}

// Password registration types
export interface PasswordRegistration {
  password: string;
  confirm_password: string;
  password_strength?: 'weak' | 'medium' | 'strong';
}

// Additional pickup person types
export interface AdditionalPickUpPerson {
  first_name: string;
  last_name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// Form data types
export interface FamilyRegistrationFormData {
  // Primary Information
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  date_of_birth?: string;

  // Address Information
  address_line_1: string;
  city: string;
  state: string;
  zip_code: string;

  // Contact Information
  email: string;
  phone: string;
  alternate_phone?: string;

  // Household Information
  seniors_in_household: number;
  adults_in_household: number;
  children_in_household: number;

  // Event Selection
  selected_event_slots?: number;
  event_id?: string;

  // Password (if applicable)
  password?: string;
  confirm_password?: string;

  // Additional Pickup Person (if applicable)
  additional_pickup_person?: AdditionalPickUpPerson;
}

// Component prop types
export interface FormComponentProps {
  register: any; // react-hook-form register function
  errors: any; // react-hook-form errors object
  watch: any; // react-hook-form watch function
  setValue: any; // react-hook-form setValue function
  getValues?: any; // react-hook-form getValues function
  trigger?: any; // react-hook-form trigger function
  continueHandler?: () => void;
}

export interface AddressComponentProps extends FormComponentProps {
  // Additional props specific to AddressComponent
}

export interface MemberCountFormComponentProps extends FormComponentProps {
  event: Event;
}

export interface EventSlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  selectedSlots: number;
  onSlotSelection: (slots: number) => void;
  maxSlots?: number;
}

// Validation types
export interface ValidationError {
  type: string;
  message: string;
}

export interface FormErrors {
  [key: string]: ValidationError;
}

// Localization types
export interface Localization {
  register_who_are_you: string;
  register_where_you_live: string;
  register_about_family: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  street_address: string;
  family_count: string;
  seniors: string;
  adults: string;
  children: string;
  [key: string]: string; // Allow additional localization keys
}

// Utility function types
export type DateValidationFunction = (value: string) => boolean;
export type PhoneFormattingFunction = (value: string) => string;
export type AddressValidationFunction = (address: Address) => boolean;
