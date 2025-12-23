/**
 * Reservation Types
 *
 * TypeScript interfaces for reservation-related data structures.
 * These types are designed to be API-ready for future backend integration.
 *
 * ============================================================================
 * API DISCUSSION NOTES FOR BACKEND TEAM:
 * ============================================================================
 *
 * 1. GET /api/reservations
 *    - Should return ReservationsResponse with both upcoming and past reservations
 *    - Upcoming: status = "confirmed" | "pending", date >= today
 *    - Past: status = "completed" | "cancelled", OR date < today
 *    - Consider: separate endpoints vs single endpoint with query params?
 *      Option A: GET /api/reservations?type=upcoming|past|all
 *      Option B: GET /api/reservations/upcoming and GET /api/reservations/history
 *    - History should go back at least 2 weeks (configurable?)
 *
 * 2. POST /api/reservations/{id}/cancel
 *    - Should update reservation status to "cancelled"
 *    - Should return the updated reservation object
 *    - Should free up the slot for other users
 *    - Consider: Should we track cancellation reason? (optional field)
 *    - Consider: Should we track cancelled_at timestamp?
 *    - Consider: Any restrictions on cancellation? (e.g., can't cancel within 2 hours)
 *
 * 3. Reservation Status Flow:
 *    - pending -> confirmed (after processing)
 *    - confirmed -> completed (after event date passes and user checked in)
 *    - confirmed -> cancelled (user cancels)
 *    - pending -> cancelled (user cancels before confirmation)
 *
 * 4. Questions for Backend:
 *    - How do we determine "completed" status? Auto-update after event date?
 *    - Do we track check-in status separately from reservation status?
 *    - Should cancelled reservations be soft-deleted or kept in history?
 *    - What's the retention period for past reservations?
 *
 * ============================================================================
 */

// ============================================================================
// ENUMS AND BASIC TYPES
// ============================================================================

/**
 * Reservation status enum
 *
 * API NOTE: Backend should return one of these status values.
 * Status transitions:
 *   - "pending" -> "confirmed" -> "completed"
 *   - "pending" -> "cancelled"
 *   - "confirmed" -> "cancelled"
 */
export type ReservationStatus =
    | "confirmed"  // Reservation is active and confirmed
    | "pending"    // Reservation is awaiting confirmation
    | "cancelled"  // User cancelled the reservation
    | "completed"; // Event has passed and user attended (or event date passed)

/**
 * Event type enum
 *
 * API NOTE: This should match the event_type values from the events API.
 * Used for visual badges and filtering.
 */
export type EventType = "in-person" | "drive-through" | "delivery" | "virtual";

// ============================================================================
// NESTED OBJECT INTERFACES
// ============================================================================

/**
 * Reservation event/location information
 *
 * API NOTE: This is a denormalized copy of event data stored with the reservation.
 * This allows displaying reservation details without fetching the full event.
 * Backend should populate this when creating the reservation.
 */
export interface ReservationEvent {
    id: number;
    name: string;
    location: {
        address_line_1: string;
        address_line_2?: string;
        city: string;
        state: string;
        zip_code: string;
    };
    organization_name?: string;
}

/**
 * Timeslot information from selected event slot
 *
 * API NOTE: This should contain the timeslot data from when the user registered.
 * Should match the event_slot they selected during registration.
 * The event_slot_id links back to the original slot for reference.
 */
export interface ReservationTimeslot {
    event_slot_id: number;
    start_time: string; // e.g., "9:00am" - format should be consistent with events API
    end_time: string;   // e.g., "3:00pm"
}

// ============================================================================
// MAIN RESERVATION INTERFACE
// ============================================================================

/**
 * Main reservation interface
 *
 * API NOTE: This is the core reservation object returned by the API.
 * All fields should be populated by the backend when fetching reservations.
 */
export interface Reservation {
    id: number;                           // Unique reservation ID (primary key)
    confirmation_code: string;            // Human-readable confirmation code for check-in
    event: ReservationEvent;              // Denormalized event data (see ReservationEvent)
    event_date_id: string;                // Reference to the event_date record
    date: string;                         // ISO date string (YYYY-MM-DD) of the event
    timeslot: ReservationTimeslot;        // Selected timeslot data (see ReservationTimeslot)
    event_type: EventType;                // Type of event for badge display
    status: ReservationStatus;            // Current reservation status

    // QR code support - some foodbanks may not support QR codes
    // API NOTE: If QR codes are supported, backend generates and returns URL
    qr_code_url?: string | null;

