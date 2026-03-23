/**
 * AssessmentContext
 *
 * Context provider for managing assessment survey form state and submission.
 * Uses the same backend survey engine as feedback:
 *   GET  /api/surveys/client-bundle?survey_type=assessment&language_id=...
 *   POST /api/surveys/submit
 */

import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
	useEffect,
} from "react";
import { useSelector } from "react-redux";
import type {
	ClientBundleResponse,
	SurveyQuestion,
	SurveySection,
	QuestionResponsePayload,
} from "../types";
import {
	AssessmentFormState,
	AssessmentModalState,
	createInitialAssessmentFormState,
	isAssessmentFormValid,
	buildAssessmentSubmitRequest,
} from "../types";
import { assessmentApiService } from "../../../Services/AssessmentApiService";
import { selectLanguage } from "../../../Store/languageSlice";
import { getLanguageOptionByCode } from "../../Localization/languageOptions";

// ============================================================================
// TYPES
// ============================================================================

interface AssessmentContextValue {
	bundle: ClientBundleResponse | null;
	questions: SurveyQuestion[];
	sections: SurveySection[];
	surveyTitle: string;
	formState: AssessmentFormState;
	modalState: AssessmentModalState;
	currentSectionIndex: number;
	totalSections: number;
	canSubmit: boolean;
	error: string | null;
	setQuestionResponse: (
		questionId: number,
		payload: QuestionResponsePayload,
	) => void;
	submitAssessment: () => Promise<boolean>;
	saveProgress: () => void;
	resetForm: () => void;
	clearError: () => void;
	reload: () => Promise<void>;
	goToNextSection: () => void;
	skipSection: () => void;
}

