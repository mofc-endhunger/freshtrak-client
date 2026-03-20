/**
 * Feedback Module Types
 *
 * Aligned with the new survey client-bundle API:
 *   GET  /api/surveys/client-bundle?registration_id=...&language_id=...
 *   POST /api/surveys/submit
 */

// ============================================================================
// CLIENT-BUNDLE RESPONSE (GET /api/surveys/client-bundle)
// ============================================================================

export interface SurveyAnswerType {
	id: number;
	name: string;
	code: string;
}

export interface SurveyQuestion {
	id: number;
	type: string;
	prompt: string;
	order: number;
	section_id: number | null;
	required: boolean;
	options: SurveyQuestionOption[];
	answerType: SurveyAnswerType;
}

export interface SurveyQuestionOption {
	id: number;
	value: string;
	label: string;
	display_order: number;
}

export interface SurveySection {
	id: number | null;
	order: number;
	title: string | null;
	questions: SurveyQuestion[];
}

export interface SurveyPreviousResponse {
	question_id: number;
	answer_id: number | null;
	answer_value: string | null;
	answer_text: string | null;
}

export interface Survey {
	id: number;
	title: string;
	language_id: number;
	questions: SurveyQuestion[];
	sections: SurveySection[];
	previous_responses: SurveyPreviousResponse[];
}

export interface SurveyTrigger {
	id: number;
	type: string;
}

export interface SurveyProgress {
	family_id: number;
	status: string;
	next_section_id: number | null;
}

export interface SurveyEngine {
	survey_id: number;
	language_id: number;
	sections: SurveySection[];
	questions: SurveyQuestion[];
	questionsById: Record<string, SurveyQuestion>;
	optionsByQuestionId: Record<string, SurveyQuestionOption[]>;
	rules: {
		skipLogic: any[];
		requiredByQuestionId: Record<string, boolean>;
	};
}

/** Full response from GET /api/surveys/client-bundle */
export interface ClientBundleResponse {
	has_active: boolean;
	survey: Survey;
	trigger: SurveyTrigger;
	progress: SurveyProgress;
	engine: SurveyEngine;
}

// ============================================================================
// SUBMIT REQUEST / RESPONSE (POST /api/surveys/submit)
// ============================================================================

export interface SurveySubmitAnswer {
	question_id: number;
	answer_value: string;
}

export interface SurveySubmitRequest {
	survey_id: number;
	trigger_id: number;
	registration_id?: number;
	is_final?: boolean;
	overall_rating?: number;
	comments?: string;
	responses: SurveySubmitAnswer[];
}

export interface SurveySubmitResponse {
	success: boolean;
	message: string;
}

// ============================================================================
// API ERROR
// ============================================================================

export interface FeedbackApiError {
	status: number;
	message: string;
	errors?: Array<{ field: string; message: string }>;
}

// ============================================================================
// FRONTEND STATE TYPES
// ============================================================================

/** In-memory draft for a single question before submission. */
export interface QuestionResponseDraft {
	question_id: number;
	answer_value?: string;
}

/** Complete form state before submission. */
export interface FeedbackFormState {
	overall_rating: number;
	comments: string;
	responses: Map<number, QuestionResponseDraft>;
}

export type FeedbackModalState =
	| "loading"
	| "form"
	| "submitting"
	| "confirmation"
	| "error"
	| "already_submitted"
	| "no_survey_found";

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface FeedbackContainerProps {
	isOpen: boolean;
	onClose: () => void;
	registrationId: number;
	locationName?: string;
	visitDate?: string;
	/** Called after the survey is successfully submitted as final */
	onSubmitComplete?: () => void;
}

export interface FeedbackModalProps {
	isOpen: boolean;
	onClose: () => void;
	locationName?: string;
	visitDate?: string;
}

export type QuestionResponsePayload = { answerValue: string };

export interface QuestionnaireRendererProps {
	questions: SurveyQuestion[];
	responses: Map<number, QuestionResponseDraft>;
	onResponseChange: (questionId: number, payload: QuestionResponsePayload) => void;
	className?: string;
}

export interface QuestionRendererProps {
	question: SurveyQuestion;
	answerValue?: string;
	onChange: (payload: QuestionResponsePayload) => void;
	className?: string;
}

export interface FeedbackConfirmationProps {
	isOpen: boolean;
	onClose: () => void;
}

export interface StarRatingProps {
	value: number;
	onChange?: (rating: number) => void;
	readOnly?: boolean;
	size?: "sm" | "md" | "lg";
	className?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const createInitialFormState = (): FeedbackFormState => ({
	overall_rating: 0,
	comments: "",
	responses: new Map(),
});

/** Question types where the answer is a numeric scale value */
const SCALE_TYPES = new Set([
	"likert_5",
	"likert_10",
	"scale_1_5",
	"scale_1_10",
	"star_rating",
]);

export function isScaleQuestionType(type: string): boolean {
	return SCALE_TYPES.has(type);
}

/** Check whether all required questions have an answer. */
export const isFormValid = (
	formState: FeedbackFormState,
	questions: SurveyQuestion[] | null,
): boolean => {
	if (!questions) return true;
	for (const q of questions) {
		if (!q.required) continue;
		const draft = formState.responses.get(q.id);
		const val = draft?.answer_value?.trim();
		if (val === undefined || val === "") return false;
	}
	return true;
};

/** Build the POST payload from form state. */
export const buildSubmitRequest = (
	formState: FeedbackFormState,
	surveyId: number,
	triggerId: number,
	registrationId: number,
	isFinal = true,
): SurveySubmitRequest => {
	const responses: SurveySubmitAnswer[] = [];
	formState.responses.forEach((draft) => {
		const val = draft.answer_value?.trim();
		if (val !== undefined && val !== "") {
			responses.push({ question_id: draft.question_id, answer_value: val });
		}
	});
	return {
		survey_id: surveyId,
		trigger_id: triggerId,
		registration_id: registrationId,
		is_final: isFinal,
		...(formState.overall_rating > 0 && { overall_rating: formState.overall_rating }),
		...(formState.comments.trim() && { comments: formState.comments.trim() }),
		responses,
	};
};
