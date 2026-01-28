/**
 * Feedback API Service
 *
 * Service for submitting user feedback on visit experiences.
 * Currently uses mock implementation - toggle USE_MOCK_DATA
 * to switch to real API when backend endpoint is available.
 *
 * ============================================================================
 * API INTEGRATION:
 * ============================================================================
 *
 * LEGACY ENDPOINTS (deprecated):
 * - POST /api/feedback - Submit feedback for a reservation
 *
 * NEW DYNAMIC FORM ENDPOINTS:
 * - GET  /api/feedback/forms/:id - Get form configuration
 * - GET  /api/feedback/forms/by-assignment - Get form by event/date/slot
 * - POST /api/feedback/sessions - Create or resume a session
 * - GET  /api/feedback/sessions/:id - Get session with responses
 * - POST /api/feedback/sessions/:id/responses - Submit responses
 *
 * See docs/backend/FEEDBACK_API_REQUIREMENTS.md for full spec
 * ============================================================================
 */

import { StorageService } from "../Utils/StorageService";
import axios, { AxiosInstance } from "axios";
import {
    FeedbackSubmissionRequest,
    FeedbackSubmissionResponse,
    FeedbackFormData,
    FeedbackForm,
    FeedbackFormQuestion,
    FeedbackFormQuestionTag,
    FeedbackSession,
    FeedbackResponse,
    FeedbackQuestionResponseDraft,
    CreateSessionRequest,
    SubmitResponsesRequest,
    SessionResponse,
    FormResponse,
    FormAssignmentLookup,
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
        // Legacy endpoint
        submitFeedback: "api/feedback",
        // New dynamic form endpoints
        getForm: "api/feedback/forms",
        getFormByAssignment: "api/feedback/forms/by-assignment",
        sessions: "api/feedback/sessions",
    },
    timeout: 30000,
};

/**
 * Mock delay in milliseconds
 */
const MOCK_DELAY = 500;

/**
 * LocalStorage keys for storing mock data
 */
const FEEDBACK_STORAGE_KEY = "freshtrak_feedback_submissions";
const SESSIONS_STORAGE_KEY = "freshtrak_feedback_sessions";
const RESPONSES_STORAGE_KEY = "freshtrak_feedback_responses";

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
// MOCK DATA FOR DYNAMIC FORMS
// ============================================================================

/**
 * Default mock form configuration
 * Matches the current hardcoded FeedbackModal structure for backward compatibility
 */
const MOCK_DEFAULT_FORM: FeedbackForm = {
    id: 1,
    name: "default_feedback_form",
    headerTitle: "Give Feedback",
    headerSubtitle: "Your feedback goes to your local food bank to assure you have a pleasant experience when getting resources.",
    isStandalone: false,
    allowMultipleResponses: false,
    isActive: true,
    questions: [
        {
            id: 1,
            feedbackFormId: 1,
            displayOrder: 1,
            starQuestion: "How was your visit on {date} to {location}?",
            tagPrompt: "Tell us about your experience.",
            isTagMultiSelect: true,
            commentPlaceholder: "Share your feedback...",
            isActive: true,
            tags: [
                { id: 1, feedbackFormQuestionId: 1, tagText: "Kind Volunteers", displayOrder: 1, isActive: true },
                { id: 2, feedbackFormQuestionId: 1, tagText: "Good Service", displayOrder: 2, isActive: true },
                { id: 3, feedbackFormQuestionId: 1, tagText: "Clean Space", displayOrder: 3, isActive: true },
                { id: 4, feedbackFormQuestionId: 1, tagText: "Quality Food", displayOrder: 4, isActive: true },
                { id: 5, feedbackFormQuestionId: 1, tagText: "Efficient Shoppers", displayOrder: 5, isActive: true },
            ],
        },
    ],
};

/**
 * Mock form with multiple questions (for testing dynamic rendering)
 */
