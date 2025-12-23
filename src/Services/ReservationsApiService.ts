/**
 * Reservations API Service
 *
 * Dedicated service for all reservation-related API operations.
 * Handles authentication, error handling, caching, and retry logic.
 *
 * Currently using mock data - will be switched to live API once backend is ready.
 *
 * ============================================================================
 * API DISCUSSION NOTES FOR BACKEND TEAM:
 * ============================================================================
 *
 * This service expects the following API endpoints:
 *
 * 1. GET /api/reservations
 *    - Returns all reservations for authenticated user
 *    - Query params: type=upcoming|past|all (optional, default=all)
 *    - Response: ReservationsResponse { reservations, total, upcoming_count, past_count }
 *
 * 2. GET /api/reservations/{id}
 *    - Returns single reservation by ID
 *    - Response: { reservation: Reservation }
 *
 * 3. POST /api/reservations/{id}/cancel
 *    - Cancels a reservation
 *    - Request body: { reason?: string } (optional cancellation reason)
 *    - Response: CancelReservationResponse { success, message, reservation }
 *    - Should update reservation status to "cancelled"
 *    - Should free up the event slot for other users
 *
 * 4. GET /api/reservations/history (optional separate endpoint)
 *    - Returns past reservations (completed + cancelled)
 *    - Query params: from_date, to_date, limit, offset
 *    - Could also be achieved via GET /api/reservations?type=past
 *
 * Authentication:
 * - All endpoints require Bearer token in Authorization header
 * - Token is retrieved from localStorage via StorageService
 *
 * Error Handling:
 * - 401: Token expired or invalid -> redirect to login
 * - 404: Reservation not found
 * - 400: Bad request (e.g., cancelling already cancelled reservation)
 * - 500: Server error -> show user-friendly message
 *
 * ============================================================================
 */

import { handleAuthError } from "../Utils/AuthErrorHandler";
import { StorageService } from "../Utils/StorageService";
import axios, { AxiosInstance } from "axios";
import {
    Reservation,
    ReservationsResponse,
    ReservationsApiConfig,
    CancelReservationResponse,
    CancelReservationRequest,
    ReservationFilter,
} from "../Modules/Reservations/types";
import {
    retryWithBackoff,
    createErrorContext,
    logError,
    DEFAULT_RETRY_CONFIG,
} from "../Modules/Households/utils/errorHandling";
import {
    mockReservationsResponse,
    mockUpcomingReservationsResponse,
    mockPastReservationsResponse,
    mockUpcomingReservations,
    mockPastReservations,
    createMockCancelResponse,
} from "../Modules/Reservations/mock/mockReservations";
import config from "../config";

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration for the Reservations API service
 *
 * API NOTE: These endpoints should match the backend API routes.
 * Base URL comes from environment config (REGISTRATION_API).
 */
const API_CONFIG: ReservationsApiConfig = {
    baseUrl: config.REGISTRATION_API || "",
    endpoints: {
        /**
         * GET /api/reservations
         *
         * API NOTE: Backend should support query parameters:
         * - type: "upcoming" | "past" | "all" (default: "all")
         * - from_date: ISO date string for history range start
         * - to_date: ISO date string for history range end
         * - limit: number of results (for pagination)
         * - offset: pagination offset
         */
        getReservations: "api/reservations",

        /**
         * GET /api/reservations/{id}
         *
         * API NOTE: Returns single reservation.
         * Should return 404 if reservation not found or doesn't belong to user.
         */
        getReservationById: (id: number) => `api/reservations/${id}`,

        /**
         * POST /api/reservations/{id}/cancel
         *
         * API NOTE: Cancels a reservation.
         * Request body can optionally include { reason: string } for analytics.
         * Should return 400 if:
         * - Reservation is already cancelled
         * - Reservation is completed (past event)
         * - Cancellation window has passed (if business rule exists)
         */
        cancelReservation: (id: number) => `api/reservations/${id}/cancel`,

        /**
         * GET /api/reservations/history (optional)
         *
         * API NOTE: Alternative endpoint for fetching history only.
         * If not implemented, use getReservations with type=past query param.
         */
        getReservationHistory: "api/reservations/history",
    },
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
};

