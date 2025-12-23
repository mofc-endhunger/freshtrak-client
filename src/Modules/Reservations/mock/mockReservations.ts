/**
 * Mock Reservations Data
 *
 * This mock data is used for development and testing purposes.
 * It will be replaced with actual API data once the backend is ready.
 *
 * ============================================================================
 * API DISCUSSION NOTES FOR BACKEND TEAM:
 * ============================================================================
 *
 * This mock data simulates the expected API response structure.
 * When implementing the real API, please ensure:
 *
 * 1. Upcoming reservations: status = "confirmed" | "pending", date >= today
 * 2. Past reservations: status = "completed" | "cancelled", OR date < today
 * 3. History should include at least 2 weeks of past data
 * 4. All timestamps should be in ISO 8601 format
 * 5. The response should include counts for filtering/pagination
 *
 * Sample scenarios covered in mock data:
 * - Upcoming confirmed reservations (user can cancel these)
 * - Past completed reservations (user attended)
 * - Past cancelled reservations (user cancelled before event)
 * - Different event types (in-person, drive-through)
 * - Events with and without QR codes
 *
 * ============================================================================
 */

import {
    Reservation,
    ReservationsResponse,
    CancelReservationResponse,
} from "../types/reservation.types";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate dates relative to today
 * Positive numbers = future dates, Negative numbers = past dates
 */
const getRelativeDate = (daysFromNow: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split("T")[0];
};

/**
 * Generate ISO timestamp relative to now
 */
const getRelativeTimestamp = (daysFromNow: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString();
};

// ============================================================================
// MOCK UPCOMING RESERVATIONS
// ============================================================================

/**
 * Upcoming reservations - these are active and can be cancelled
 *
 * API NOTE: These should be returned when querying for upcoming reservations
 * Criteria: (status = "confirmed" OR status = "pending") AND date >= today
 */
export const mockUpcomingReservations: Reservation[] = [
    {
        id: 1,
        confirmation_code: "FLP-2024-001",
        event: {
            id: 101,
            name: "Family Love Pantry",
            location: {
                address_line_1: "Mid-Ohio Market at Heart",
                city: "Columbus",
                state: "OH",
                zip_code: "43215",
            },
            organization_name: "Mid-Ohio Food Collective",
        },
        event_date_id: "12345",
        date: getRelativeDate(3), // 3 days from now
        timeslot: {
            event_slot_id: 1001,
            start_time: "9:00am",
            end_time: "3:00pm",
        },
        event_type: "in-person",
        status: "confirmed",
        qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=FLP-2024-001",
        check_in_code: "FLP-2024-001",
        household_id: 1,
        created_at: getRelativeTimestamp(-5), // Created 5 days ago
        updated_at: getRelativeTimestamp(-5),
    },
    {
        id: 2,
        confirmation_code: "FLP-2024-002",
        event: {
            id: 102,
            name: "Community Food Drive",
            location: {
                address_line_1: "First Presbyterian Church",
                address_line_2: "Fellowship Hall",
                city: "Columbus",
                state: "OH",
                zip_code: "43201",
            },
            organization_name: "Neighborhood Services",
        },
        event_date_id: "12346",
        date: getRelativeDate(7), // 1 week from now
        timeslot: {
            event_slot_id: 1002,
            start_time: "10:00am",
            end_time: "2:00pm",
        },
        event_type: "drive-through",
        status: "confirmed",
        // No QR code - this foodbank doesn't support QR
        qr_code_url: null,
        check_in_code: "FLP-2024-002",
        household_id: 1,
        created_at: getRelativeTimestamp(-3), // Created 3 days ago
        updated_at: getRelativeTimestamp(-3),
    },
];

// ============================================================================
// MOCK PAST RESERVATIONS (HISTORY)
// ============================================================================

/**
 * Past reservations - these appear in history and cannot be cancelled
 *
 * API NOTE: These should be returned when querying for past/history reservations
 * Criteria: status = "completed" OR status = "cancelled" OR date < today
 *
 * History should include:
 * - Completed events (user attended)
 * - Cancelled events (user cancelled before the event)
 * - Retention period: at least 2 weeks, up to 3 months recommended
 */
