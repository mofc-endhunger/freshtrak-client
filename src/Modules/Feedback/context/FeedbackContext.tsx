/**
 * FeedbackContext
 *
 * Context provider for managing feedback form state and submission.
 * Aligned with backend PRD: docs/backend/feedback-prd.md
 *
 * ============================================================================
 * USAGE:
 * ============================================================================
 *
 * Wrap your feedback modal/container with the provider:
 *
 *   <FeedbackProvider
 *     registrationId={12345}
 *     onSubmitSuccess={() => { ... }}
 *   >
 *     <FeedbackModal />
 *   </FeedbackProvider>
 *
 * Then use the hook in child components:
 *
 *   const {
 *     questionnaire,
 *     formState,
 *     modalState,
 *     setRating,
 *     setComments,
 *     setQuestionResponse,
 *     submitFeedback,
 *   } = useFeedback();
 *
 * ============================================================================
 */

import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
	useEffect,
} from "react";
import {
	Questionnaire,
	FeedbackFormState,
	FeedbackModalState,
	FeedbackApiResponse,
	QuestionResponseDraft,
	QuestionResponsePayload,
	createInitialFormState,
	isFormValid,
	formStateToSubmitRequest,
} from "../types";
import { feedbackApiService } from "../../../Services/FeedbackApiService";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Context value interface
 */
interface FeedbackContextValue {
	/** Registration ID */
	registrationId: number;
	/** Feedback ID from GET response (used for POST request) */
	feedbackId: number | null;
	/** Questionnaire configuration (null while loading) */
	questionnaire: Questionnaire | null;
	/** Existing feedback data (if already submitted) */
	existingFeedback: FeedbackApiResponse | null;
	/** Current form state */
	formState: FeedbackFormState;
	/** Current modal state */
	modalState: FeedbackModalState;
	/** Whether form is valid for submission */
	canSubmit: boolean;
	/** Error message (if any) */
	error: string | null;
	/** Set overall rating (1-5) */
	setRating: (rating: number) => void;
	/** Set comments text */
	setComments: (comments: string) => void;
	/** Set question response (questionId, payload) */
	setQuestionResponse: (questionId: number, payload: QuestionResponsePayload) => void;
	/** Submit feedback */
	submitFeedback: () => Promise<boolean>;
	/** Reset form state */
	resetForm: () => void;
	/** Clear error */
	clearError: () => void;
	/** Reload feedback data */
	reload: () => Promise<void>;
}

/**
 * Provider props
 */
interface FeedbackProviderProps {
	/** Registration ID */
	registrationId: number;
	/** Callback on successful submission */
	onSubmitSuccess?: () => void;
	/** Callback on submission error */
	onSubmitError?: (error: string) => void;
	/** Children components */
	children: React.ReactNode;
}

