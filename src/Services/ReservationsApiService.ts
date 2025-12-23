/**
 * Reservations API Service
 *
 * Dedicated service for all reservation-related API operations.
 * Handles authentication, error handling, caching, and retry logic.
 *
 * Currently using mock data - will be switched to live API once backend is ready.
 */

import { handleAuthError } from "../Utils/AuthErrorHandler";
import { StorageService } from "../Utils/StorageService";
import axios, { AxiosInstance } from "axios";
import {
    Reservation,
    ReservationsResponse,
    ReservationsApiConfig,
} from "../Modules/Reservations/types";
import {
    retryWithBackoff,
    createErrorContext,
    logError,
    DEFAULT_RETRY_CONFIG,
} from "../Modules/Households/utils/errorHandling";
import {
    mockReservationsResponse,
} from "../Modules/Reservations/mock/mockReservations";
import config from "../config";

/**
 * Configuration for the Reservations API service
 */
const API_CONFIG: ReservationsApiConfig = {
    baseUrl: config.REGISTRATION_API || "",
    endpoints: {
        getReservations: "api/reservations",
        getReservationById: (id: number) => `api/reservations/${id}`,
        cancelReservation: (id: number) => `api/reservations/${id}/cancel`,
    },
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
};

// Enable mock mode - set to false when API is ready
const USE_MOCK_DATA = true;

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    keys: {
        reservations: "reservations_data",
        reservation: (id: number) => `reservation_${id}`,
    },
};

/**
 * Simple in-memory cache
 */
class SimpleCache {
    private cache = new Map<string, { data: any; timestamp: number }>();

    set(key: string, data: any): void {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    get(key: string): any | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

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
}

/**
 * Main Reservations API Service class
 */
export class ReservationsApiService {
    private axiosInstance: AxiosInstance;
    private cache: SimpleCache;

    constructor() {
        this.cache = new SimpleCache();
        this.axiosInstance = this.createAxiosInstance();
        this.setupInterceptors();
    }

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
            (config) => {
                const token = this.getAuthToken();

                if (token) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - Handle errors
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                // Handle 401 errors
                handleAuthError(error, {
                    userType: "cognito",
                    redirectPath: "/login",
                });
                return Promise.reject(error);
            }
        );
    }

    /**
     * Get authentication token
     */
    private getAuthToken(): string | null {
        return StorageService.getItem("token");
    }

    /**
     * Get all reservations for the current user
     */
    async getReservations(): Promise<ReservationsResponse> {
        // Return mock data if enabled
        if (USE_MOCK_DATA) {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500));
            return mockReservationsResponse;
        }

        // Check cache first
        const cached = this.cache.get(CACHE_CONFIG.keys.reservations);
        if (cached) {
            return cached;
        }

        const context = createErrorContext("getReservations");

        try {
            const response = await retryWithBackoff(
                () =>
                    this.axiosInstance.get<ReservationsResponse>(
                        API_CONFIG.endpoints.getReservations
                    ),
                DEFAULT_RETRY_CONFIG
            );

            // Cache the response
            this.cache.set(CACHE_CONFIG.keys.reservations, response.data);

            return response.data;
        } catch (error: any) {
            logError(error, context);
            throw error;
        }
    }

    /**
     * Get a single reservation by ID
     */
    async getReservationById(id: number): Promise<Reservation | null> {
        // Return mock data if enabled
        if (USE_MOCK_DATA) {
            await new Promise((resolve) => setTimeout(resolve, 300));
            const reservation = mockReservationsResponse.reservations.find(
                (r) => r.id === id
            );
            return reservation || null;
        }

        // Check cache first
        const cacheKey = CACHE_CONFIG.keys.reservation(id);
        const cached = this.cache.get(cacheKey);
        if (cached) {
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
     */
    async cancelReservation(id: number): Promise<boolean> {
        // Mock cancellation
        if (USE_MOCK_DATA) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            // Clear cache
            this.cache.delete(CACHE_CONFIG.keys.reservations);
            this.cache.delete(CACHE_CONFIG.keys.reservation(id));
            return true;
        }

        const context = createErrorContext("cancelReservation");

        try {
            await retryWithBackoff(
                () =>
                    this.axiosInstance.post(
                        API_CONFIG.endpoints.cancelReservation(id)
                    ),
                DEFAULT_RETRY_CONFIG
            );

            // Clear cache
            this.cache.delete(CACHE_CONFIG.keys.reservations);
            this.cache.delete(CACHE_CONFIG.keys.reservation(id));

            return true;
        } catch (error: any) {
            logError(error, context);
            throw error;
        }
    }

    /**
     * Clear the cache
     */
    clearCache(): void {
        this.cache.clear();
    }
}