export const mockPastReservations: Reservation[] = [
    // Completed reservation - user attended this event
    {
        id: 3,
        confirmation_code: "FLP-2024-003",
        event: {
            id: 103,
            name: "Weekly Food Distribution",
            location: {
                address_line_1: "St. Mary's Community Center",
                city: "Columbus",
                state: "OH",
                zip_code: "43205",
            },
            organization_name: "St. Mary's Outreach",
        },
        event_date_id: "12340",
        date: getRelativeDate(-3), // 3 days ago
        timeslot: {
            event_slot_id: 1003,
            start_time: "11:00am",
            end_time: "1:00pm",
        },
        event_type: "in-person",
        status: "completed", // User attended
        qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=FLP-2024-003",
        check_in_code: "FLP-2024-003",
        household_id: 1,
        created_at: getRelativeTimestamp(-10), // Created 10 days ago
        updated_at: getRelativeTimestamp(-3),  // Updated when marked complete
    },
    // Cancelled reservation - user cancelled this
    {
        id: 4,
        confirmation_code: "FLP-2024-004",
        event: {
            id: 104,
            name: "Emergency Food Assistance",
            location: {
                address_line_1: "Salvation Army Center",
                city: "Columbus",
                state: "OH",
                zip_code: "43215",
            },
            organization_name: "Salvation Army Columbus",
        },
        event_date_id: "12341",
        date: getRelativeDate(-5), // 5 days ago (was scheduled for this date)
        timeslot: {
            event_slot_id: 1004,
            start_time: "9:00am",
            end_time: "12:00pm",
        },
        event_type: "in-person",
        status: "cancelled", // User cancelled
        qr_code_url: null,
        check_in_code: "FLP-2024-004",
        household_id: 1,
        created_at: getRelativeTimestamp(-12), // Created 12 days ago
        updated_at: getRelativeTimestamp(-7),  // Updated when cancelled
        // API NOTE: Consider adding cancelled_at and cancellation_reason fields
    },
    // Another completed reservation - older
    {
        id: 5,
        confirmation_code: "FLP-2024-005",
        event: {
            id: 105,
            name: "Family Love Pantry",
            location: {
                address_line_1: "Mid-Ohio Market at Heart",
                city: "Columbus",
                state: "OH",
                zip_code: "43215",
            },
            organization_name: "Mid-Ohio Food Collective",
        },
        event_date_id: "12342",
        date: getRelativeDate(-10), // 10 days ago
        timeslot: {
            event_slot_id: 1005,
            start_time: "9:00am",
            end_time: "3:00pm",
        },
        event_type: "in-person",
        status: "completed",
        qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=FLP-2024-005",
        check_in_code: "FLP-2024-005",
        household_id: 1,
        created_at: getRelativeTimestamp(-17),
        updated_at: getRelativeTimestamp(-10),
    },
];

// ============================================================================
// COMBINED MOCK DATA
// ============================================================================

/**
 * All reservations combined (upcoming + past)
 *
 * API NOTE: When returning all reservations, they should be sorted by date.
 * Upcoming first (ascending by date), then past (descending by date).
 */
export const mockReservations: Reservation[] = [
    ...mockUpcomingReservations,
    ...mockPastReservations,
];

// ============================================================================
// MOCK API RESPONSES
// ============================================================================

/**
 * Mock response for GET /api/reservations
 *
 * API NOTE: This is the expected response structure.
 * Backend should calculate counts based on reservation status and dates.
 */
export const mockReservationsResponse: ReservationsResponse = {
    reservations: mockReservations,
    total: mockReservations.length,
    upcoming_count: mockUpcomingReservations.length,
    past_count: mockPastReservations.length,
};

/**
 * Mock response for upcoming reservations only
 *
 * API NOTE: Response when querying GET /api/reservations?type=upcoming
 */
export const mockUpcomingReservationsResponse: ReservationsResponse = {
    reservations: mockUpcomingReservations,
    total: mockUpcomingReservations.length,
    upcoming_count: mockUpcomingReservations.length,
    past_count: 0,
};

/**
 * Mock response for past reservations only (history)
 *
 * API NOTE: Response when querying GET /api/reservations?type=past
 * or GET /api/reservations/history
 */
export const mockPastReservationsResponse: ReservationsResponse = {
    reservations: mockPastReservations,
    total: mockPastReservations.length,
    upcoming_count: 0,
    past_count: mockPastReservations.length,
};

/**
 * Empty state mock - for testing empty states
 */
export const mockEmptyReservationsResponse: ReservationsResponse = {
    reservations: [],
    total: 0,
    upcoming_count: 0,
    past_count: 0,
};

// ============================================================================
// MOCK CANCEL RESPONSE
// ============================================================================

/**
 * Mock response for POST /api/reservations/{id}/cancel
 *
 * API NOTE: This simulates a successful cancellation response.
 * The returned reservation should have status = "cancelled" and updated timestamp.
 *
 * @param reservation - The reservation to cancel
 * @returns Mock cancel response with updated reservation
 */
export const createMockCancelResponse = (
    reservation: Reservation
): CancelReservationResponse => ({
    success: true,
    message: "Reservation cancelled successfully",
    reservation: {
        ...reservation,
        status: "cancelled",
        updated_at: new Date().toISOString(),
        // API NOTE: Consider adding cancelled_at timestamp here
    },
});

/**
 * Mock error response for cancel failures
 *
 * API NOTE: Possible error scenarios:
 * - Reservation not found (404)
 * - Reservation already cancelled (400)
 * - Cannot cancel past events (400)
 * - Cancellation window has passed (400) - e.g., can't cancel within 2 hours
 */
export const mockCancelErrorResponse = {
    success: false,
    message: "Unable to cancel reservation",
    error: "CANCELLATION_NOT_ALLOWED",
};