// ============================================================================
// CONTEXT
// ============================================================================

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export const FeedbackProvider: React.FC<FeedbackProviderProps> = ({
	registrationId,
	onSubmitSuccess,
	onSubmitError,
	children,
}) => {
	// State
	const [feedbackId, setFeedbackId] = useState<number | null>(null);
	const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
	const [existingFeedback, setExistingFeedback] = useState<FeedbackApiResponse | null>(null);
	const [formState, setFormState] = useState<FeedbackFormState>(createInitialFormState());
	const [modalState, setModalState] = useState<FeedbackModalState>("loading");
	const [error, setError] = useState<string | null>(null);

	/**
	 * Load feedback data from API
	 */
	const loadFeedback = useCallback(async () => {
		setModalState("loading");
		setError(null);

		try {
			const response = await feedbackApiService.getFeedback(registrationId);

			setFeedbackId(response.id);
			setQuestionnaire(response.questionnaire);
			setExistingFeedback(response);

			// No renderable content: empty questions = misconfigured survey, show friendly message
			if (!response.questionnaire.questions?.length) {
				setModalState("no_survey_found");
				return;
			}

			if (response.has_submitted) {
				setModalState("already_submitted");
				const newFormState: FeedbackFormState = {
					rating: response.rating || 0,
					comments: response.comments || "",
					responses: new Map(
						response.responses.map((r) => [
							r.question_id,
							{
								question_id: r.question_id,
								scale_value: r.scale_value,
								answer_value: r.answer_value,
							},
						])
					),
				};
				setFormState(newFormState);
			} else {
				setModalState("form");
				const newFormState = createInitialFormState();
				response.questionnaire.questions.forEach((q) => {
					newFormState.responses.set(q.id, { question_id: q.id });
				});
				setFormState(newFormState);
			}
		} catch (err: any) {
			console.error("Failed to load feedback:", err);
			setError(err.message || "Failed to load feedback form");
			setModalState("error");
		}
	}, [registrationId]);

	/**
	 * Load feedback on mount
	 */
	useEffect(() => {
		loadFeedback();
	}, [loadFeedback]);

	/**
	 * Set overall rating
	 */
	const setRating = useCallback((rating: number) => {
		setFormState((prev) => ({ ...prev, rating }));
	}, []);

	/**
	 * Set comments
	 */
	const setComments = useCallback((comments: string) => {
		setFormState((prev) => ({ ...prev, comments }));
	}, []);

	/**
	 * Set question response
	 */
	const setQuestionResponse = useCallback((questionId: number, payload: QuestionResponsePayload) => {
		setFormState((prev) => {
			const newResponses = new Map(prev.responses);
			const existing = newResponses.get(questionId) ?? { question_id: questionId };
			const next: typeof existing = { ...existing };
			if ('scaleValue' in payload) next.scale_value = payload.scaleValue;
			if ('answerValue' in payload) next.answer_value = payload.answerValue;
			newResponses.set(questionId, next);
			return { ...prev, responses: newResponses };
		});
	}, []);

	/**
	 * Check if form can be submitted
	 */
	const canSubmit = useMemo(() => {
		return isFormValid(formState, questionnaire);
	}, [formState, questionnaire]);

	/**
	 * Submit feedback
	 */
	const submitFeedback = useCallback(async (): Promise<boolean> => {
		if (!canSubmit) {
			setError("Please complete all required fields");
			return false;
		}

		if (!questionnaire || !registrationId) {
			setError("No survey available");
			return false;
		}

		setModalState("submitting");
		setError(null);

		try {
			const request = formStateToSubmitRequest(formState);
			await feedbackApiService.submitFeedback(registrationId, request);
			setModalState("confirmation");
			onSubmitSuccess?.();
			return true;
		} catch (err: any) {
			console.error("Failed to submit feedback:", err);
			const errorMessage = err.message || "Failed to submit feedback";
			setError(errorMessage);
			setModalState("error");
			onSubmitError?.(errorMessage);
			return false;
		}
	}, [canSubmit, formState, questionnaire, registrationId, onSubmitSuccess, onSubmitError]);

	/**
	 * Reset form state
	 */
	const resetForm = useCallback(() => {
		const newFormState = createInitialFormState();
		if (questionnaire) {
			questionnaire.questions.forEach((q) => {
				newFormState.responses.set(q.id, { question_id: q.id });
			});
		}
		setFormState(newFormState);
		setError(null);
		setModalState("form");
	}, [questionnaire]);

	/**
	 * Clear error
	 */
	const clearError = useCallback(() => {
		setError(null);
		if (modalState === "error") {
			setModalState("form");
		}
	}, [modalState]);

	/**
	 * Reload feedback data
	 */
	const reload = useCallback(async () => {
		await loadFeedback();
	}, [loadFeedback]);

	// Context value
	const value = useMemo<FeedbackContextValue>(
		() => ({
			registrationId,
			feedbackId,
			questionnaire,
			existingFeedback,
			formState,
			modalState,
			canSubmit,
			error,
			setRating,
			setComments,
			setQuestionResponse,
			submitFeedback,
			resetForm,
			clearError,
			reload,
		}),
		[
			registrationId,
			feedbackId,
			questionnaire,
			existingFeedback,
			formState,
			modalState,
			canSubmit,
			error,
			setRating,
			setComments,
			setQuestionResponse,
			submitFeedback,
			resetForm,
			clearError,
			reload,
		]
	);

	return (
		<FeedbackContext.Provider value={value}>
			{children}
		</FeedbackContext.Provider>
	);
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access feedback context
 */
export const useFeedback = (): FeedbackContextValue => {
	const context = useContext(FeedbackContext);
	if (context === undefined) {
		throw new Error("useFeedback must be used within a FeedbackProvider");
	}
	return context;
};

export default FeedbackContext;
