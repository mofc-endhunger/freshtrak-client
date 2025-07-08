import { UseFormRegister, UseFormSetValue, UseFormGetValues, UseFormWatch, FieldErrors } from 'react-hook-form';

// Global type definitions
export interface AppState {
  event: EventState;
  addressSearch: SearchState;
  user: UserState;
  language: LanguageState;
}

export interface EventState {
  events: Event[];
  loading: boolean;
  error: string | null;
}

export interface SearchState {
  searchResults: any[];
  loading: boolean;
  error: string | null;
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LanguageState {
  language: string;
}

export interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  identification_code?: string;
  // Add other user properties as needed
}

// Unified Event interface based on the most comprehensive definition
export interface Event {
  id: number;
  eventId: number;
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
  name?: string; // For compatibility with some components
  exceptionNote: string;
  eventService: string;
  estimated_distance?: number;
  estimatedDistance?: number;
  eventDetails: string;
  seniorAge: number;
  adultAge: number;
}

// Alias for backward compatibility
export type EventData = Event;

export interface ReservedEvent {
  id: number;
  [key: string]: any;
}

// Component prop interfaces
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?:
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "light"
  | "dark";
}

export interface FormProps extends BaseComponentProps {
  onSubmit?: (data: any) => void;
  initialValues?: any;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Form data interfaces
export interface FormData {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  date_of_birth?: string;
  gender?: string;
  email?: string;
  password?: string;
  password_confirm?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  seniors_in_household?: number;
  adults_in_household?: number;
  children_in_household?: number;
  license_plate?: string;
  street?: string;
  distance?: string;
  serviceCat?: string;
  no_email?: boolean;
}

export interface SignInFormData {
  email: string;
  password: string;
}

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Location state interface
export interface LocationState {
  event_date?: string;
  event_slot?: {
    start_time: string;
    end_time: string;
  };
}

// Re-export React Hook Form types for consistency
export type { UseFormRegister, UseFormSetValue, UseFormGetValues, UseFormWatch, FieldErrors }; 