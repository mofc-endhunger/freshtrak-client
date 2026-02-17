/**
 * Feedback API Service
 *
 * Service for fetching and submitting user feedback on visit experiences.
 * Aligned with backend PRD: docs/backend/feedback-prd.md
 *
 * ============================================================================
 * API ENDPOINTS:
 * ============================================================================
 *
 * Phase 1 (Current):
 *   GET  /reservations/:id/feedback - Returns questionnaire + existing feedback
 *   POST /reservations/:id/feedback - Submit rating + comments + responses
 *
 * Phase 2 (Survey Engine - Future):
 *   GET  /surveys/active?registration_id=123 - Get applicable survey
 *   POST /surveys/submit - Submit survey responses
 *
 * ============================================================================
 * MOCK MODE:
 * ============================================================================
 *
 * Set USE_MOCK_DATA = true to use mock implementations for development.
 * Set USE_MOCK_DATA = false to use real API endpoints.
 *
 * ============================================================================
 */

import { StorageService } from "../Utils/StorageService";
import axios, { AxiosInstance, AxiosError } from "axios";
import {
    FeedbackApiResponse,
    FeedbackSubmitRequest,
    FeedbackSubmitResponse,
    FeedbackApiError,
    Questionnaire,
    QuestionnaireQuestion,
    SurveyActiveResponse,
    SurveySubmitRequest,
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
        /** GET and POST feedback (id = reservation id) */
        feedback: (registrationId: number) => `api/reservations/${registrationId}/feedback`,
        surveysActive: "surveys/active",
        surveysSubmit: "surveys/submit",
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
const MOCK_FEEDBACK_STORAGE_KEY = "freshtrak_feedback_mock";

// ============================================================================
// MOCK DATA
// ============================================================================

/**
 * Mock questionnaire with one question of each type for testing.
 * Backend shape: id, type, options id/value/label/order.
 */
const MOCK_QUESTIONNAIRE: Questionnaire = {
    id: 1,
    version: 1,
    title: "Post-Event Feedback (All Question Types)",
    questions: [
        {
            id: 101,
            order: 1,
            type: "scale_1_5",
            prompt: "How satisfied were you with check-in? (scale 1–5)",
            required: true,
            options: [
                { id: 1, value: "1", label: "Very dissatisfied", order: 1 },
                { id: 2, value: "2", label: "Dissatisfied", order: 2 },
                { id: 3, value: "3", label: "Neutral", order: 3 },
                { id: 4, value: "4", label: "Satisfied", order: 4 },
                { id: 5, value: "5", label: "Very satisfied", order: 5 },
            ],
        },
        {
            id: 102,
            order: 2,
            type: "scale_1_10",
            prompt: "Rate your overall experience from 1 to 10.",
            required: false,
        },
        {
            id: 103,
            order: 3,
            type: "free_text",
            prompt: "Any additional comments? (free text)",
            required: false,
        },
        {
            id: 104,
            order: 4,
            type: "numeric",
            prompt: "How many people in your household did we serve? (numeric)",
            required: true,
        },
        {
            id: 105,
            order: 5,
            type: "decimal",
            prompt: "Estimated wait time in hours, if any (e.g. 0.5)? (decimal)",
            required: false,
        },
        {
            id: 106,
            order: 6,
            type: "multi_choice",
            prompt: "How did you hear about us? (radio – select one)",
            required: true,
            options: [
                { id: 10, value: "friend", label: "Friend or family", order: 1 },
                { id: 11, value: "social", label: "Social media", order: 2 },
                { id: 12, value: "flyer", label: "Flyer or poster", order: 3 },
                { id: 13, value: "211", label: "211 or referral", order: 4 },
                { id: 14, value: "other", label: "Other", order: 5 },
            ],
        },
        {
            id: 107,
            order: 7,
            type: "multiselect",
            prompt: "What types of food did you receive? (check all that apply)",
            required: false,
            options: [
                { id: 20, value: "produce", label: "Produce", order: 1 },
                { id: 21, value: "dairy", label: "Dairy", order: 2 },
                { id: 22, value: "protein", label: "Protein", order: 3 },
                { id: 23, value: "grains", label: "Grains", order: 4 },
                { id: 24, value: "shelf_stable", label: "Shelf-stable", order: 5 },
            ],
        },
        {
            id: 108,
            order: 8,
            type: "select_list",
            prompt: "Would you recommend this site to others? (dropdown)",
            required: true,
            options: [
                { id: 30, value: "yes", label: "Yes", order: 1 },
                { id: 31, value: "maybe", label: "Maybe", order: 2 },
                { id: 32, value: "no", label: "No", order: 3 },
            ],
        },
    ] as QuestionnaireQuestion[],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Simulate network delay
 */
const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Get mock feedback from localStorage
 */
const getMockFeedback = (registrationId: number): FeedbackApiResponse | null => {
    try {
        const data = localStorage.getItem(MOCK_FEEDBACK_STORAGE_KEY);
        if (!data) return null;

        const feedbacks: Record<string, FeedbackApiResponse> = JSON.parse(data);
        return feedbacks[String(registrationId)] || null;
    } catch {
        return null;
    }
};

/**
 * Store mock feedback in localStorage
 */
const storeMockFeedback = (registrationId: number, feedback: FeedbackApiResponse): void => {
    try {
        const data = localStorage.getItem(MOCK_FEEDBACK_STORAGE_KEY);
        const feedbacks: Record<string, FeedbackApiResponse> = data ? JSON.parse(data) : {};
        feedbacks[String(registrationId)] = feedback;
        localStorage.setItem(MOCK_FEEDBACK_STORAGE_KEY, JSON.stringify(feedbacks));
    } catch (error) {
        console.warn("Failed to store mock feedback:", error);
    }
};

// ============================================================================
// SERVICE CLASS
// ============================================================================

/**
 * Feedback API Service
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
     * Parse API error response
     */
    private parseError(error: AxiosError): FeedbackApiError {
        if (error.response) {
            const data = error.response.data as any;
            return {
                status: error.response.status,
                message: data?.message || "An error occurred",
                errors: data?.errors,
            };
        }
        return {
            status: 0,
            message: error.message || "Network error",
        };
    }

    // ========================================================================
    // PHASE 1: RESERVATION-BASED FEEDBACK
    // ========================================================================

    /**
     * Get feedback for a registration
     * GET /reservations/:id/feedback
     *
     * Returns existing feedback if submitted, or questionnaire scaffold if not.
     */
    async getFeedback(registrationId: number): Promise<FeedbackApiResponse> {
        if (USE_MOCK_DATA) {
            return this.getFeedbackMock(registrationId);
        }
        return this.getFeedbackReal(registrationId);
    }

    /**
     * Submit feedback
     * POST /reservations/:registrationId/feedback (id = reservation id, same as GET)
     */
    async submitFeedback(
        registrationId: number,
        data: FeedbackSubmitRequest
    ): Promise<FeedbackSubmitResponse> {
        if (USE_MOCK_DATA) {
            return this.submitFeedbackMock(registrationId, data);
        }
        return this.submitFeedbackReal(registrationId, data);
    }

    // ========================================================================
    // MOCK IMPLEMENTATIONS
    // ========================================================================

    private async getFeedbackMock(registrationId: number): Promise<FeedbackApiResponse> {
        await delay(MOCK_DELAY);

        const existing = getMockFeedback(registrationId);
        if (existing) {
            return existing;
        }

        // Return empty scaffold with survey instance id so client can POST
        return {
            id: registrationId,
            registration_id: registrationId,
            has_submitted: false,
            submitted_at: null,
            rating: null,
            comments: null,
            questionnaire: MOCK_QUESTIONNAIRE,
            responses: [],
        };
    }

    private async submitFeedbackMock(
        registrationId: number,
        data: FeedbackSubmitRequest
    ): Promise<FeedbackSubmitResponse> {
        await delay(MOCK_DELAY);

        const existing = getMockFeedback(registrationId);
        if (existing?.has_submitted) {
            const error: FeedbackApiError = {
                status: 409,
                message: "Feedback has already been submitted for this registration",
            };
            throw error;
        }

        if (data.rating < 1 || data.rating > 5) {
            const error: FeedbackApiError = {
                status: 422,
                message: "Validation error",
                errors: [{ field: "rating", message: "Rating must be between 1 and 5" }],
            };
            throw error;
        }

        const requiredQuestionIds = MOCK_QUESTIONNAIRE.questions
            .filter((q) => q.required)
            .map((q) => q.id);
        const answeredIds = new Set(data.responses.map((r) => r.question_id));
        const missing = requiredQuestionIds.filter((id) => !answeredIds.has(id));
        if (missing.length > 0) {
            const error: FeedbackApiError = {
                status: 422,
                message: "Validation error",
                errors: [{ field: "responses", message: "All required questions must be answered" }],
            };
            throw error;
        }

        const feedbackId = Date.now();
        const submittedAt = new Date().toISOString();

        const feedback: FeedbackApiResponse = {
            id: feedbackId,
            registration_id: registrationId,
            has_submitted: true,
            submitted_at: submittedAt,
            rating: data.rating,
            comments: data.comments || null,
            questionnaire: MOCK_QUESTIONNAIRE,
            responses: data.responses,
        };

        storeMockFeedback(registrationId, feedback);

        return {
            id: feedbackId,
            registration_id: registrationId,
            submitted_at: submittedAt,
            rating: data.rating,
            comments: data.comments || null,
        };
    }

    // ========================================================================
    // REAL API IMPLEMENTATIONS
    // ========================================================================

    private async getFeedbackReal(registrationId: number): Promise<FeedbackApiResponse> {
        try {
            const response = await this.axiosInstance.get<FeedbackApiResponse>(
                API_CONFIG.endpoints.feedback(registrationId)
            );
            return response.data;
        } catch (error) {
            throw this.parseError(error as AxiosError);
        }
    }

    private async submitFeedbackReal(
        registrationId: number,
        data: FeedbackSubmitRequest
    ): Promise<FeedbackSubmitResponse> {
        try {
            const response = await this.axiosInstance.post<FeedbackSubmitResponse>(
                API_CONFIG.endpoints.feedback(registrationId),
                data
            );
            return response.data;
        } catch (error) {
            throw this.parseError(error as AxiosError);
        }
    }

    // ========================================================================
    // PHASE 2: SURVEY ENGINE (FUTURE)
    // ========================================================================

    /**
     * Get active survey for a registration
     * GET /surveys/active?registration_id=123
     *
     * @future Phase 2 - Survey Engine
     */
    async getActiveSurvey(registrationId: number): Promise<SurveyActiveResponse> {
        if (USE_MOCK_DATA) {
            // Mock: No active survey
            await delay(MOCK_DELAY);
            return { has_active: false };
        }

        try {
            const response = await this.axiosInstance.get<SurveyActiveResponse>(
                API_CONFIG.endpoints.surveysActive,
                { params: { registration_id: registrationId } }
            );
            return response.data;
        } catch (error) {
            throw this.parseError(error as AxiosError);
        }
    }

    /**
     * Submit survey response
     * POST /surveys/submit
     *
     * @future Phase 2 - Survey Engine
     */
    async submitSurvey(data: SurveySubmitRequest): Promise<{ success: boolean; message: string }> {
        if (USE_MOCK_DATA) {
            await delay(MOCK_DELAY);
            return { success: true, message: "Survey submitted successfully" };
        }

        try {
            const response = await this.axiosInstance.post(
                API_CONFIG.endpoints.surveysSubmit,
                data
            );
            return response.data;
        } catch (error) {
            throw this.parseError(error as AxiosError);
        }
    }

    // ========================================================================
    // UTILITY METHODS
    // ========================================================================

    /**
     * Clear mock feedback data (for testing)
     */
    clearMockData(): void {
        localStorage.removeItem(MOCK_FEEDBACK_STORAGE_KEY);
    }

    /**
     * Check if mock mode is enabled
     */
    isMockMode(): boolean {
        return USE_MOCK_DATA;
    }
}

// Export singleton instance
export const feedbackApiService = new FeedbackApiService();