    // Unique ID for check-in (fallback when QR not available)
    // API NOTE: This could be same as confirmation_code or a separate value
    check_in_code: string;

    household_id: number;                 // Reference to the household record
    created_at: string;                   // ISO timestamp when reservation was created
    updated_at: string;                   // ISO timestamp when reservation was last modified

    // API NOTE: Consider adding these fields for cancellation tracking:
    // cancelled_at?: string;             // ISO timestamp when cancelled (if status = cancelled)
    // cancellation_reason?: string;      // Optional reason for cancellation
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

/**
 * API Response wrapper for reservations list
 *
 * API NOTE: This is the expected response format from GET /api/reservations
 *
 * Example response:
 * {
 *   "reservations": [...],           // Array of Reservation objects
 *   "total": 5,                      // Total count of all reservations
 *   "upcoming_count": 2,             // Count of upcoming (confirmed/pending) reservations
 *   "past_count": 3                  // Count of past (completed/cancelled) reservations
 * }
 *
 * QUESTION FOR BACKEND: Should we include pagination?
 * If history grows large, we may need:
 *   "page": 1,
 *   "per_page": 20,
 *   "total_pages": 3
 */
export interface ReservationsResponse {
    reservations: Reservation[];
    total: number;
    upcoming_count: number;
    past_count: number;
}

/**
 * Single reservation response
 *
 * API NOTE: Response format for GET /api/reservations/{id}
 * and POST /api/reservations/{id}/cancel
 */
export interface ReservationResponse {
    reservation: Reservation;
}

/**
 * Cancel reservation request
 *
 * API NOTE: Request body for POST /api/reservations/{id}/cancel
 * Currently no required fields, but could include optional cancellation reason.
 *
 * QUESTION FOR BACKEND: Should we require/allow a cancellation reason?
 * This could help foodbanks understand why people cancel.
 */
export interface CancelReservationRequest {
    // Optional: reason for cancellation (for analytics/feedback)
    reason?: string;
}

/**
 * Cancel reservation response
 *
 * API NOTE: Response from POST /api/reservations/{id}/cancel
 * Should return the updated reservation with status = "cancelled"
 */
export interface CancelReservationResponse {
    success: boolean;
    message: string;
    reservation: Reservation;  // Updated reservation with status = "cancelled"
}

/**
 * Past reservations query parameters
 *
 * API NOTE: Query params for fetching past reservations
 * GET /api/reservations?type=past&from_date=2024-01-01&to_date=2024-01-14
 *
 * QUESTION FOR BACKEND: What's the default date range for history?
 * Suggestion: Default to last 2 weeks, allow custom range up to 3 months
 */
export interface PastReservationsParams {
    from_date?: string;  // ISO date string - start of date range
    to_date?: string;    // ISO date string - end of date range
    limit?: number;      // Max number of results (for pagination)
    offset?: number;     // Offset for pagination
}

// ============================================================================
// API CONFIGURATION
// ============================================================================

/**
 * API configuration for reservations service
 *
 * API NOTE: These endpoints should be implemented by the backend.
 * Base URL comes from environment config.
 */
export interface ReservationsApiConfig {
    baseUrl: string;
    endpoints: {
        /**
         * GET /api/reservations
         * Returns all reservations for the authenticated user
         * Query params: type=upcoming|past|all, from_date, to_date
         */
        getReservations: string;

        /**
         * GET /api/reservations/{id}
         * Returns a single reservation by ID
         */
        getReservationById: (id: number) => string;

        /**
         * POST /api/reservations/{id}/cancel
         * Cancels a reservation
         * Request body: CancelReservationRequest (optional reason)
         * Response: CancelReservationResponse
         */
        cancelReservation: (id: number) => string;

        /**
         * GET /api/reservations/history
         * Returns past reservations (completed + cancelled)
         * Query params: from_date, to_date, limit, offset
         *
         * API NOTE: This could be a separate endpoint or combined with getReservations
         * using query parameters. Separate endpoint is cleaner for caching.
         */
        getReservationHistory?: string;
    };
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Filter type for reservation lists
 * Used in UI to switch between views
 */
export type ReservationFilter = "upcoming" | "past" | "all";

/**
 * Sort options for reservation lists
 *
 * API NOTE: If sorting is needed, backend should support these sort fields
 * Query param: sort=date_asc|date_desc|created_at_desc
 */
export type ReservationSortOption = "date_asc" | "date_desc" | "created_at_desc";