const MOCK_MULTI_QUESTION_FORM: FeedbackForm = {
    id: 2,
    name: "detailed_feedback_form",
    headerTitle: "Tell Us About Your Experience",
    headerSubtitle: "We value your feedback and use it to improve our services.",
    isStandalone: false,
    allowMultipleResponses: false,
    isActive: true,
    questions: [
        {
            id: 10,
            feedbackFormId: 2,
            displayOrder: 1,
            starQuestion: "How would you rate your overall experience?",
            isTagMultiSelect: true,
            isActive: true,
            tags: [],
        },
        {
            id: 11,
            feedbackFormId: 2,
            displayOrder: 2,
            tagPrompt: "What did you like about your visit?",
            isTagMultiSelect: true,
            isActive: true,
            tags: [
                { id: 10, feedbackFormQuestionId: 11, tagText: "Friendly Staff", displayOrder: 1, isActive: true },
                { id: 11, feedbackFormQuestionId: 11, tagText: "Short Wait Time", displayOrder: 2, isActive: true },
                { id: 12, feedbackFormQuestionId: 11, tagText: "Good Selection", displayOrder: 3, isActive: true },
                { id: 13, feedbackFormQuestionId: 11, tagText: "Clean Facility", displayOrder: 4, isActive: true },
            ],
        },
        {
            id: 12,
            feedbackFormId: 2,
            displayOrder: 3,
            tagPrompt: "What could we improve?",
            isTagMultiSelect: true,
            isActive: true,
            tags: [
                { id: 20, feedbackFormQuestionId: 12, tagText: "More Food Options", displayOrder: 1, isActive: true },
                { id: 21, feedbackFormQuestionId: 12, tagText: "Shorter Wait", displayOrder: 2, isActive: true },
                { id: 22, feedbackFormQuestionId: 12, tagText: "Better Parking", displayOrder: 3, isActive: true },
                { id: 23, feedbackFormQuestionId: 12, tagText: "Extended Hours", displayOrder: 4, isActive: true },
            ],
        },
        {
            id: 13,
            feedbackFormId: 2,
            displayOrder: 4,
            commentPlaceholder: "Any additional comments or suggestions?",
            isTagMultiSelect: true,
            isActive: true,
            tags: [],
        },
    ],
};

/**
 * Map of mock forms by ID
 */
const MOCK_FORMS: Map<number, FeedbackForm> = new Map([
    [1, MOCK_DEFAULT_FORM],
    [2, MOCK_MULTI_QUESTION_FORM],
]);

/**
 * Mock form assignments (event/date/slot → form ID)
 */
const MOCK_ASSIGNMENTS: Array<{
    formId: number;
    eventId?: number;
    eventDateId?: number;
    eventSlotId?: number;
}> = [
    // Default: all events use form 1
    { formId: 1 },
];

/**
 * Generate a numeric ID for mock data
 */
const generateMockNumericId = (): number => {
    return Date.now() + Math.floor(Math.random() * 1000);
};

/**
 * Store session in localStorage
 */
const storeMockSession = (session: FeedbackSession): void => {
    try {
        const existingData = localStorage.getItem(SESSIONS_STORAGE_KEY);
        const sessions: FeedbackSession[] = existingData ? JSON.parse(existingData) : [];
        
        // Remove existing session with same ID if updating
        const filtered = sessions.filter(s => s.id !== session.id);
        filtered.push(session);
        
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.warn("Failed to store mock session:", error);
    }
};

/**
 * Get session from localStorage
 */
const getMockSession = (sessionId: number): FeedbackSession | null => {
    try {
        const data = localStorage.getItem(SESSIONS_STORAGE_KEY);
        if (!data) return null;
        
        const sessions: FeedbackSession[] = JSON.parse(data);
        return sessions.find(s => s.id === sessionId) || null;
    } catch {
        return null;
    }
};

/**
 * Store responses in localStorage
 */
