// Home Module TypeScript Interfaces

// ============================================================================
// DATA STRUCTURE INTERFACES
// ============================================================================

/**
 * Food Bank data structure
 */
export interface FoodBank {
  id: string;
  name: string;
  logo: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  display_url: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Food Bank API Response
 */
export interface FoodBankApiResponse {
  foodbanks: FoodBank[];
  success?: boolean;
  message?: string;
}

/**
 * Image attached to an agency or event from the API
 */
export interface AgencyImage {
  id: number;
  type: string;
  caption: string;
  src: string;
}

/**
 * Agency data structure for events
 */
export interface Agency {
  id: string;
  name: string;
  nickname?: string;
  events: Event[];
  images?: AgencyImage[];
  [key: string]: any; // Allow additional properties
}

/**
 * Event data structure (using existing Event interface from Family types)
 */
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
  acceptReservations: boolean;
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
  agencyImages?: AgencyImage[];
  eventImages?: AgencyImage[];
  [key: string]: any; // Allow additional properties
}

/**
 * Reserved Event structure
 */
export interface ReservedEvent extends Event {
  event_date_id: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Home Event Format structure (what HomeEventFormat actually returns)
 */
export interface HomeEventFormatData {
  id: string;
  eventId: string;
  acceptReservations: boolean;
  acceptInterest: boolean;
  acceptWalkin: boolean;
  startTime: string;
  endTime: string;
  date: string;
  eventAddress: string;
  eventCity: string;
  eventState: string;
  eventZip: string;
  phoneNumber: string;
  agencyName: string;
  eventName: string;
  exceptionNote?: string;
  eventService?: string;
  estimatedDistance?: number;
  eventDetails: string;
  seniorAge: number;
  adultAge: number;
  agencyImages?: AgencyImage[];
  eventImages?: AgencyImage[];
  [key: string]: any; // Allow additional properties
}

/**
 * User Registration data structure
 */
export interface UserRegistration {
  event_date_id: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Form data for zip code search
 */
export interface ZipCodeFormData {
  zip_code: string;
}

/**
 * Event filter options
 */
export type EventFilter = 'today' | 'week' | 'all';

/**
 * Filtered events structure
 */
export interface FilteredEvents {
  [date: string]: Event[];
}

// ============================================================================
// COMPONENT PROPS INTERFACES
// ============================================================================

/**
 * HomeContainer component props
 */
export interface HomeContainerProps {
  // No props needed for this component
}

/**
 * LocalFoodBankComponent props
 */
export interface LocalFoodBankComponentProps {
  zipCode: string | null;
}

/**
 * UsersRegistrations component props
 */
export interface UsersRegistrationsProps {
  reservedEvents: ReservedEvent[];
}

/**
 * EventNearByComponent props
 */
export interface EventNearByComponentProps {
  EventList: React.FC<EventListProps>;
}

/**
 * YourPantriesComponent props
 */
export interface YourPantriesComponentProps {
  // No props needed for this component
}

// ============================================================================
// STATE INTERFACES
// ============================================================================

/**
 * HomeContainer state interface
 */
export interface HomeContainerState {
  agencyResponse: boolean;
  agencyData: Agency[];
  reservedEvents: ReservedEvent[];
  zipCode: string | null;
  searchDetails: Record<string, any>;
  loading: boolean;
}

/**
 * LocalFoodBankComponent state interface
 */
export interface LocalFoodBankComponentState {
  foodBankData: FoodBank | 'no_foodbanks_found' | Record<string, never>;
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

/**
 * Events List API Response
 */
export interface EventsListApiResponse {
  agencies: Agency[];
  success?: boolean;
  message?: string;
}

/**
 * User Reservations API Response
 */
export interface UserReservationsApiResponse {
  data: UserRegistration[];
  success?: boolean;
  message?: string;
}

// ============================================================================
// UTILITY TYPE INTERFACES
// ============================================================================

/**
 * Event List component props for the EventList function
 */
export interface EventListProps {
  filter: EventFilter;
}

/**
 * Loading spinner size options
 */
export type LoadingSpinnerSize = 'small' | 'medium' | 'large';

/**
 * Search component props
 */
export interface SearchComponentProps {
  register: any; // react-hook-form register function
  errors: any; // react-hook-form errors
  onSubmitHandler: (data: ZipCodeFormData) => void;
  searchData: Record<string, any>;
}
