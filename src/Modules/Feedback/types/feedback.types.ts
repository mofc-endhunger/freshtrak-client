/**
 * Feedback Module Types
 *
 * TypeScript interfaces for the Feedback feature.
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
 */

// ============================================================================
// BACKEND API TYPES - Phase 1 (Questionnaire-based Feedback)
// ============================================================================

/**
 * Question type enum
 * Phase 1: Only 'scale_1_5' is supported
 * Phase 2 (Survey Engine): Will add 'radio', 'checkbox', 'short_text'
 */
export type QuestionType = 'scale_1_5' | 'radio' | 'checkbox' | 'short_text';

/**
 * Questionnaire question from backend
 * GET /reservations/:id/feedback → questionnaire.questions[]
 */
export interface QuestionnaireQuestion {
	/** Unique question identifier */
	id: number;
	/** Display order (1-indexed) */
	order: number;
	/** Question type - Phase 1 only supports 'scale_1_5' */
	type: QuestionType;
	/** Question prompt text */
	prompt: string;
	/** Whether this question is required */
	required: boolean;
	/** Minimum value (for scale types) */
	min_value?: number;
	/** Maximum value (for scale types) */
	max_value?: number;
}

/**
 * Questionnaire configuration from backend
 * GET /reservations/:id/feedback → questionnaire
 */
export interface Questionnaire {
	/** Questionnaire ID */
	id: number;
	/** Questionnaire version number */
	version: number;
	/** Questionnaire title (e.g., "Post-Event Feedback") */
	title: string;
	/** List of questions */
	questions: QuestionnaireQuestion[];
}

/**
 * Individual question response
 * Used in both GET response and POST request
 */
export interface QuestionnaireResponse {
	/** Question ID being answered */
	question_id: number;
	/** Scale value (1-5 for scale_1_5 type) */
	scale_value: number;
}

/**
 * GET /reservations/:id/feedback response
 * Returns existing feedback if submitted, or questionnaire scaffold if not
 */
export interface FeedbackApiResponse {
	/** Feedback ID (null if not yet submitted) */
	id: number | null;
	/** Registration/reservation ID */
	registration_id: number;
	/** Whether feedback has been submitted */
	has_submitted: boolean;
	/** Submission timestamp (null if not submitted) */
	submitted_at: string | null;
	/** Overall rating 1-5 (null if not submitted) */
	rating: number | null;
	/** Optional comments (null if not submitted) */
	comments: string | null;
	/** Questionnaire configuration */
	questionnaire: Questionnaire;
	/** Question responses (empty array if not submitted) */
	responses: QuestionnaireResponse[];
}

/**
 * POST /reservations/:id/feedback request body
 */
export interface FeedbackSubmitRequest {
	/** Overall rating (required, 1-5) */
	rating: number;
	/** Optional comments (max 1000 chars) */
	comments?: string;
	/** Question responses */
	responses: QuestionnaireResponse[];
}

/**
 * POST /reservations/:id/feedback success response
 */
export interface FeedbackSubmitResponse {
	/** Created feedback ID */
	id: number;
	/** Registration ID */
	registration_id: number;
	/** Submission timestamp */
	submitted_at: string;
	/** Submitted rating */
	rating: number;
	/** Submitted comments */
	comments: string | null;
}

/**
 * API error response shape
 */
export interface FeedbackApiError {
	/** HTTP status code */
	status: number;
	/** Error message */
	message: string;
	/** Validation errors (for 422) */
	errors?: Array<{
		field: string;
		message: string;
	}>;
}

// ============================================================================
// FRONTEND STATE TYPES
// ============================================================================

/**
 * In-memory state for a single question response (before submission)
 */
export interface QuestionResponseDraft {
	/** Question ID */
	questionId: number;
	/** Scale value (1-5, undefined if not answered) */
	scaleValue?: number;
}

/**
 * Complete feedback form state (before submission)
 */
export interface FeedbackFormState {
	/** Overall rating (1-5, 0 if not set) */
	rating: number;
	/** Comments text */
	comments: string;
	/** Question responses keyed by question ID */
	responses: Map<number, QuestionResponseDraft>;
}

/**
 * Feedback modal state machine
 */
export type FeedbackModalState = 'loading' | 'form' | 'submitting' | 'confirmation' | 'error' | 'already_submitted' | 'no_survey_found';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * Props for FeedbackContainer component
 */
export interface FeedbackContainerProps {
	/** Whether the feedback flow is open */
	isOpen: boolean;
	/** Callback to close the feedback flow */
	onClose: () => void;
	/** Registration/reservation ID */
	registrationId: number;
	/** Event/location name (for display) */
	locationName?: string;
	/** Visit date (for display) */
	visitDate?: string;
}

/**
 * Props for FeedbackModal component
 */