/**
 * Enable mock mode
 *
 * IMPORTANT: Set to false when backend API is ready.
 * This flag switches between mock data and real API calls.
 */
const USE_MOCK_DATA = true;

/**
 * Cache configuration
 *
 * API NOTE: Caching reduces API calls for better performance.
 * Cache is invalidated when:
 * - User cancels a reservation
 * - TTL expires (5 minutes)
 * - User manually refreshes
 */
const CACHE_CONFIG = {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    keys: {
        allReservations: "reservations_all",
        upcomingReservations: "reservations_upcoming",
        pastReservations: "reservations_past",
        reservation: (id: number) => `reservation_${id}`,
    },
};

// ============================================================================
// CACHE IMPLEMENTATION
// ============================================================================

/**
 * Simple in-memory cache for API responses
 *
 * API NOTE: This is a client-side cache to reduce redundant API calls.
 * Consider implementing server-side caching as well for scalability.
 */
class SimpleCache {
    private cache = new Map<string, { data: any; timestamp: number }>();

    set(key: string, data: any): void {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    get(key: string): any | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Check if cache entry has expired
        if (Date.now() - entry.timestamp > CACHE_CONFIG.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    clear(): void {
        this.cache.clear();
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Invalidate all reservation-related cache entries
     * Called after mutations (cancel, etc.)
     */
    invalidateReservations(): void {
        this.delete(CACHE_CONFIG.keys.allReservations);
        this.delete(CACHE_CONFIG.keys.upcomingReservations);
        this.delete(CACHE_CONFIG.keys.pastReservations);
    }
}

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

/**
 * Main Reservations API Service class
 *
 * Provides methods for:
 * - Fetching all reservations
 * - Fetching upcoming reservations only
 * - Fetching past reservations (history)
 * - Fetching single reservation by ID
 * - Cancelling a reservation
 */
export class ReservationsApiService {
    private axiosInstance: AxiosInstance;
    private cache: SimpleCache;

    constructor() {
        this.cache = new SimpleCache();
        this.axiosInstance = this.createAxiosInstance();
        this.setupInterceptors();
    }

    // ========================================================================
    // PRIVATE SETUP METHODS
    // ========================================================================

    /**
     * Create configured Axios instance
     */
    private createAxiosInstance(): AxiosInstance {
        return axios.create({
            baseURL: API_CONFIG.baseUrl,
            timeout: API_CONFIG.timeout,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }

    /**
     * Setup request/response interceptors
     */
    private setupInterceptors(): void {
        // Request interceptor - Add authentication token
        this.axiosInstance.interceptors.request.use(
            (requestConfig) => {
                const token = this.getAuthToken();

                if (token) {
                    requestConfig.headers = requestConfig.headers || {};
                    requestConfig.headers.Authorization = `Bearer ${token}`;
                }
                return requestConfig;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - Handle errors
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                // Handle 401 errors - redirect to login
                handleAuthError(error, {
                    userType: "cognito",
                    redirectPath: "/login",
                });
                return Promise.reject(error);
            }
        );
    }

    /**
     * Get authentication token from storage
     *
     * API NOTE: Token should be a valid JWT from Cognito authentication.
     * Backend should validate this token on every request.
     */
    private getAuthToken(): string | null {
        return StorageService.getItem("token");
    }

    // ========================================================================
    // PUBLIC API METHODS
    // ========================================================================

    /**
     * Get all reservations for the current user
     *
     * API ENDPOINT: GET /api/reservations
     *
     * API NOTE: Returns both upcoming and past reservations.
     * Frontend filters them into separate lists for display.
     *
     * @param filter - Optional filter: "upcoming", "past", or "all" (default)
     * @returns Promise<ReservationsResponse>
     */
    async getReservations(
        filter: ReservationFilter = "all"
    ): Promise<ReservationsResponse> {
        // Return mock data if enabled
        if (USE_MOCK_DATA) {
            console.log(
                `📋 ReservationsApiService - Using mock data for getReservations (filter: ${filter})`
            );
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Return filtered mock data based on filter type
            switch (filter) {
                case "upcoming":
                    return mockUpcomingReservationsResponse;
                case "past":
                    return mockPastReservationsResponse;
                default:
                    return mockReservationsResponse;
            }
        }

        // Determine cache key based on filter
        const cacheKey =
            filter === "upcoming"
                ? CACHE_CONFIG.keys.upcomingReservations
                : filter === "past"
                ? CACHE_CONFIG.keys.pastReservations
                : CACHE_CONFIG.keys.allReservations;

        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached) {
            console.log(
                `📋 ReservationsApiService - Returning cached reservations (filter: ${filter})`
            );
            return cached;
        }

        const context = createErrorContext("getReservations");

        try {
            /**
             * API NOTE: Query parameter for filtering
             * Backend should support: GET /api/reservations?type=upcoming|past|all
             */
            const response = await retryWithBackoff(
                () =>
                    this.axiosInstance.get<ReservationsResponse>(
                        API_CONFIG.endpoints.getReservations,
                        {
                            params: filter !== "all" ? { type: filter } : {},
                        }
                    ),
                DEFAULT_RETRY_CONFIG
            );

            // Cache the response
            this.cache.set(cacheKey, response.data);

            return response.data;
        } catch (error: any) {
            logError(error, context);
            throw error;
        }
    }

    /**
     * Get upcoming reservations only
     *
     * Convenience method that calls getReservations with "upcoming" filter.
     * Returns reservations where status is "confirmed" or "pending" and date >= today.
     *
     * @returns Promise<ReservationsResponse>
     */
    async getUpcomingReservations(): Promise<ReservationsResponse> {
        return this.getReservations("upcoming");
    }

    /**
     * Get past reservations (history)
     *
     * API ENDPOINT: GET /api/reservations?type=past
     * OR: GET /api/reservations/history
     *
     * API NOTE: Returns reservations where:
     * - status is "completed" (user attended)
     * - status is "cancelled" (user cancelled)
     * - OR date < today
     *
     * History should include at least 2 weeks of past data.
     * Consider pagination for users with long history.
     *
     * @returns Promise<ReservationsResponse>
     */
    async getPastReservations(): Promise<ReservationsResponse> {
        return this.getReservations("past");
    }

    /**
     * Get a single reservation by ID
     *
     * API ENDPOINT: GET /api/reservations/{id}
     *
     * API NOTE: Should return 404 if:
     * - Reservation doesn't exist
     * - Reservation doesn't belong to authenticated user
     *
     * @param id - Reservation ID
     * @returns Promise<Reservation | null>
     */
    async getReservationById(id: number): Promise<Reservation | null> {
        // Return mock data if enabled
        if (USE_MOCK_DATA) {
            console.log(
                `📋 ReservationsApiService - Using mock data for getReservationById (id: ${id})`
            );
            await new Promise((resolve) => setTimeout(resolve, 300));

            // Search in all mock reservations
            const allReservations = [
                ...mockUpcomingReservations,
                ...mockPastReservations,
            ];
            const reservation = allReservations.find((r) => r.id === id);
            return reservation || null;
        }

        // Check cache first
        const cacheKey = CACHE_CONFIG.keys.reservation(id);
        const cached = this.cache.get(cacheKey);
        if (cached) {
            console.log(
                `📋 ReservationsApiService - Returning cached reservation (id: ${id})`
            );
            return cached;
        }

        const context = createErrorContext("getReservationById");

        try {
            const response = await retryWithBackoff(
                () =>
                    this.axiosInstance.get<{ reservation: Reservation }>(
                        API_CONFIG.endpoints.getReservationById(id)
                    ),
                DEFAULT_RETRY_CONFIG
            );

            // Cache the response
            this.cache.set(cacheKey, response.data.reservation);

            return response.data.reservation;
        } catch (error: any) {
            logError(error, context);
            throw error;
        }
    }

    /**
     * Cancel a reservation
     *
     * API ENDPOINT: POST /api/reservations/{id}/cancel
     *
     * API NOTE: This endpoint should:
     * 1. Update reservation status to "cancelled"
     * 2. Update the updated_at timestamp
     * 3. Optionally set cancelled_at timestamp
     * 4. Free up the event slot (increment available slots)
     * 5. Return the updated reservation object
     *
     * Business Rules to Consider:
     * - Can user cancel within X hours of event? (configurable?)
     * - Should we send cancellation confirmation email/SMS?
     * - Should cancelled reservations count toward any limits?
     *
     * @param id - Reservation ID to cancel
     * @param reason - Optional cancellation reason (for analytics)
     * @returns Promise<CancelReservationResponse>
     */
    async cancelReservation(
        id: number,
        reason?: string
    ): Promise<CancelReservationResponse> {
        // Mock cancellation
        if (USE_MOCK_DATA) {
            console.log(
                `📋 ReservationsApiService - Mock cancelling reservation (id: ${id})`
            );
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Find the reservation in mock data
            const reservation = mockUpcomingReservations.find(
                (r) => r.id === id
            );

            if (!reservation) {
                // Simulate 404 error
                return {
                    success: false,
                    message: "Reservation not found",
                    reservation: null as any,
                };
            }

            if (reservation.status === "cancelled") {
                // Simulate already cancelled error
                return {
                    success: false,
                    message: "Reservation is already cancelled",
                    reservation: reservation,
                };
            }

            // Clear cache to force refresh
            this.cache.invalidateReservations();
            this.cache.delete(CACHE_CONFIG.keys.reservation(id));

            // Return mock cancel response
            return createMockCancelResponse(reservation);
        }

        const context = createErrorContext("cancelReservation");

        try {
            /**
             * API NOTE: Request body structure
             * {
             *   reason?: string  // Optional cancellation reason
             * }
             */
            const requestBody: CancelReservationRequest = {};
            if (reason) {
                requestBody.reason = reason;
            }

            const response = await retryWithBackoff(
                () =>
                    this.axiosInstance.post<CancelReservationResponse>(
                        API_CONFIG.endpoints.cancelReservation(id),
                        requestBody
                    ),
                DEFAULT_RETRY_CONFIG
            );

            // Invalidate cache after successful cancellation
            this.cache.invalidateReservations();
            this.cache.delete(CACHE_CONFIG.keys.reservation(id));

            console.log(
                `📋 ReservationsApiService - Successfully cancelled reservation (id: ${id})`
            );

            return response.data;
        } catch (error: any) {
            logError(error, context);

            /**
             * API NOTE: Handle specific error cases
             * - 404: Reservation not found
             * - 400: Already cancelled or past event
             * - 403: Not authorized to cancel this reservation
             */
            if (error.response?.status === 404) {
                return {
                    success: false,
                    message: "Reservation not found",
                    reservation: null as any,
                };
            }

            if (error.response?.status === 400) {
                return {
                    success: false,
                    message:
                        error.response?.data?.message ||
                        "Cannot cancel this reservation",
                    reservation: null as any,
                };
            }

            throw error;
        }
    }

    // ========================================================================
    // CACHE MANAGEMENT
    // ========================================================================

    /**
     * Clear all cached data
     *
     * Call this when:
     * - User logs out
     * - User manually refreshes
     * - Data inconsistency is detected
     */
    clearCache(): void {
        console.log("📋 ReservationsApiService - Clearing cache");
        this.cache.clear();
    }

    /**
     * Invalidate reservation-related cache
     *
     * Call this after mutations to ensure fresh data on next fetch.
     */
    invalidateCache(): void {
        console.log("📋 ReservationsApiService - Invalidating reservations cache");
        this.cache.invalidateReservations();
    }
}
