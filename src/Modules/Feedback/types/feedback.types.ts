/**
 * Feedback Module Types
 *
 * Aligned with feedback-ui-integration.md (backend contract).
 * GET response and POST body use the same shape: question id, question_id, scale_value, options id/value/label/order.
 *
 *   GET  /reservations/:registrationId/feedback
 *   POST /reservations/:registrationId/feedback
 */

// ============================================================================
// BACKEND API TYPES (feedback-ui-integration.md)
// ============================================================================

/**
 * Question option shape from backend
 */
export interface FeedbackQuestionOption {
	id: number;
	value: string;
	label: string;
	order: number;
}

/**
 * Questionnaire question from backend
 */
export interface QuestionnaireQuestion {
	id: number;
	order: number;
	type: string;
	prompt: string;
	required: boolean;
	options?: FeedbackQuestionOption[];
	/** Same shape as options; API may send one or both (types_answer / survey payload) */
	answers?: FeedbackQuestionOption[];
}

/**
 * Questionnaire configuration from backend
 */
export interface Questionnaire {
	id: number;
	version: number;
	title: string;
	questions: QuestionnaireQuestion[];
}

/**
 * GET /reservations/:id/feedback response
 */
export interface FeedbackApiResponse {
	id: number | null;
	registration_id: number;
	has_submitted: boolean;
	submitted_at: string | null;
	rating: number | null;
	comments: string | null;
	questionnaire: Questionnaire;
	responses: Array<{
		question_id: number;
		scale_value?: number;
		answer_value?: string;
	}>;
}

/**
 * Single response item in POST body (backend only accepts question_id + scale_value)
 */
export interface FeedbackSubmitResponseItem {
	question_id: number;
	scale_value?: number;
}

/**
 * POST /reservations/:id/feedback request body
 */
export interface FeedbackSubmitRequest {
	rating: number;
	comments?: string;
	responses: FeedbackSubmitResponseItem[];
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
 * Keyed by question id.
 */
export interface QuestionResponseDraft {
	question_id: number;
	/** For scale/likert questions (1-5 or 1-10) */
	scale_value?: number;
	/** For numeric, multiselect, single choice (string value or comma-separated ids) */
	answer_value?: string;
}

/**
 * Complete feedback form state (before submission)
 */
export interface FeedbackFormState {
	rating: number;
	comments: string;
	/** Responses keyed by question id */
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
	/** Update question response (questionId, payload) */
	onQuestionResponseChange: (questionId: number, payload: QuestionResponsePayload) => void;
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
 * Payload for updating a single question response
 */
export type QuestionResponsePayload =
	| { scaleValue: number }
	| { answerValue: string };

/**
 * Props for QuestionnaireRenderer component
 */
export interface QuestionnaireRendererProps {
	questions: QuestionnaireQuestion[];
	responses: Map<number, QuestionResponseDraft>;
	onResponseChange: (questionId: number, payload: QuestionResponsePayload) => void;
	className?: string;
}

/**
 * Props for QuestionRenderer component
 */
export interface QuestionRendererProps {
	question: QuestionnaireQuestion;
	/** For scale/likert questions */
	value?: number;
	/** For numeric, multiselect, single choice */
	answerValue?: string;
	onChange: (payload: QuestionResponsePayload) => void;
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

/** Question types that use scale_value (1-5 or 1-10) — matches types_answer.answer_type_code */
const SCALE_TYPES = [
	'scale_1_5',
	'likert_5',
	'likert_10',
	'scale_1_10',
	'star_rating',
	'probability_5',
	'frequency_5',
	'agreement_5',
	'quality_5',
	'comparison_5',
	'emoji_rating',
];

export function isScaleQuestionType(type: string): boolean {
	return SCALE_TYPES.includes(type);
}

/**
 * Check if form is valid for submission
 */
export const isFormValid = (
	formState: FeedbackFormState,
	questionnaire: Questionnaire | null
): boolean => {
	if (!questionnaire) return true;

	for (const question of questionnaire.questions) {
		if (!question.required) continue;
		const draft = formState.responses.get(question.id);
		if (isScaleQuestionType(question.type)) {
			if (!draft?.scale_value || draft.scale_value < 1 || draft.scale_value > 5) {
				return false;
			}
		} else {
			// numeric, multiselect, single_choice, etc. use answer_value
			const av = draft?.answer_value?.trim();
			if (av === undefined || av === '') return false;
			if (question.type === 'numeric' && Number.isNaN(Number(av))) return false;
		}
	}
	return true;
};

/**
 * Convert form state to submit request (backend only accepts question_id + scale_value 1-5)
 */
export const formStateToSubmitRequest = (
	formState: FeedbackFormState,
	questionnaire: Questionnaire | null
): FeedbackSubmitRequest => {
	const responses: FeedbackSubmitResponseItem[] = [];
	if (!questionnaire) {
		return {
			rating: formState.rating,
			comments: formState.comments || undefined,
			responses: [],
		};
	}

	const getQuestion = (questionId: number) =>
		questionnaire.questions.find((q) => q.id === questionId);

	formState.responses.forEach((draft) => {
		const question = getQuestion(draft.question_id);

		// Scale / likert 1-5 (stored as scale_value)
		if (draft.scale_value !== undefined && draft.scale_value >= 1 && draft.scale_value <= 5) {
			responses.push({
				question_id: draft.question_id,
				scale_value: draft.scale_value,
			});
			return;
		}

		const answerStr = draft.answer_value?.trim();
		if (answerStr === undefined || answerStr === '') return;

		// Scale 1-10: map to 1-5 for backend (Max(5))
		const numVal = parseInt(answerStr, 10);
		if (
			question &&
			['likert_10', 'scale_1_10'].includes(question.type) &&
			Number.isFinite(numVal) &&
			numVal >= 1 &&
			numVal <= 10
		) {
			const scale1to5 = Math.round((numVal / 10) * 5) || 1;
			responses.push({
				question_id: draft.question_id,
				scale_value: Math.min(5, Math.max(1, scale1to5)),
			});
			return;
		}

		// Other types (choice, free text, numeric, multiselect): send scale_value 1 to indicate answered
		responses.push({
			question_id: draft.question_id,
			scale_value: 1,
		});
	});

	return {
		rating: Math.min(5, Math.max(1, formState.rating || 1)),
		comments: formState.comments || undefined,
		responses,
	};
};