export interface FeedbackModalProps {
	/** Whether the modal is open */
	isOpen: boolean;
	/** Callback to close the modal */
	onClose: () => void;
	/** Callback when feedback is submitted */
	onSubmit: () => void;
	/** Questionnaire configuration */
	questionnaire: Questionnaire | null;
	/** Current form state */
	formState: FeedbackFormState;
	/** Update overall rating */
	onRatingChange: (rating: number) => void;
	/** Update comments */
	onCommentsChange: (comments: string) => void;
	/** Update question response */
	onQuestionResponseChange: (questionId: number, scaleValue: number) => void;
	/** Current modal state */
	modalState: FeedbackModalState;
	/** Error message (if any) */
	error?: string | null;
	/** Location name (for display) */
	locationName?: string;
	/** Visit date (for display) */
	visitDate?: string;
}

/**
 * Props for QuestionnaireRenderer component
 */
export interface QuestionnaireRendererProps {
	/** Questionnaire questions */
	questions: QuestionnaireQuestion[];
	/** Current responses keyed by question ID */
	responses: Map<number, QuestionResponseDraft>;
	/** Callback when a question response changes */
	onResponseChange: (questionId: number, scaleValue: number) => void;
	/** Additional CSS classes */
	className?: string;
}

/**
 * Props for QuestionRenderer component
 */
export interface QuestionRendererProps {
	/** Question configuration */
	question: QuestionnaireQuestion;
	/** Current response value (undefined if not answered) */
	value?: number;
	/** Callback when response changes */
	onChange: (value: number) => void;
	/** Additional CSS classes */
	className?: string;
}

/**
 * Props for FeedbackConfirmation component
 */
export interface FeedbackConfirmationProps {
	/** Whether the confirmation is open */
	isOpen: boolean;
	/** Callback to close the confirmation */
	onClose: () => void;
}

/**
 * Props for StarRating component
 */
export interface StarRatingProps {
	/** Current rating value (0-5, 0 means not selected) */
	value: number;
	/** Callback when rating changes */
	onChange?: (rating: number) => void;
	/** Whether the rating is read-only */
	readOnly?: boolean;
	/** Size of stars */
	size?: 'sm' | 'md' | 'lg';
	/** Additional CSS classes */
	className?: string;
}

// ============================================================================
// SURVEY ENGINE TYPES (Phase 2 - Future)
// ============================================================================

/**
 * Survey Engine: Answer option for radio/checkbox questions
 * @future Phase 2 - Survey Engine
 */
export interface AnswerOption {
	/** Option ID */
	id: number;
	/** Question ID this option belongs to */
	question_id: number;
	/** Option value */
	value: string;
	/** Display label */
	label: string;
	/** Display order */
	display_order: number;
}

/**
 * Survey Engine: GET /surveys/active response
 * @future Phase 2 - Survey Engine
 */
export interface SurveyActiveResponse {
	/** Whether a survey is available */
	has_active: boolean;
	/** Survey ID (if available) */
	survey_id?: number;
	/** Trigger ID (if available) */
	trigger_id?: number;
	/** Form configuration (if available) */
	form?: {
		id: number;
		title: string;
		description?: string;
		questions: Array<QuestionnaireQuestion & {
			options?: AnswerOption[];
		}>;
	};
}

/**
 * Survey Engine: POST /surveys/submit request
 * @future Phase 2 - Survey Engine
 */
export interface SurveySubmitRequest {
	/** Survey ID */
	survey_id: number;
	/** Trigger ID */
	trigger_id: number;
	/** Registration ID (optional) */
	registration_id?: number;
	/** Overall rating (optional) */
	overall_rating?: number;
	/** Comments (optional) */
	comments?: string;
	/** Question responses */
	responses: Array<{
		question_id: number;
		answer_value: string;
	}>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Create initial form state
 */
export const createInitialFormState = (): FeedbackFormState => ({
	rating: 0,
	comments: '',
	responses: new Map(),
});

/**
 * Check if form is valid for submission
 */
export const isFormValid = (
	formState: FeedbackFormState,
	questionnaire: Questionnaire | null
): boolean => {
	// Rating is required
	if (formState.rating < 1 || formState.rating > 5) {
		return false;
	}

	// Check required questions
	if (questionnaire) {
		for (const question of questionnaire.questions) {
			if (question.required) {
				const response = formState.responses.get(question.id);
				if (!response?.scaleValue || response.scaleValue < 1 || response.scaleValue > 5) {
					return false;
				}
			}
		}
	}

	return true;
};

/**
 * Convert form state to submit request
 */
export const formStateToSubmitRequest = (formState: FeedbackFormState): FeedbackSubmitRequest => ({
	rating: formState.rating,
	comments: formState.comments || undefined,
	responses: Array.from(formState.responses.values())
		.filter((r) => r.scaleValue !== undefined)
		.map((r) => ({
			question_id: r.questionId,
			scale_value: r.scaleValue!,
		})),
});
