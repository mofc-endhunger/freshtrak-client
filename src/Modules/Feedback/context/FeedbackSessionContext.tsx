/**
 * FeedbackSessionContext
 *
 * Context provider for managing feedback form sessions and responses.
 * Handles session creation, response tracking, and submission.
 *
 * ============================================================================
 * USAGE:
 * ============================================================================
 *
 * Wrap your feedback modal/container with the provider:
 *
 *   <FeedbackSessionProvider
 *     form={formConfig}
 *     eventId={eventId}
 *     onSubmitSuccess={() => { ... }}
 *   >
 *     <FeedbackModal />
 *   </FeedbackSessionProvider>
 *
 * Then use the hook in child components:
 *
 *   const {
 *     form,
 *     session,
 *     responses,
 *     updateResponse,
 *     submitFeedback,
 *     isSubmitting,
 *   } = useFeedbackSession();
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
	FeedbackForm,
	FeedbackSession,
	FeedbackQuestionResponseDraft,
	CreateSessionRequest,
	SubmitResponsesRequest,
} from "../types";
import { feedbackApiService } from "../../../Services/FeedbackApiService";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Context value interface
 */
interface FeedbackSessionContextValue {
	/** Form configuration */
	form: FeedbackForm | null;
	/** Current session (null until created) */
	session: FeedbackSession | null;
	/** In-progress responses keyed by questionId */
	responses: Map<number, FeedbackQuestionResponseDraft>;
	/** Whether form/session is loading */
	isLoading: boolean;
	/** Whether submission is in progress */
	isSubmitting: boolean;
	/** Error message (if any) */
	error: string | null;
	/** Whether all required questions are answered */
	canSubmit: boolean;
	/** Update a response for a specific question */
	updateResponse: (questionId: number, response: FeedbackQuestionResponseDraft) => void;
	/** Get response for a specific question */
	getResponse: (questionId: number) => FeedbackQuestionResponseDraft;
	/** Submit all responses */
	submitFeedback: () => Promise<boolean>;
	/** Reset all responses */
	resetResponses: () => void;
	/** Clear error */
	clearError: () => void;
}

/**
 * Provider props
 */
