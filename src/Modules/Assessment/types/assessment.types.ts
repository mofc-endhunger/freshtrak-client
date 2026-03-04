/**
 * Assessment Module Types
 *
 * Reuses survey types from the Feedback module since both share the same
 * backend survey engine. Assessment-specific types define a simpler form
 * state (no overall_rating or comments).
 */

import type {
	SurveySubmitAnswer as _SurveySubmitAnswer,
	SurveySubmitRequest as _SurveySubmitRequest,
} from "../../Feedback/types/feedback.types";

export type {
	SurveyQuestion,
	SurveyQuestionOption,
	SurveySection,
	SurveyAnswerType,
	SurveyPreviousResponse,
	Survey,
	SurveyTrigger,
	SurveyProgress,
	SurveyEngine,
	ClientBundleResponse,
	SurveySubmitAnswer,
	SurveySubmitRequest,
	SurveySubmitResponse,
	FeedbackApiError,
	QuestionResponseDraft,
	QuestionResponsePayload,
	QuestionnaireRendererProps,
	QuestionRendererProps,
} from "../../Feedback/types/feedback.types";

export {
	isFormValid,
	isScaleQuestionType,
} from "../../Feedback/types/feedback.types";

// ============================================================================
// ASSESSMENT-SPECIFIC TYPES
// ============================================================================

export interface AssessmentFormState {
	responses: Map<number, { question_id: number; answer_value?: string }>;
}

export type AssessmentModalState =
	| "loading"
	| "form"
	| "submitting"
	| "confirmation"
	| "error"
	| "already_submitted"
	| "no_survey_found";

export interface AssessmentContainerProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmitComplete?: () => void;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const createInitialAssessmentFormState = (): AssessmentFormState => ({
	responses: new Map(),
});

export const buildAssessmentSubmitRequest = (
	formState: AssessmentFormState,
	surveyId: number,
	triggerId: number,
	isFinal = true,
): _SurveySubmitRequest => {
	const responses: _SurveySubmitAnswer[] = [];
	formState.responses.forEach((draft) => {
		const val = draft.answer_value?.trim();
		if (val !== undefined && val !== "") {
			responses.push({ question_id: draft.question_id, answer_value: val });
		}
	});
	return {
		survey_id: surveyId,
		trigger_id: triggerId,
		is_final: isFinal,
		responses,
	};
};

export const isAssessmentFormValid = (
	formState: AssessmentFormState,
	questions: { id: number; required: boolean }[] | null,
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
