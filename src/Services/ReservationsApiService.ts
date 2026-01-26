/**
 * Reservations API Service
 *
 * Dedicated service for all reservation-related API operations.
 * Handles authentication, error handling, caching, and retry logic.
 *
 * ============================================================================
 * API INTEGRATION:
 * ============================================================================
 *
 * Endpoint: GET /reservations
 * - Returns all reservations for authenticated user
 * - Response is transformed from API format to frontend display format
 * - Status is derived from date (past = completed, future = confirmed)
 *
 * Authentication:
 * - All endpoints require Bearer token in Authorization header
 * - Token is retrieved from localStorage via StorageService
 *
 * ============================================================================
 */

import { handleAuthError } from "../Utils/AuthErrorHandler";
import { StorageService } from "../Utils/StorageService";
import axios, { AxiosInstance } from "axios";
import {
    Reservation,
    ReservationsResponse,
    ReservationApiResponse,
    ReservationsApiListResponse,
    ReservationFilter,
    ReservationStatus,
} from "../Modules/Reservations/types";
import {
    retryWithBackoff,
    createErrorContext,
    logError,
    DEFAULT_RETRY_CONFIG,
} from "../Modules/Households/utils/errorHandling";
import config from "../config";

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Toggle to enable/disable mock mode for testing
 * Set to true to use mock data, false to use real API
 */
const USE_MOCK_DATA = true;

/**
 * Configuration for the Reservations API service
 */
const API_CONFIG = {
    baseUrl: config.REGISTRATION_API || "",
    endpoints: {
        getReservations: "api/reservations",
    },
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
};

// ============================================================================
// MOCK DATA FOR TESTING
// ============================================================================

/**
 * Mock past reservations for testing feedback functionality
 */
const MOCK_PAST_RESERVATIONS: Reservation[] = [
    {
        id: 1001,
        event: {
            id: 2001,
            name: "Community Food Pantry - Downtown",
        },
        date: "2026-01-15",
        timeslot: {
            start_time: "10:00am",
            end_time: "12:00pm",
        },
        status: "completed",
        household_id: 100,
        created_at: "2026-01-10T10:00:00.000Z",
        updated_at: "2026-01-10T10:00:00.000Z",
    },
    {
        id: 1002,
        event: {
            id: 2002,
            name: "Fresh Produce Distribution",
        },
        date: "2026-01-10",
        timeslot: {
            start_time: "9:00am",
            end_time: "11:00am",
        },
        status: "completed",
        household_id: 100,
        created_at: "2026-01-05T10:00:00.000Z",
        updated_at: "2026-01-05T10:00:00.000Z",
    },
    {
        id: 1003,
        event: {
            id: 2003,
            name: "Holiday Food Drive",
        },
        date: "2026-01-05",
        timeslot: {
            start_time: "2:00pm",
            end_time: "4:00pm",
        },
        status: "completed",
        household_id: 100,
        created_at: "2026-01-01T10:00:00.000Z",
        updated_at: "2026-01-01T10:00:00.000Z",
    },
];

/**
 * Mock upcoming reservations for testing
 */
const MOCK_UPCOMING_RESERVATIONS: Reservation[] = [
    {
        id: 1004,
        event: {
            id: 2004,
            name: "Weekly Food Distribution",
        },
        date: "2026-01-30",
        timeslot: {
            start_time: "11:00am",
            end_time: "1:00pm",
        },
        status: undefined,
        household_id: 100,
        created_at: "2026-01-20T10:00:00.000Z",
        updated_at: "2026-01-20T10:00:00.000Z",
    },
];


/**
 * Cache configuration
 */
const CACHE_CONFIG = {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    keys: {
        allReservations: "reservations_all",
        upcomingReservations: "reservations_upcoming",
        pastReservations: "reservations_past",
    },
};

// ============================================================================
// TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transform time string to display format
 * Handles both ISO timestamps and simple time strings:
 * - ISO: "2026-01-17T09:00:00.000Z" → "9:00am"
 * - Simple: "12:00:00" → "12:00pm"
 *
 * @param timeString - ISO 8601 timestamp or simple time string (HH:mm:ss)
 * @returns Formatted time string (e.g., "9:00am")
 */
function formatTimeFromISO(timeString: string): string {
    let date: Date;

    // Check if it's a simple time string (HH:mm:ss or HH:mm)
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeString)) {
        // Prepend a dummy date to make it parseable
        date = new Date(`1970-01-01T${timeString}`);
    } else {
        // Assume ISO format
        date = new Date(timeString);
    }

    // Check for invalid date
    if (isNaN(date.getTime())) {
        return "N/A";
    }

    return date
        .toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })
        .toLowerCase()
        .replace(" ", ""); // "9:00 am" → "9:00am"
}

/**
 * Derive reservation status from date
 * Only returns "completed" for past events (date < today)
 * Returns undefined for upcoming events or invalid dates
 *
 * @param dateString - Date string in "YYYY-MM-DD" format or null
 * @returns "completed" for past events, undefined otherwise
 */