interface FeedbackSessionProviderProps {
	/** Form configuration */
	form: FeedbackForm | null;
	/** Event ID for session */
	eventId?: number;
	/** Event date ID for session */
	eventDateId?: number;
	/** Event slot ID for session */
	eventSlotId?: number;
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

const FeedbackSessionContext = createContext<FeedbackSessionContextValue | undefined>(
	undefined
);

// ============================================================================
// PROVIDER
// ============================================================================

export const FeedbackSessionProvider: React.FC<FeedbackSessionProviderProps> = ({
	form,
	eventId,
	eventDateId,
	eventSlotId,
	onSubmitSuccess,
	onSubmitError,
	children,
}) => {
	// State
	const [session, setSession] = useState<FeedbackSession | null>(null);
	const [responses, setResponses] = useState<Map<number, FeedbackQuestionResponseDraft>>(
		new Map()
	);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Initialize empty responses for all questions when form changes
	 */
	useEffect(() => {
		if (form) {
			const initialResponses = new Map<number, FeedbackQuestionResponseDraft>();
			form.questions.forEach((question) => {
				initialResponses.set(question.id, {
					questionId: question.id,
					starRating: undefined,
					commentText: undefined,
					selectedTagIds: [],
				});
			});
			setResponses(initialResponses);
		} else {
			setResponses(new Map());
		}
		// Reset session when form changes
		setSession(null);
		setError(null);
	}, [form]);

	/**
	 * Create session when form is available
	 */
	useEffect(() => {
		const createSessionIfNeeded = async () => {
			if (!form || session) return;

			setIsLoading(true);
			try {
				const request: CreateSessionRequest = {
					feedbackFormId: form.id,
					eventId,
					eventDateId,
					eventSlotId,
				};
				const result = await feedbackApiService.createSession(request);
				if (result.success && result.session) {
					setSession(result.session);
				} else {
					setError(result.message || "Failed to create feedback session");
				}
			} catch (err: any) {
				setError(err.message || "Failed to create feedback session");
			} finally {
				setIsLoading(false);
			}
		};

		createSessionIfNeeded();
	}, [form, session, eventId, eventDateId, eventSlotId]);

	/**
	 * Update response for a specific question
	 */
	const updateResponse = useCallback(
		(questionId: number, response: FeedbackQuestionResponseDraft) => {
			setResponses((prev) => {
				const next = new Map(prev);
				next.set(questionId, response);
				return next;
			});
		},
		[]
	);

	/**
	 * Get response for a specific question
	 */
	const getResponse = useCallback(
		(questionId: number): FeedbackQuestionResponseDraft => {
			return (
				responses.get(questionId) || {
					questionId,
					starRating: undefined,
					commentText: undefined,
					selectedTagIds: [],
				}
			);
		},
		[responses]
	);

	/**
	 * Check if all required questions have responses
	 */
	const canSubmit = useMemo(() => {
		if (!form) return false;

		// For now, check if at least one question has a star rating
		// (matching current behavior where rating is required)
		for (const question of form.questions) {
			if (question.starQuestion) {
				const response = responses.get(question.id);
				if (response?.starRating && response.starRating >= 1) {
					return true;
				}
			}
		}

		// If no star questions exist, allow submission
		const hasStarQuestions = form.questions.some((q) => q.starQuestion);
		return !hasStarQuestions;
	}, [form, responses]);

	/**
	 * Submit all responses
	 */
	const submitFeedback = useCallback(async (): Promise<boolean> => {
		if (!session || !form) {
			setError("No active session");
			return false;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			const request: SubmitResponsesRequest = {
				sessionId: session.id,
				responses: Array.from(responses.values()).filter(
					(r) =>
						r.starRating !== undefined ||
						r.commentText ||
						r.selectedTagIds.length > 0
				),
			};

			const result = await feedbackApiService.submitSessionResponses(request);

			if (result.success) {
				if (result.session) {
					setSession(result.session);
				}
				onSubmitSuccess?.();
				return true;
			} else {
				const errorMsg = result.message || "Failed to submit feedback";
				setError(errorMsg);
				onSubmitError?.(errorMsg);
				return false;
			}
		} catch (err: any) {
			const errorMsg = err.message || "Failed to submit feedback";
			setError(errorMsg);
			onSubmitError?.(errorMsg);
			return false;
		} finally {
			setIsSubmitting(false);
		}
	}, [session, form, responses, onSubmitSuccess, onSubmitError]);

	/**
	 * Reset all responses
	 */
	const resetResponses = useCallback(() => {
		if (form) {
			const initialResponses = new Map<number, FeedbackQuestionResponseDraft>();
			form.questions.forEach((question) => {
				initialResponses.set(question.id, {
					questionId: question.id,
					starRating: undefined,
					commentText: undefined,
					selectedTagIds: [],
				});
			});
			setResponses(initialResponses);
		}
	}, [form]);

	/**
	 * Clear error
	 */
	const clearError = useCallback(() => {
		setError(null);
	}, []);

	// Context value
	const value = useMemo<FeedbackSessionContextValue>(
		() => ({
			form,
			session,
			responses,
			isLoading,
			isSubmitting,
			error,
			canSubmit,
			updateResponse,
			getResponse,
			submitFeedback,
			resetResponses,
			clearError,
		}),
		[
			form,
			session,
			responses,
			isLoading,
			isSubmitting,
			error,
			canSubmit,
			updateResponse,
			getResponse,
			submitFeedback,
			resetResponses,
			clearError,
		]
	);

	return (
		<FeedbackSessionContext.Provider value={value}>
			{children}
		</FeedbackSessionContext.Provider>
	);
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access feedback session context
 */
export const useFeedbackSession = (): FeedbackSessionContextValue => {
	const context = useContext(FeedbackSessionContext);
	if (context === undefined) {
		throw new Error(
			"useFeedbackSession must be used within a FeedbackSessionProvider"
		);
	}
	return context;
};

export default FeedbackSessionContext;
