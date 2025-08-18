// Event-related TypeScript Interfaces

// Base Event interface
export interface Event {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  eventAddress: string;
  eventCity: string;
  eventState: string;
  eventZip: string;
  phoneNumber: string;
  agencyName: string;
  eventName: string;
  eventService: string;
  acceptReservations: number;
  acceptInterest: boolean;
  acceptWalkin: boolean;
  eventDetails: string;
  exceptionNote?: string;
  latitude?: number;
  longitude?: number;
  agencyLatitude?: number;
  agencyLongitude?: number;
  estimatedDistance?: number;
  seniorAge?: number;
  adultAge?: number;
  maxHouseholdSize?: number;
  availableSlots?: number;
  [key: string]: any; // Allow additional properties
}

// Event Date interface
export interface EventDate {
  id: string;
  event_id: string;
  accept_reservations: boolean;
  accept_interest: boolean;
  accept_walkin: boolean;
  start_time: string;
  end_time: string;
  date: string;
}

// Event Hour interface
export interface EventHour {
  id: number;
  start_time: string;
  end_time: string;
  event_hour_id: number;
  event_slots: EventSlot[];
}

// Event Slot interface
export interface EventSlot {
  id: number;
  event_slot_id: number;
  start_time: string;
  end_time: string;
  open_slots: number;
  total_slots?: number;
  reserved_slots?: number;
  is_selected?: boolean;
}

// Event API Response interfaces
export interface EventApiResponse {
  event?: Event;
  success?: boolean;
  message?: string;
}

export interface EventDateApiResponse {
  event_date: {
    id: string;
    date: string;
    event_hours: EventHour[];
    accept_reservations: boolean;
    accept_interest: boolean;
    accept_walkin: boolean;
    start_time: string;
    end_time: string;
  };
  success?: boolean;
  message?: string;
}

export interface EventHoursApiResponse {
  event_date: {
    id: string;
    date: string;
    event_hours: EventHour[];
  };
  success?: boolean;
  message?: string;
}

// Event Form interface
export interface EventForm {
  id: string;
  display_age_senior: number;
  display_age_adult: number;
  display_age_child?: number;
  max_household_size?: number;
  form_fields?: EventFormField[];
}

export interface EventFormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'select' | 'checkbox' | 'radio' | 'date';
  required: boolean;
  label: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: EventFieldValidation;
}

export interface EventFieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => boolean | string;
}

// Service Category interface
export interface ServiceCategory {
  id: string;
  service_category_name: string;
  description?: string;
  icon?: string;
}

// Event Registration interface
export interface EventRegistration {
  event_id: string;
  event_date_id: string;
  event_slot_id?: number;
  household_size: number;
  seniors_count: number;
  adults_count: number;
  children_count: number;
  registration_date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  confirmation_code?: string;
}

// Event Selection interface
export interface EventSelection {
  event_id: string;
  event_date_id: string;
  event_slot_id?: number;
  selected_slots: number;
  max_available_slots: number;
  selection_date: string;
  is_confirmed: boolean;
}

// Event Modal Props interface
export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  selectedSlotId?: number;
  onSlotChange: (slotId: number) => void;
  targetUrl?: string;
}

// Event Component Props interfaces
export interface EventCardProps {
  event: Event;
  registrationView?: boolean;
  alreadyRegistered?: boolean;
  agencyLatitude?: number;
  agencyLongitude?: number;
}

export interface EventListProps {
  events: Event[];
  loading?: boolean;
  error?: string;
  onEventSelect?: (event: Event) => void;
}

export interface EventDetailsProps {
  event: Event;
  onRegister?: (event: Event) => void;
  onBack?: () => void;
}

// Event State interfaces
export interface EventState {
  currentEvent: Event | null;
  events: Event[];
  loading: boolean;
  error: string | null;
  selectedEventDate?: string;
  selectedEventSlot?: number;
}

// Event Actions interface
export interface EventActions {
  setCurrentEvent: (event: Event) => void;
  clearCurrentEvent: () => void;
  setEvents: (events: Event[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  selectEventDate: (dateId: string) => void;
  selectEventSlot: (slotId: number) => void;
}

// Event Utility function types
export type EventMapperFunction = (event: any, ...args: any[]) => Event;
export type EventFormatterFunction = (event: any, eventDateId: string) => Event;
export type EventValidationFunction = (event: Event) => boolean;

// Event API function types
export type GetEventFunction = (eventId: string) => Promise<EventApiResponse>;
export type GetEventHoursFunction = (eventDateId: string) => Promise<EventHoursApiResponse>;
export type GetEventSlotsFunction = (eventHourId: string) => Promise<EventSlot[]>;
export type RegisterForEventFunction = (registration: EventRegistration) => Promise<boolean>;

// Event Constants
export const EVENT_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
} as const;

export const EVENT_ACCEPTANCE_TYPES = {
  RESERVATIONS: 'reservations',
  INTEREST: 'interest',
  WALKIN: 'walkin',
} as const;

export const DEFAULT_EVENT_AGES = {
  SENIOR: 60,
  ADULT: 18,
  CHILD: 0,
} as const;

// Event Validation interfaces
export interface EventValidationRules {
  requiredFields: (keyof Event)[];
  dateValidation: {
    startTimeBeforeEndTime: boolean;
    dateInFuture: boolean;
    maxDaysInAdvance?: number;
  };
  slotValidation: {
    minSlots: number;
    maxSlots: number;
    requireSlotSelection: boolean;
  };
  householdValidation: {
    minHouseholdSize: number;
    maxHouseholdSize: number;
    requireAllAgeGroups: boolean;
  };
}

// Event Error types
export interface EventError {
  type: 'validation' | 'api' | 'network' | 'unknown';
  message: string;
  field?: string;
  code?: string;
}

// Event Success types
export interface EventSuccess {
  type: 'registration' | 'confirmation' | 'cancellation';
  message: string;
  data?: any;
  timestamp: string;
}

// Event Analytics types
export interface EventAnalytics {
  event_id: string;
  total_registrations: number;
  total_slots_available: number;
  total_slots_reserved: number;
  average_household_size: number;
  registration_rate: number;
  cancellation_rate: number;
  popular_time_slots: EventSlot[];
  demographics: {
    seniors_percentage: number;
    adults_percentage: number;
    children_percentage: number;
  };
}