const storeMockResponses = (sessionId: number, responses: FeedbackResponse[]): void => {
    try {
        const existingData = localStorage.getItem(RESPONSES_STORAGE_KEY);
        const allResponses: FeedbackResponse[] = existingData ? JSON.parse(existingData) : [];
        
        // Remove existing responses for this session
        const filtered = allResponses.filter(r => r.feedbackSessionId !== sessionId);
        filtered.push(...responses);
        
        localStorage.setItem(RESPONSES_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.warn("Failed to store mock responses:", error);
    }
};

/**
 * Get responses for a session from localStorage
 */
const getMockResponses = (sessionId: number): FeedbackResponse[] => {
    try {
        const data = localStorage.getItem(RESPONSES_STORAGE_KEY);
        if (!data) return [];
        
        const responses: FeedbackResponse[] = JSON.parse(data);
        return responses.filter(r => r.feedbackSessionId === sessionId);
    } catch {
        return [];
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

    // ========================================================================
    // NEW DYNAMIC FORM API METHODS
    // ========================================================================

    /**
     * Get form configuration by ID
     */
    async getForm(formId: number): Promise<FormResponse> {
        if (USE_MOCK_DATA) {
            return this.getFormMock(formId);
        }
        return this.getFormReal(formId);
    }

    /**
     * Get form by assignment (event/date/slot lookup)
     */
    async getFormByAssignment(params: FormAssignmentLookup): Promise<FormResponse> {
        if (USE_MOCK_DATA) {
            return this.getFormByAssignmentMock(params);
        }
        return this.getFormByAssignmentReal(params);
    }

    /**
     * Create a new feedback session
     */
    async createSession(request: CreateSessionRequest): Promise<SessionResponse> {
        if (USE_MOCK_DATA) {
            return this.createSessionMock(request);
        }
        return this.createSessionReal(request);
    }

    /**
     * Get session with existing responses (for resume)
     */
    async getSession(sessionId: number): Promise<SessionResponse> {
        if (USE_MOCK_DATA) {
            return this.getSessionMock(sessionId);
        }
        return this.getSessionReal(sessionId);
    }

    /**
     * Submit responses for a session
     */
    async submitSessionResponses(request: SubmitResponsesRequest): Promise<SessionResponse> {
        if (USE_MOCK_DATA) {
            return this.submitSessionResponsesMock(request);
        }
        return this.submitSessionResponsesReal(request);
    }

    // ========================================================================
    // MOCK IMPLEMENTATIONS FOR DYNAMIC FORMS
    // ========================================================================

    private async getFormMock(formId: number): Promise<FormResponse> {
        await delay(MOCK_DELAY);

        const form = MOCK_FORMS.get(formId);
        if (!form) {
            return {
                success: false,
                message: `Form with ID ${formId} not found`,
            };
        }

        return {
            success: true,
            message: "Form retrieved successfully",
            form,
        };
    }

    private async getFormByAssignmentMock(params: FormAssignmentLookup): Promise<FormResponse> {
        await delay(MOCK_DELAY);

        // Find matching assignment (most specific first)
        let matchedFormId: number | null = null;

        for (const assignment of MOCK_ASSIGNMENTS) {
            // Check for exact slot match
            if (params.eventSlotId && assignment.eventSlotId === params.eventSlotId) {
                matchedFormId = assignment.formId;
                break;
            }
            // Check for date match
            if (params.eventDateId && assignment.eventDateId === params.eventDateId) {
                matchedFormId = assignment.formId;
                break;
            }
            // Check for event match
            if (params.eventId && assignment.eventId === params.eventId) {
                matchedFormId = assignment.formId;
                break;
            }
            // Default assignment (no specific event/date/slot)
            if (!assignment.eventId && !assignment.eventDateId && !assignment.eventSlotId) {
                matchedFormId = assignment.formId;
            }
        }

        if (!matchedFormId) {
            // Fall back to default form
            matchedFormId = 1;
        }

        const form = MOCK_FORMS.get(matchedFormId);
        if (!form) {
            return {
                success: false,
                message: "No form found for this assignment",
            };
        }

        return {
            success: true,
            message: "Form retrieved successfully",
            form,
        };
    }

    private async createSessionMock(request: CreateSessionRequest): Promise<SessionResponse> {
        await delay(MOCK_DELAY);

        const now = new Date().toISOString();
        const session: FeedbackSession = {
            id: generateMockNumericId(),
            feedbackFormId: request.feedbackFormId,
            eventId: request.eventId,
            eventDateId: request.eventDateId,
            eventSlotId: request.eventSlotId,
            createdAt: now,
            updatedAt: now,
            responses: [],
        };

        storeMockSession(session);

        return {
            success: true,
            message: "Session created successfully",
            session,
        };
    }

    private async getSessionMock(sessionId: number): Promise<SessionResponse> {
        await delay(MOCK_DELAY);

        const session = getMockSession(sessionId);
        if (!session) {
            return {
                success: false,
                message: `Session with ID ${sessionId} not found`,
            };
        }

        // Attach responses
        session.responses = getMockResponses(sessionId);

        return {
            success: true,
            message: "Session retrieved successfully",
            session,
        };
    }

    private async submitSessionResponsesMock(request: SubmitResponsesRequest): Promise<SessionResponse> {
        await delay(MOCK_DELAY);

        const session = getMockSession(request.sessionId);
        if (!session) {
            return {
                success: false,
                message: `Session with ID ${request.sessionId} not found`,
            };
        }

        // Validate responses
        for (const draft of request.responses) {
            if (draft.starRating !== undefined && (draft.starRating < 1 || draft.starRating > 5)) {
                return {
                    success: false,
                    message: "Star rating must be between 1 and 5",
                };
            }
        }

        // Convert drafts to responses
        const now = new Date().toISOString();
        const responses: FeedbackResponse[] = request.responses.map((draft) => ({
            id: generateMockNumericId(),
            feedbackSessionId: request.sessionId,
            feedbackFormQuestionId: draft.questionId,
            starRating: draft.starRating,
            commentText: draft.commentText,
            createdAt: now,
            selectedTags: draft.selectedTagIds.map((tagId) => ({
                id: generateMockNumericId(),
                feedbackResponseId: 0, // Will be set properly in real API
                feedbackFormQuestionTagId: tagId,
                createdAt: now,
            })),
        }));

        // Store responses
        storeMockResponses(request.sessionId, responses);

        // Mark session as completed
        session.completedAt = now;
        session.updatedAt = now;
        session.responses = responses;
        storeMockSession(session);

        return {
            success: true,
            message: "Feedback submitted successfully",
            session,
        };
    }

    // ========================================================================
    // REAL API IMPLEMENTATIONS FOR DYNAMIC FORMS
    // ========================================================================

    private async getFormReal(formId: number): Promise<FormResponse> {
        try {
            const response = await this.axiosInstance.get<FormResponse>(
                `${API_CONFIG.endpoints.getForm}/${formId}`
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to get form:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Failed to get form configuration",
            };
        }
    }

    private async getFormByAssignmentReal(params: FormAssignmentLookup): Promise<FormResponse> {
        try {
            const response = await this.axiosInstance.get<FormResponse>(
                API_CONFIG.endpoints.getFormByAssignment,
                { params }
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to get form by assignment:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Failed to get form configuration",
            };
        }
    }

    private async createSessionReal(request: CreateSessionRequest): Promise<SessionResponse> {
        try {
            const response = await this.axiosInstance.post<SessionResponse>(
                API_CONFIG.endpoints.sessions,
                request
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to create session:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Failed to create feedback session",
            };
        }
    }

    private async getSessionReal(sessionId: number): Promise<SessionResponse> {
        try {
            const response = await this.axiosInstance.get<SessionResponse>(
                `${API_CONFIG.endpoints.sessions}/${sessionId}`
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to get session:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Failed to get feedback session",
            };
        }
    }

    private async submitSessionResponsesReal(request: SubmitResponsesRequest): Promise<SessionResponse> {
        try {
            const response = await this.axiosInstance.post<SessionResponse>(
                `${API_CONFIG.endpoints.sessions}/${request.sessionId}/responses`,
                { responses: request.responses }
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to submit responses:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Failed to submit feedback",
            };
        }
    }

    // ========================================================================
    // UTILITY METHODS
    // ========================================================================

    /**
     * Clear all mock data (for testing/demo reset)
     */
    clearAllMockData(): void {
        localStorage.removeItem(FEEDBACK_STORAGE_KEY);
        localStorage.removeItem(SESSIONS_STORAGE_KEY);
        localStorage.removeItem(RESPONSES_STORAGE_KEY);
    }

    /**
     * Get mock form for testing (mock mode only)
     */
    getMockForm(formId: number): FeedbackForm | undefined {
        if (!USE_MOCK_DATA) {
            console.warn("getMockForm only works in mock mode");
            return undefined;
        }
        return MOCK_FORMS.get(formId);
    }
}

// Export singleton instance
export const feedbackApiService = new FeedbackApiService();
