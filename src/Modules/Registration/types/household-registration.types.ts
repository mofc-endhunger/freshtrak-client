// Household Registration Confirmation Modal Types
// This file contains TypeScript interfaces for the household registration confirmation modal feature

import { UsersMeResponse } from '../../Households/types/api.types';

// Event slot interface for timeslot selection
export interface EventSlot {
  event_slot_id: string;
  start_time: string;
  end_time: string;
  open_slots: number;
}

// Registration response interface
export interface RegistrationResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// Household confirmation modal props
export interface HouseholdConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onReview: () => void;
  householdData: UsersMeResponse | null;
  isLoading: boolean;
  selectedSlot: EventSlot | null;
  error?: string;
}

// Household information display props
export interface HouseholdInfoDisplayProps {
  householdData: UsersMeResponse;
  className?: string;
}

// Household registration service interface
export interface HouseholdRegistrationService {
  registerWithHousehold(
    timeslotData: {
      eventId: string;
      eventDateId: string;
      eventSlotId: string;
    }
  ): Promise<RegistrationResponse>;

  checkHouseholdCompleteness(
    householdData: UsersMeResponse
  ): boolean;
}

// Error handling types
export interface HouseholdRegistrationError {
  type: 'NETWORK_ERROR' | 'API_ERROR' | 'VALIDATION_ERROR' | 'TIMEOUT_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  code?: string;
  retryable: boolean;
}

// Modal state interface
export interface HouseholdModalState {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  householdData: UsersMeResponse | null;
  selectedSlot: EventSlot | null;
}
