/**
 * Feedback API Service
 *
 * Service for submitting user feedback on visit experiences.
 * Currently uses mock implementation - toggle USE_MOCK_DATA
 * to switch to real API when backend endpoint is available.
 *
 * ============================================================================
 * API INTEGRATION (Future):
 * ============================================================================
 *
 * Endpoint: POST /api/feedback
 * - Submits user feedback for a reservation
 * - Requires Bearer token authentication
 * - See docs/backend/FEEDBACK_API_REQUIREMENTS.md for full spec
 *
 * ============================================================================
 */

import { StorageService } from "../Utils/StorageService";
import axios, { AxiosInstance } from "axios";
import {
    FeedbackSubmissionRequest,
    FeedbackSubmissionResponse,
    FeedbackFormData,
} from "../Modules/Feedback/types";
import config from "../config";

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Toggle to enable/disable mock mode
 * Set to false when backend endpoint is available
 */
const USE_MOCK_DATA = true;

/**
 * Configuration for the Feedback API service
 */
const API_CONFIG = {
    baseUrl: config.REGISTRATION_API || "",
    endpoints: {
        submitFeedback: "api/feedback",
    },
    timeout: 30000,
};

/**
 * Mock delay in milliseconds
 */
const MOCK_DELAY = 500;

/**
 * LocalStorage key for storing mock feedback data
 */
const FEEDBACK_STORAGE_KEY = "freshtrak_feedback_submissions";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID for mock responses
 */
const generateMockId = (): string => {
    return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Simulate network delay
 */
const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Store feedback in localStorage for demo purposes
 */
const storeMockFeedback = (
    request: FeedbackSubmissionRequest,
    feedbackId: string
): void => {
    try {
        const existingData = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        const submissions = existingData ? JSON.parse(existingData) : [];

        submissions.push({
            id: feedbackId,
            ...request,
            submitted_at: new Date().toISOString(),
        });

        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(submissions));
    } catch (error) {
        console.warn("Failed to store mock feedback in localStorage:", error);
    }
};

// ============================================================================
// SERVICE CLASS
// ============================================================================

/**
 * Feedback API Service class
 */
export class FeedbackApiService {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: API_CONFIG.baseUrl,
            timeout: API_CONFIG.timeout,
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Add auth interceptor
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
    }

    /**
     * Get authentication token from storage
     */
    private getAuthToken(): string | null {
        try {
            const cognitoUser = StorageService.getCognitoUser();
            if (cognitoUser?.accessToken) {
                return cognitoUser.accessToken;
            }
            return null;
        } catch (error) {
            console.warn("Failed to get auth token:", error);
            return null;
        }
    }

    /**
     * Transform form data to API request format
     */
    private transformToApiRequest(
        formData: FeedbackFormData
    ): FeedbackSubmissionRequest {
        return {
            reservation_id: formData.reservationId,
            rating: formData.rating,
            tags: formData.experienceTags,
            feedback_text: formData.feedbackText,
        };
    }

    /**
     * Submit feedback (mock implementation)
     */
    private async submitFeedbackMock(
        request: FeedbackSubmissionRequest
    ): Promise<FeedbackSubmissionResponse> {
        // Simulate network delay
        await delay(MOCK_DELAY);

        // Validate request
        if (request.rating < 1 || request.rating > 5) {
            return {
                success: false,
                message: "Rating must be between 1 and 5",
            };
        }

        // Generate mock response
        const feedbackId = generateMockId();
        const timestamp = new Date().toISOString();

        // Store in localStorage for demo
        storeMockFeedback(request, feedbackId);

        return {
            success: true,
            message: "Feedback submitted successfully",
            feedback_id: feedbackId,
            timestamp,
        };
    }

    /**
     * Submit feedback (real API implementation)
     */
    private async submitFeedbackReal(
        request: FeedbackSubmissionRequest
    ): Promise<FeedbackSubmissionResponse> {
        try {
            const response = await this.axiosInstance.post<FeedbackSubmissionResponse>(
                API_CONFIG.endpoints.submitFeedback,
                request
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to submit feedback:", error);

            // Extract error message
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to submit feedback. Please try again.";

            return {
                success: false,
                message: errorMessage,
            };
        }
    }

    // ========================================================================
    // PUBLIC API METHODS
    // ========================================================================

    /**
     * Submit user feedback for a reservation
     *
     * @param formData - The feedback form data
     * @returns Promise<FeedbackSubmissionResponse>
     */
    async submitFeedback(
        formData: FeedbackFormData
    ): Promise<FeedbackSubmissionResponse> {
        const request = this.transformToApiRequest(formData);

        if (USE_MOCK_DATA) {
            return this.submitFeedbackMock(request);
        }

        return this.submitFeedbackReal(request);
    }

    /**
     * Get all submitted feedback from localStorage (mock only)
     * Useful for debugging/demo purposes
     */
    getMockSubmissions(): any[] {
        if (!USE_MOCK_DATA) {
            console.warn("getMockSubmissions only works in mock mode");
            return [];
        }

        try {
            const data = localStorage.getItem(FEEDBACK_STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    /**
     * Clear all mock submissions from localStorage
     * Useful for testing/demo reset
     */
    clearMockSubmissions(): void {
        localStorage.removeItem(FEEDBACK_STORAGE_KEY);
    }
}

// Export singleton instance
export const feedbackApiService = new FeedbackApiService();
