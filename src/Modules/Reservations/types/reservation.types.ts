/**
 * Reservation Types
 *
 * TypeScript interfaces for reservation-related data structures.
 * Updated to match the backend API response schema from RESERVATIONS_PRD.md
 *
 * ============================================================================
 * API INTEGRATION NOTES:
 * ============================================================================
 *
 * Endpoint: GET /reservations
 * - Returns all reservations for the authenticated user
 * - Response includes upcoming_count and past_count
 * - Status is derived on frontend from date (past = completed, future = confirmed)
 *
 * ============================================================================
 */

// ============================================================================
// BACKEND API RESPONSE TYPES (Raw API Schema)
// ============================================================================

/**
 * Backend API event object (nested in reservation)
 * Note: API may return string IDs and name may be missing
 */
export interface ReservationApiEvent {
	id: number | string;
	name?: string; // Optional - may not be provided by backend
}

/**
 * Backend API timeslot object (nested in reservation)
 * Times are in ISO 8601 format
 */
export interface ReservationApiTimeslot {
	start_time: string; // ISO: "2026-01-17T09:00:00.000Z"
	end_time: string; // ISO: "2026-01-17T15:00:00.000Z"
}

/**
 * Single reservation as returned by the backend API
 * This is the raw format before transformation
 * Note: date and timeslot can be null when data is incomplete
 */
export interface ReservationApiResponse {
	id: number | string;
	event: ReservationApiEvent;
	date: string | null; // Can be null
	timeslot: ReservationApiTimeslot | null; // Can be null
	public_event_slot_id?: number; // Additional field from backend
	public_event_date_id?: number; // Additional field from backend
	household_id: number;
	created_at: string; // ISO timestamp
	updated_at: string; // ISO timestamp
}

/**
 * List response from GET /reservations endpoint
 */
export interface ReservationsApiListResponse {
	reservations: ReservationApiResponse[];
	total: number;
	upcoming_count: number;
	past_count: number;
}

// ============================================================================
// FRONTEND DISPLAY TYPES (Transformed for UI)
// ============================================================================

/**
 * Reservation status
 * Only "completed" status is used - shown for past events
 * Derived from date: date < today → "completed"
 */
export type ReservationStatus = "completed";

/**
 * Event object for frontend display
 */
export interface ReservationEvent {
	id: number;
	name: string;
}

/**
 * Timeslot for frontend display
 * Times are formatted for display (e.g., "9:00am")
 */
export interface ReservationTimeslot {
	start_time: string; // Formatted: "9:00am"
	end_time: string; // Formatted: "3:00pm"
}

/**
 * Main reservation interface for frontend components
 * This is the transformed format used by UI components
 */
export interface Reservation {
	id: number;
	event: ReservationEvent;
	date: string; // "2026-01-17"
	timeslot: ReservationTimeslot;
	status?: ReservationStatus; // Optional - only "completed" for past events
	household_id: number;
	created_at: string;
	updated_at: string;
	/** Event slot ID for feedback form lookup */
	public_event_slot_id?: number;
	/** Event date ID for feedback form lookup */
	public_event_date_id?: number;
}

/**
 * Frontend response wrapper for reservations list
 */
export interface ReservationsResponse {
	reservations: Reservation[];
	total: number;
	upcoming_count: number;
	past_count: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Filter type for reservation lists
 * Used in UI to switch between views
 */
export type ReservationFilter = "upcoming" | "past" | "all";