function deriveStatus(dateString: string | null): ReservationStatus | undefined {
    if (!dateString) {
        return undefined; // No date - no status
    }
    const eventDate = new Date(dateString);
    if (isNaN(eventDate.getTime())) {
        return undefined; // Invalid date - no status
    }
    const today = new Date();
    // Set to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today ? "completed" : undefined;
}

/**
 * Transform a single API reservation to frontend format
 * Handles nullable fields gracefully with "N/A" placeholders
 *
 * @param apiReservation - Raw API response object
 * @returns Reservation for frontend display
 */
function transformReservation(apiReservation: ReservationApiResponse): Reservation {
    // Handle nullable timeslot
    const timeslot = apiReservation.timeslot
        ? {
            start_time: formatTimeFromISO(apiReservation.timeslot.start_time),
            end_time: formatTimeFromISO(apiReservation.timeslot.end_time),
        }
        : {
            start_time: "N/A",
            end_time: "N/A",
        };

    return {
        id: Number(apiReservation.id),
        event: {
            id: Number(apiReservation.event?.id ?? 0),
            name: apiReservation.event?.name ?? "Event details unavailable",
        },
        date: apiReservation.date ?? "N/A",
        timeslot,
        status: deriveStatus(apiReservation.date),
        household_id: apiReservation.household_id,
        created_at: apiReservation.created_at,
        updated_at: apiReservation.updated_at,
    };
}

/**
 * Transform API list response to frontend format
 *
 * @param apiResponse - Raw API list response
 * @returns ReservationsResponse for frontend
 */
function transformReservationsResponse(
    apiResponse: ReservationsApiListResponse
): ReservationsResponse {
    return {
        reservations: apiResponse.reservations.map(transformReservation),
        total: apiResponse.total,
        upcoming_count: apiResponse.upcoming_count,
        past_count: apiResponse.past_count,
    };
}

// ============================================================================
// CACHE IMPLEMENTATION
// ============================================================================

/**
 * Simple in-memory cache for API responses
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
     * Uses getUserToken() to check both Cognito and direct token storage
     */
    private getAuthToken(): string | null {
        return StorageService.getUserToken();
    }

    // ========================================================================
    // PUBLIC API METHODS
    // ========================================================================

    /**
     * Get all reservations for the current user
     *
     * API ENDPOINT: GET /reservations
     *
     * @param filter - Optional filter: "upcoming", "past", or "all" (default)
     * @returns Promise<ReservationsResponse>
     */
    async getReservations(
        filter: ReservationFilter = "all"
    ): Promise<ReservationsResponse> {
        // Use mock data for testing
        if (USE_MOCK_DATA) {
            return this.getMockReservations(filter);
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
            return cached;
        }

        const context = createErrorContext("getReservations");

        try {
            // Call real API endpoint
            const response = await retryWithBackoff(
                () =>
                    this.axiosInstance.get<ReservationsApiListResponse>(
                        API_CONFIG.endpoints.getReservations,
                        {
                            params: filter !== "all" ? { type: filter } : {},
                        }
                    ),
                DEFAULT_RETRY_CONFIG
            );

            // Transform API response to frontend format
            // Trust backend's filter - no additional client-side filtering needed
            const transformedData = transformReservationsResponse(response.data);

            // Cache the response
            this.cache.set(cacheKey, transformedData);

            return transformedData;
        } catch (error: any) {
            logError(error, context);
            throw error;
        }
    }

    /**
     * Get mock reservations for testing
     */
    private getMockReservations(filter: ReservationFilter): ReservationsResponse {
        let reservations: Reservation[];
        let upcomingCount = MOCK_UPCOMING_RESERVATIONS.length;
        let pastCount = MOCK_PAST_RESERVATIONS.length;

        switch (filter) {
            case "upcoming":
                reservations = MOCK_UPCOMING_RESERVATIONS;
                break;
            case "past":
                reservations = MOCK_PAST_RESERVATIONS;
                break;
            default:
                reservations = [...MOCK_UPCOMING_RESERVATIONS, ...MOCK_PAST_RESERVATIONS];
        }

        return {
            reservations,
            total: reservations.length,
            upcoming_count: upcomingCount,
            past_count: pastCount,
        };
    }

    /**
     * Get upcoming reservations only
     *
     * Convenience method that calls getReservations with "upcoming" filter.
     * Returns reservations where date >= today.
     *
     * @returns Promise<ReservationsResponse>
     */
    async getUpcomingReservations(): Promise<ReservationsResponse> {
        return this.getReservations("upcoming");
    }

    /**
     * Get past reservations (history)
     *
     * Convenience method that calls getReservations with "past" filter.
     * Returns reservations where date < today.
     *
     * @returns Promise<ReservationsResponse>
     */
    async getPastReservations(): Promise<ReservationsResponse> {
        return this.getReservations("past");
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