interface AssessmentProviderProps {
	onSubmitSuccess?: () => void;
	onSubmitError?: (error: string) => void;
	children: React.ReactNode;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AssessmentContext = createContext<AssessmentContextValue | undefined>(
	undefined,
);

// ============================================================================
// PROVIDER
// ============================================================================

export const AssessmentProvider: React.FC<AssessmentProviderProps> = ({
	onSubmitSuccess,
	onSubmitError,
	children,
}) => {
	const currentLanguage = useSelector(selectLanguage) as string;

	const [bundle, setBundle] = useState<ClientBundleResponse | null>(null);
	const [formState, setFormState] = useState<AssessmentFormState>(
		createInitialAssessmentFormState(),
	);
	const [modalState, setModalState] =
		useState<AssessmentModalState>("loading");
	const [error, setError] = useState<string | null>(null);
	const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

	const sections = useMemo<SurveySection[]>(() => {
		if (!bundle?.engine?.sections?.length) {
			if (!bundle?.survey?.questions?.length) return [];
			return [
				{
					id: null,
					order: 0,
					title: null,
					questions: [...bundle.survey.questions].sort(
						(a, b) => a.order - b.order,
					),
				},
			];
		}
		return [...bundle.engine.sections].sort((a, b) => a.order - b.order);
	}, [bundle]);

	const totalSections = sections.length;

	const questions = useMemo<SurveyQuestion[]>(() => {
		if (!bundle?.survey?.questions) return [];
		return [...bundle.survey.questions].sort((a, b) => a.order - b.order);
	}, [bundle]);

	const surveyTitle = bundle?.survey?.title ?? "";

	const loadBundle = useCallback(async () => {
		setModalState("loading");
		setError(null);

		const langOption = getLanguageOptionByCode(currentLanguage);
		const languageId = langOption?.id ?? 1;

		try {
			const response =
				await assessmentApiService.getClientBundle(languageId);
			setBundle(response);

			if (
				!response.has_active ||
				!response.survey?.questions?.length
			) {
				setModalState("no_survey_found");
				return;
			}

			if (response.progress?.status === "completed") {
				setModalState("already_submitted");
				return;
			}

			setModalState("form");
			const newFormState = createInitialAssessmentFormState();
			const prevMap = new Map<number, string>();
			(response.survey.previous_responses ?? []).forEach((pr) => {
				if (pr.question_id && pr.answer_value) {
					prevMap.set(pr.question_id, pr.answer_value);
				}
			});
			response.survey.questions.forEach((q) => {
				const prev = prevMap.get(q.id);
				newFormState.responses.set(q.id, {
					question_id: q.id,
					...(prev !== undefined && { answer_value: prev }),
				});
			});
			setFormState(newFormState);

			// Resume from last saved section
			if (response.progress?.next_section_id != null) {
				const savedSections = response.engine?.sections
					? [...response.engine.sections].sort(
							(a, b) => a.order - b.order,
						)
					: [];
				const idx = savedSections.findIndex(
					(s) => s.id === response.progress.next_section_id,
				);
				if (idx >= 0) setCurrentSectionIndex(idx);
			}
		} catch (err: any) {
			console.error("Failed to load assessment bundle:", err);
			setError(err.message || "Failed to load assessment");
			setModalState("error");
		}
	}, [currentLanguage]);

	useEffect(() => {
		loadBundle();
	}, [loadBundle]);

	const setQuestionResponse = useCallback(
		(questionId: number, payload: QuestionResponsePayload) => {
			setFormState((prev) => {
				const newResponses = new Map(prev.responses);
				const existing = newResponses.get(questionId) ?? {
					question_id: questionId,
				};
				newResponses.set(questionId, {
					...existing,
					answer_value: payload.answerValue,
				});
				return { ...prev, responses: newResponses };
			});
		},
		[],
	);

	const canSubmit = useMemo(() => {
		const currentQuestions =
			sections[currentSectionIndex]?.questions ?? [];
		return isAssessmentFormValid(
			formState,
			currentQuestions.length > 0 ? currentQuestions : null,
		);
	}, [formState, sections, currentSectionIndex]);

	const goToNextSection = useCallback(() => {
		if (currentSectionIndex < totalSections - 1) {
			setCurrentSectionIndex((prev) => prev + 1);
		}
	}, [currentSectionIndex, totalSections]);

	const skipSection = useCallback(() => {
		if (currentSectionIndex < totalSections - 1) {
			setCurrentSectionIndex((prev) => prev + 1);
		}
	}, [currentSectionIndex, totalSections]);

	const submitAssessment = useCallback(async (): Promise<boolean> => {
		if (!bundle?.survey) {
			setError("No survey available");
			return false;
		}

		setModalState("submitting");
		setError(null);

		try {
			const request = buildAssessmentSubmitRequest(
				formState,
				bundle.survey.id,
				bundle.trigger.id,
				true,
			);
			await assessmentApiService.submitSurvey(request);
			setModalState("confirmation");
			onSubmitSuccess?.();
			return true;
		} catch (err: any) {
			console.error("Failed to submit assessment:", err);
			const errorMessage =
				err.message || "Failed to submit assessment";
			setError(errorMessage);
			setModalState("error");
			onSubmitError?.(errorMessage);
			return false;
		}
	}, [formState, bundle, onSubmitSuccess, onSubmitError]);

	const saveProgress = useCallback(() => {
		if (!bundle?.survey) return;
		const hasAnyAnswer = Array.from(formState.responses.values()).some(
			(d) => d.answer_value?.trim(),
		);
		if (!hasAnyAnswer) return;

		const request = buildAssessmentSubmitRequest(
			formState,
			bundle.survey.id,
			bundle.trigger.id,
			false,
		);
		assessmentApiService.submitSurvey(request).catch((err) => {
			console.warn("Failed to save assessment progress:", err);
		});
	}, [formState, bundle]);

	const resetForm = useCallback(() => {
		const newFormState = createInitialAssessmentFormState();
		if (bundle?.survey?.questions) {
			bundle.survey.questions.forEach((q) => {
				newFormState.responses.set(q.id, { question_id: q.id });
			});
		}
		setFormState(newFormState);
		setError(null);
		setCurrentSectionIndex(0);
		setModalState("form");
	}, [bundle]);

	const clearError = useCallback(() => {
		setError(null);
		if (modalState === "error") {
			setModalState("form");
		}
	}, [modalState]);

	const reload = useCallback(async () => {
		await loadBundle();
	}, [loadBundle]);

	const value = useMemo<AssessmentContextValue>(
		() => ({
			bundle,
			questions,
			sections,
			surveyTitle,
			formState,
			modalState,
			currentSectionIndex,
			totalSections,
			canSubmit,
			error,
			setQuestionResponse,
			submitAssessment,
			saveProgress,
			resetForm,
			clearError,
			reload,
			goToNextSection,
			skipSection,
		}),
		[
			bundle,
			questions,
			sections,
			surveyTitle,
			formState,
			modalState,
			currentSectionIndex,
			totalSections,
			canSubmit,
			error,
			setQuestionResponse,
			submitAssessment,
			saveProgress,
			resetForm,
			clearError,
			reload,
			goToNextSection,
			skipSection,
		],
	);

	return (
		<AssessmentContext.Provider value={value}>
			{children}
		</AssessmentContext.Provider>
	);
};

// ============================================================================
// HOOK
// ============================================================================

export const useAssessment = (): AssessmentContextValue => {
	const context = useContext(AssessmentContext);
	if (context === undefined) {
		throw new Error(
			"useAssessment must be used within an AssessmentProvider",
		);
	}
	return context;
};

export default AssessmentContext;
